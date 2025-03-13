const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/images/income/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "..", "image", "income", imageName);

  // ส่งไฟล์ภาพกลับไปให้กับผู้ใช้
  res.sendFile(imagePath);
});

router.get("/images/expense/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "..", "image", "expense", imageName);

  // ส่งไฟล์ภาพกลับไปให้กับผู้ใช้
  res.sendFile(imagePath);
});

module.exports = router;
