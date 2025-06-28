import React from "react";
import RevenueForm from "../components/RevenueForm";
import ExpenseForm from "../components/ExpenseForm";
import Balance from "../components/Balance";
import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [account, setAccount] = useState([]);
  const fetchBank = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/accounts`
      );
      setAccount(res.data);
    } catch (error) {
      console.error("fetchBank", error);
    }
  };

  useEffect(() => {
    fetchBank();
  }, []);

  return (
    <div className="App">
      <div className="space-y-4 mt-4">
        <h5 className="text-lg font-bold ">ระบบบันทึกรายรับ-รายจ่าย</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-md font-bold ">รายรับ</h2>
            <h5>BL2025</h5>
            <RevenueForm account={account} onUpdate={fetchBank} />
          </div>
          <div>
            <h2 className="text-md font-bold ">รายจ่าย</h2>
            <h5>Ex20250400</h5>
            <ExpenseForm account={account} onUpdate={fetchBank} />
          </div>
        </div>
        <hr />
        <Balance />
      </div>
    </div>
  );
}

export default App;
