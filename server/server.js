const express = require("express");
const cors = require("cors");

const incomeRouter = require("./routes/income");
const expenseRouter = require("./routes/expense");
const accountRouter = require("./routes/account");
const imageRouter = require("./routes/image");

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint บันทึกรายรับ
app.use(incomeRouter);
app.use(expenseRouter);
app.use(accountRouter);
app.use(imageRouter);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
