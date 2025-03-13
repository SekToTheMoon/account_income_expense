const express = require("express");
const router = express.Router();
const { db } = require("../lib/mySql");

router.get("/api/accounts", async (req, res) => {
  const [bankAccount] = await db.query("SELECT id, name FROM account");

  res.json(bankAccount);
});

router.get("/api/balance", async (req, res) => {
  try {
    // ดึงข้อมูลบัญชีทั้งหมด พร้อมผลรวม balance
    const [balance] = await db.query("SELECT name, balance FROM account");
    const [[total]] = await db.query(
      "SELECT SUM(balance) AS totalBalance FROM account"
    );

    res.json({
      accounts: balance,
      totalBalance: total.totalBalance || 0, // ถ้าไม่มีข้อมูลให้เป็น 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
