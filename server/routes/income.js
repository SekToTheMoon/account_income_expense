const express = require("express");
const router = express.Router();
const { db } = require("../lib/mySql");
const { uploadIncome } = require("../lib/multer");
const fs = require("fs");
const path = require("path");

router.get("/api/incomes", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, account } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("e.bill_number LIKE ?");
      params.push(`%${search}%`);
    }

    if (account) {
      conditions.push("e.account = ?");
      params.push(account);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const query = `
      SELECT e.bill_number,e.group_sequence, a.name, e.amount, e.rcDate
      FROM incomes e
      JOIN account a ON e.account = a.id
      ${whereClause}
      ORDER BY e.rcDate DESC
      LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

    const [results] = await db.query(query, params);

    // ดึงจำนวนรายการทั้งหมดเพื่อคำนวณหน้าทั้งหมด
    const countQuery = `
      SELECT COUNT(*) as total FROM incomes e
      JOIN account a ON e.account = a.id
      ${whereClause}
    `;

    const [countResult] = await db.query(countQuery, params.slice(0, -2));
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: results,
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/incomes/:id/:group_sequence", async (req, res) => {
  try {
    const { id, group_sequence } = req.params;
    const [results] = await db.query(
      `
      SELECT e.bill_number,	e.group_sequence,	e.vat,	e.amount,	e.description, e.account,	e.rcDate,	e.created_at, a.name
      FROM (select * from incomes where bill_number = ?) as e
      JOIN account a ON e.account = a.id
      ORDER BY e.created_at DESC
    `,
      [id]
    );

    const [images] = await db.query(
      `
      SELECT fileName
      FROM incomes_img
      WHERE incomes_pk = ?
      and group_sequence = ?
    `,
      [id, group_sequence]
    );

    res.json({ results, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/api/incomes",
  uploadIncome.array("evidence_paths", 10),
  async (req, res) => {
    try {
      await db.beginTransaction();

      const {
        bill_number,
        group_sequence,
        account,
        amount,
        description,
        vat,
        rcDate,
      } = req.body;

      const evidencePaths = req.files.map((file) => file.filename);
      const vatValue = vat === "true" || vat === true ? 1 : 0;

      const sql = `INSERT INTO incomes 
      (bill_number, group_sequence, account, vat, amount, rcDate, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
      await db.query(sql, [
        bill_number,
        group_sequence,
        account,
        vatValue,
        amount,
        rcDate,
        description,
      ]);

      await Promise.all(
        evidencePaths.map((fileName) =>
          db.query(
            "INSERT INTO incomes_img (fileName, group_sequence, incomes_pk) VALUES (?, ?, ?)",
            [fileName, group_sequence, bill_number]
          )
        )
      );

      const sqlUpdate = `UPDATE account SET balance = balance + ? WHERE id = ?`;
      await db.query(sqlUpdate, [amount, account]);

      await db.commit();
      res.status(200).json({ success: true, data: { amount } });
    } catch (error) {
      console.error("/api/incomes", error);
      await db.rollback(); // ยกเลิก Transaction

      // ลบไฟล์ที่อัปโหลด
      req.files.forEach((file) => {
        const filePath = path.join(
          __dirname,
          "..",
          "image",
          "income",
          file.filename
        );
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Failed to delete file: ${filePath}`, err);
        });
      });
      res.status(500).json({ error: error.message });
    }
  }
);

router.put("/api/incomes/:id/:group_sequence", async (req, res) => {
  const { id, group_sequence } = req.params;
  const { amount, vat, description, rcDate, account } = req.body;

  try {
    await db.beginTransaction();

    // ดึงข้อมูลเก่าก่อนอัปเดต
    const [[oldIncome]] = await db.query(
      "SELECT amount, account FROM incomes WHERE bill_number = ?",
      [id]
    );

    if (!oldIncome) {
      return res.status(404).json({ error: "ไม่พบข้อมูลรายรับ" });
    }

    // คำนวณยอดเงินที่ต้องอัปเดตในบัญชี
    const amountDiff = oldIncome.amount - amount;

    // อัปเดตข้อมูลรายรับ
    await db.query(
      `UPDATE incomes 
       SET amount = ?, vat = ?, description = ?, rcDate = ?, account = ?
       WHERE bill_number = ? and group_sequence = ?`,
      [amount, vat, description, rcDate, account, id, group_sequence]
    );

    if (oldIncome.account == account) {
      // อัปเดตยอดเงินในบัญชีเดิม
      await db.query("UPDATE account SET balance = balance - ? WHERE id = ?", [
        amountDiff,
        oldIncome.account,
      ]);
    } else {
      // กรณีเปลี่ยนบัญชี:
      // 1. หักเงินออกจากบัญชีเก่า
      await db.query("UPDATE account SET balance = balance - ? WHERE id = ?", [
        oldIncome.amount,
        oldIncome.account,
      ]);

      // 2. เติมเงินเข้าบัญชีใหม่
      await db.query("UPDATE account SET balance = balance + ? WHERE id = ?", [
        amount,
        account,
      ]);
    }

    await db.commit();
    res.json({ success: true, message: "อัปเดตรายรับสำเร็จ" });
  } catch (error) {
    await db.rollback();
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/api/income/update-images",
  uploadIncome.array("files"),
  async (req, res) => {
    try {
      const { income_id, group_sequence } = req.body;
      const filePaths = req.files.map((file) => file.filename);

      // บันทึกลงฐานข้อมูล
      for (const file of filePaths) {
        await db.query(
          "INSERT INTO incomes_img (incomes_pk,group_sequence, fileName) VALUES (?,?, ?)",
          [income_id, group_sequence, file]
        );
      }

      res.json({ success: true, files: filePaths });
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.log(error);
    }
  }
);

router.delete("/api/income/delete-image", async (req, res) => {
  try {
    const { fileName } = req.body;
    const filePath = path.join(__dirname, "..", "image", "income", fileName);

    fs.unlinkSync(filePath);

    // ลบจากฐานข้อมูล
    await db.query("DELETE FROM incomes_img WHERE fileName = ?", [fileName]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
});

module.exports = router;
