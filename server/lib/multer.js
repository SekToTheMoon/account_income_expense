const multer = require("multer");
const path = require("path");
// Config Multer สำหรับเก็บไฟล์ในโฟลเดอร์ uploads

const generateFileName = (originalName) => {
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
  const randomNum = Math.floor(1000 + Math.random() * 9000); // เลข 4 หลัก
  const ext = path.extname(originalName); // ดึงนามสกุลไฟล์
  return `${formattedDate}_${randomNum}${ext}`;
};

const storageIncome = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "image", "income");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  },
});

const storageExpense = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "image", "expense");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  },
});

const uploadIncome = multer({ storage: storageIncome });
const uploadExpense = multer({ storage: storageExpense });

module.exports = { uploadIncome, uploadExpense };
