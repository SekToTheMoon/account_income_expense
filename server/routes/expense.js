const express = require("express");
const router = express.Router();
const { db } = require("../lib/mySql");
const { uploadExpense } = require("../lib/multer");
const fs = require("fs");
const path = require("path");

router.get("/api/expenses", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, account } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    // ตัวกรอง search
    if (search) {
      conditions.push("e.payment_number LIKE ?");
      params.push(`%${search}%`);
    }

    // ตัวกรอง account
    if (account) {
      conditions.push("e.account = ?");
      params.push(account);
    }

    // สร้าง where clause
    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // คำสั่ง SQL
    const query = `
      SELECT e.payment_number,e.group_sequence, a.name, e.amount, e.payDate
      FROM expenses e
      JOIN account a ON e.account = a.id
      ${whereClause}
      ORDER BY e.payDate DESC
      LIMIT ? OFFSET ?
    `;

    // เพิ่ม limit และ offset
    params.push(Number(limit), Number(offset));

    const [results] = await db.query(query, params);

    // ดึงจำนวนรายการทั้งหมดเพื่อคำนวณหน้าทั้งหมด
    const countQuery = `
      SELECT COUNT(*) as total
      FROM expenses e
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

router.get("/api/expenses/:id/:group_sequence", async (req, res) => {
  try {
    const { id, group_sequence } = req.params;
    const [results] = await db.query(
      `
      SELECT e.payment_number, e.group_sequence, e.vat, e.amount, e.description, e.account, e.payDate, e.created_at, a.name
      FROM (SELECT * FROM expenses WHERE payment_number = ?) AS e
      JOIN account a ON e.account = a.id
      ORDER BY e.created_at DESC
    `,
      [id]
    );

    const [images] = await db.query(
      `
      SELECT fileName
      FROM expenses_img
      WHERE expenses_pk = ? 
      AND group_sequence = ?
    `,
      [id, group_sequence]
    );

    res.json({ results, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/api/expenses",
  uploadExpense.array("evidence_paths", 10),
  async (req, res) => {
    try {
      await db.beginTransaction();

      const {
        payment_number,
        group_sequence,
        account,
        amount,
        description,
        vat,
        payDate,
      } = req.body;

      const evidencePaths = req.files.map((file) => file.filename);
      const vatValue = vat === "true" || vat === true ? 1 : 0;

      const sql = `INSERT INTO expenses 
      (payment_number, group_sequence, account, vat, amount, payDate, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
      await db.query(sql, [
        payment_number,
        group_sequence,
        account,
        vatValue,
        amount,
        payDate,
        description,
      ]);

      await Promise.all(
        evidencePaths.map((fileName) =>
          db.query(
            "INSERT INTO expenses_img (fileName,group_sequence, expenses_pk) VALUES (?, ?, ?)",
            [fileName, group_sequence, payment_number]
          )
        )
      );

      const sqlUpdate = `UPDATE account SET balance = balance - ? WHERE id = ?`;
      await db.query(sqlUpdate, [amount, account]);

      await db.commit();
      res.status(200).json({ success: true, data: { amount } });
    } catch (error) {
      console.error("/api/expenses", error);
      await db.rollback();

      req.files.forEach((file) => {
        const filePath = path.join(
          __dirname,
          "..",
          "image",
          "expense",
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

router.put("/api/expenses/:id/:group_sequence", async (req, res) => {
  const { id, group_sequence } = req.params;
  const { amount, vat, description, payDate, account } = req.body;

  try {
    await db.beginTransaction();

    // ดึงข้อมูลเก่าก่อนอัปเดต
    const [[oldExpense]] = await db.query(
      "SELECT amount, account FROM expenses WHERE payment_number = ?",
      [id]
    );

    if (!oldExpense) {
      return res.status(404).json({ error: "ไม่พบข้อมูลค่าใช้จ่าย" });
    }

    // คำนวณยอดเงินที่ต้องอัปเดตในบัญชี
    const amountDiff = oldExpense.amount - amount;

    // อัปเดตข้อมูลค่าใช้จ่าย
    await db.query(
      `UPDATE expenses 
       SET amount = ?, vat = ?, description = ?, payDate = ?, account = ? 
       WHERE payment_number = ? AND group_sequence = ?`,
      [amount, vat, description, payDate, account, id, group_sequence]
    );

    if (oldExpense.account == account) {
      // อัปเดตยอดเงินในบัญชีเดิม
      await db.query("UPDATE account SET balance = balance + ? WHERE id = ?", [
        amountDiff,
        oldExpense.account,
      ]);
    } else {
      // กรณีเปลี่ยนบัญชี:
      // 1. คืนเงินให้บัญชีเก่า
      await db.query("UPDATE account SET balance = balance + ? WHERE id = ?", [
        oldExpense.amount,
        oldExpense.account,
      ]);

      // 2. หักเงินจากบัญชีใหม่
      await db.query("UPDATE account SET balance = balance - ? WHERE id = ?", [
        amount,
        account,
      ]);
    }

    await db.commit();
    res.json({ success: true, message: "อัปเดตค่าใช้จ่ายสำเร็จ" });
  } catch (error) {
    await db.rollback();
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/api/expense/update-images",
  uploadExpense.array("files"),
  async (req, res) => {
    try {
      const { payment_number, group_sequence } = req.body;
      const filePaths = req.files.map((file) => file.filename);

      // บันทึกลงฐานข้อมูล
      for (const file of filePaths) {
        await db.query(
          "INSERT INTO expenses_img (expenses_pk,group_sequence, fileName) VALUES (?,?, ?)",
          [payment_number, group_sequence, file]
        );
      }

      res.json({ success: true, files: filePaths });
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.log(error);
    }
  }
);

router.delete("/api/expense/delete-image", async (req, res) => {
  try {
    const { fileName } = req.body;
    const filePath = path.join(__dirname, "..", "image", "expense", fileName);

    fs.unlinkSync(filePath);

    // ลบจากฐานข้อมูล
    await db.query("DELETE FROM expenses_img WHERE fileName = ?", [fileName]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
});

module.exports = router;
