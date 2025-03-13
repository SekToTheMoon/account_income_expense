const mysql = require("mysql2");
// MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "income_expense_db",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

const db = connection.promise();

module.exports = { db };
