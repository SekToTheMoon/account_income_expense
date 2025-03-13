import React, { useState, useEffect } from "react";
import axios from "axios";

const Balance = () => {
  const [data, setData] = useState({
    totalBalance: 0,
    accounts: [],
  });

  const fetchBalance = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/balance`
      );
      setData(res.data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาด", error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div>
      <h2 className="mb-4">
        ยอดรวมในทุกบัญชี: {new Intl.NumberFormat().format(data.totalBalance)}
      </h2>

      <ul>
        {data.accounts.map((account, index) => (
          <li key={index}>
            <p>
              บัญชี {account.name} :{" "}
              {new Intl.NumberFormat().format(account.balance)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Balance;
