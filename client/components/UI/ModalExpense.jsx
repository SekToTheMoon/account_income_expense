import { useEffect, useState } from "react";
import axios from "axios";

const ModalExpense = ({ expense_id, onClose }) => {
  const [expenseData, setExpenseData] = useState(null);

  useEffect(() => {
    if (expense_id) {
      axios
        .get(
          `${import.meta.env.VITE_SERVER_URL}/api/expenses/${
            expense_id.payment_number
          }/${expense_id.group_sequence}`
        )
        .then((res) => setExpenseData(res.data))
        .catch((error) => console.error("fetchExpenseData", error));
    }
  }, [expense_id]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/60 z-50">
      <div className="bg-white rounded-lg shadow-lg w-2/3 p-5 h-2/3 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            รายละเอียดรายจ่าย
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 rounded-lg p-1"
          >
            ✕
          </button>
        </div>

        {expenseData ? (
          <div className="mt-3 space-y-2">
            <p className="text-gray-700">
              📄 <b>เลขที่บิล:</b> {expenseData.results[0].payment_number}
            </p>
            <p className="text-gray-700">
              🏦 <b>ธนาคาร:</b> {expenseData.results[0].name}
            </p>
            <p className="text-gray-700">
              💰 <b>จำนวนเงิน:</b> ฿{expenseData.results[0].amount}
            </p>
            <p className="text-gray-700">
              📅 <b>วันที่จ่าย:</b>{" "}
              {new Date(expenseData.results[0].payDate).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              📅 <b>วันที่ลงข้อมูล:</b>{" "}
              {new Date(expenseData.results[0].created_at).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              📅 <b>Vat:</b> {expenseData.results[0].vat == 1 ? "มี" : "ไม่มี"}
            </p>
            <p className="text-gray-700">
              📝 <b>รายละเอียด:</b> {expenseData.results[0].description}
            </p>
            <p className="text-gray-700">
              📎 <b>หลักฐาน:</b>{" "}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-96 overflow-y-auto">
                {expenseData.images.map((path) => (
                  <a
                    key={path.fileName}
                    href={`${import.meta.env.VITE_SERVER_URL}/images/expense/${
                      path.fileName
                    }`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-blue-500 underline"
                  >
                    <img
                      src={`${import.meta.env.VITE_SERVER_URL}/images/expense/${
                        path.fileName
                      }`}
                      alt={path.fileName}
                    />
                  </a>
                ))}
              </div>
            </p>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-5">กำลังโหลด...</p>
        )}

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalExpense;
