const multer = require("multer");
const path = require("path");
// Config Multer สำหรับเก็บไฟล์ในโฟลเดอร์ uploads

const generateFileName = (originalName, id) => {
  const date = new Date();
  const formattedDate = Math.random().toString(36).substring(2, 15); // สุ่มชื่อไฟล์
  const ext = path.extname(originalName); // ดึงนามสกุลไฟล์
  return `${id}_${formattedDate}${ext}`;
};

const storageIncome = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "image", "income");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname, req.body.bill_number));
  },
});

const storageExpense = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "image", "expense");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname, req.body.payment_number));
  },
});

const uploadIncome = multer({ storage: storageIncome });
const uploadExpense = multer({ storage: storageExpense });

module.exports = { uploadIncome, uploadExpense };
