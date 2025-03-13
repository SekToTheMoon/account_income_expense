import { useState, useEffect } from "react";
import axios from "axios";
import SearchTable from "../../components/UI/SearchTable";
import ModalIncome from "../../components/UI/ModalIncome";
import ModalEditIncome from "../../components/UI/ModalEditIncome";
import accountOptions from "../../constants/account";

const IncomeList = () => {
  const [incomes, setIncomes] = useState([]);
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEditIncomeId, setselectedEditIncomeId] = useState(null);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Default limit
  const [totalPages, setTotalPages] = useState(1);

  const url = `${import.meta.env.VITE_SERVER_URL}/api/incomes`;

  const fetchListIncome = async () => {
    try {
      const response = await axios.get(url, {
        params: {
          page,
          limit,
          account: selectedAccount || undefined,
        },
      });
      setIncomes(response.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching incomes:", error);
    }
  };

  useEffect(() => {
    fetchListIncome();
  }, [page, limit, selectedAccount]); // Fetch new data when page or limit changes

  const openModal = (incomeId, group_sequence) => {
    setSelectedIncomeId({ incomeId, group_sequence });
    setIsModalOpen(true);
  };

  const openEditModal = (incomeId, group_sequence) => {
    setselectedEditIncomeId({ incomeId, group_sequence });
    setIsModalEditOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIncomeId(null);
  };

  const closeEditModal = () => {
    setIsModalEditOpen(false);
    setselectedEditIncomeId(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value)); // Set new limit and reset page to 1
    setPage(1);
  };

  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);
    setPage(1); // รีเซ็ตหน้าเมื่อเปลี่ยนบัญชี
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">รายการรายรับ</h2>
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
      <SearchTable url={url} setResult={setIncomes} />

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white shadow-md">
          <thead>
            <tr className="bg-green-200 text-gray-600">
              <th className="border p-2">เลขที่ใบวางบิล</th>
              <th className="border p-2">บัญชีรับเงิน</th>
              <th className="border p-2">จำนวนเงิน</th>
              <th className="border p-2">วันที่</th>
              <th className="border p-2"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {incomes?.data?.length > 0 ? (
              incomes.data.map((income) => (
                <tr key={income.bill_number} className="hover:bg-gray-100">
                  <td className="border p-2 text-center">
                    {income.bill_number}
                  </td>
                  <td className="border p-2 text-center">{income.name}</td>
                  <td className="border p-2 text-center text-green-500">
                    ฿{new Intl.NumberFormat().format(income.amount)}
                  </td>
                  <td className="border p-2 text-center">
                    {new Date(income.rcDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2 text-center">
                    <div className="flex justify-center space-x-2">
                      <div
                        onClick={() =>
                          openModal(income.bill_number, income.group_sequence)
                        }
                        className="text-blue-600 hover:text-blue-800 px-5 py-2.5 cursor-pointer"
                      >
                        View
                      </div>
                      <div
                        onClick={() =>
                          openEditModal(
                            income.bill_number,
                            income.group_sequence
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
                  ไม่มีข้อมูลรายรับ
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
        <ModalIncome income_id={selectedIncomeId} onClose={closeModal} />
      )}
      {isModalEditOpen && (
        <ModalEditIncome
          income_id={selectedEditIncomeId}
          onClose={closeEditModal}
          onUpdate={fetchListIncome}
        />
      )}
    </div>
  );
};

export default IncomeList;
