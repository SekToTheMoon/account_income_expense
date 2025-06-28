import { useState, useEffect } from "react";
import axios from "axios";
import SearchTable from "../../components/UI/SearchTable";
import ModalExpense from "../../components/UI/ModalExpense";
import ModalEditExpense from "../../components/UI/ModalEditExpense";
import accountOptions from "../../constants/account";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEditExpense, setSelectedEditExpense] = useState(null);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const url = `${import.meta.env.VITE_SERVER_URL}/api/expenses`;

  const fetchListExpense = async () => {
    try {
      const response = await axios.get(url, {
        params: {
          page,
          limit,
          account: selectedAccount || undefined,
        },
      });
      setExpenses(response.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchListExpense();
  }, [page, limit, selectedAccount]);

  const openModal = (payment_number, group_sequence) => {
    setSelectedExpense({ payment_number, group_sequence });
    setIsModalOpen(true);
  };

  const openEditModal = (payment_number, group_sequence) => {
    setSelectedEditExpense({ payment_number, group_sequence });
    setIsModalEditOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const closeEditModal = () => {
    setIsModalEditOpen(false);
    setSelectedEditExpense(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);
    setPage(1);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">รายการค่าใช้จ่าย</h2>
      {/* Dropdown Filter */}
      <div className="mb-4 flex items-center">
        <label htmlFor="accountFilter" className="mr-2">
          เลือกบัญชี:
        </label>
        <select
          id="accountFilter"
          value={selectedAccount}
          onChange={handleAccountChange}
          className="px-4 py-2 border rounded"
        >
          <option value="">ทั้งหมด</option>
          {accountOptions.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>
      <SearchTable url={url} setResult={setExpenses} />

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white shadow-md">
          <thead>
            <tr className="bg-green-200 text-gray-600">
              <th className="border p-2">เลขที่ใบจ่ายเงิน</th>
              <th className="border p-2">บัญชีจ่ายเงิน</th>
              <th className="border p-2">จำนวนเงิน</th>
              <th className="border p-2">วันที่</th>
              <th className="border p-2"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {expenses?.data?.length > 0 ? (
              expenses.data.map((expense) => (
                <tr key={expense.payment_number} className="hover:bg-gray-100">
                  <td className="border p-2 text-center">
                    {expense.payment_number}
                  </td>
                  <td className="border p-2 text-center">{expense.name}</td>
                  <td className="border p-2 text-center text-red-500">
                    ฿{new Intl.NumberFormat().format(expense.amount)}
                  </td>
                  <td className="border p-2 text-center">
                    {new Date(expense.payDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2 text-center">
                    <div className="flex justify-center space-x-2">
                      <div
                        onClick={() =>
                          openModal(
                            expense.payment_number,
                            expense.group_sequence
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 px-5 py-2.5 cursor-pointer"
                      >
                        View
                      </div>
                      <div
                        onClick={() =>
                          openEditModal(
                            expense.payment_number,
                            expense.group_sequence
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 px-5 py-2.5 rounded-lg border border-blue-600 cursor-pointer"
                      >
                        Edit
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="border p-2 text-center text-gray-500"
                >
                  ไม่มีข้อมูลค่าใช้จ่าย
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        {/* Limit dropdown */}
        <div className="mb-4 flex items-center">
          <select
            id="limit"
            value={limit}
            onChange={handleLimitChange}
            className="px-6 py-2 border border-gray-300 rounded"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
        {/* Pagination controls */}
        <div className="mt-4 flex justify-between gap-2 items-center">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          >
            Previous
          </button>
          <span className="self-center">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ModalExpense expense_id={selectedExpense} onClose={closeModal} />
      )}
      {isModalEditOpen && (
        <ModalEditExpense
          expense_id={selectedEditExpense}
          onClose={closeEditModal}
          onUpdate={fetchListExpense}
        />
      )}
    </div>
  );
};

export default ExpenseList;
