import { useState } from "react";
import axios from "axios";

const ExpenseForm = ({ account, onUpdate }) => {
  const [formData, setFormData] = useState({
    payment_number: "",
    group_sequence: "",
    account: "",
    amount: "",
    payDate: new Date().toISOString().split("T")[0],
    vat: false,
    description: "",
  });

  const [transferProofs, setTransferProofs] = useState([]); // แก้ไขให้เป็น []

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setTransferProofs([...e.target.files]); // ใช้ชื่อ state ที่สอดคล้องกัน
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    transferProofs?.forEach((file) => {
      data.append("evidence_paths", file);
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/expenses`,
        data
      );
      alert("บันทึกรายจ่ายสำเร็จ");
      onUpdate();
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
      console.error("เกิดข้อผิดพลาด", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="payment_number"
        placeholder="เลขที่ใบจ่าย"
        value={formData.payment_number}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:ring focus:ring-red-300"
      />
      <input
        type="text"
        name="group_sequence"
        placeholder="ลำดับกลุ่มใบ"
        value={formData.group_sequence}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:ring focus:ring-red-300"
      />
      <select
        name="account"
        value={formData.account}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:ring focus:ring-red-300"
      >
        <option value="">เลือกบัญชีจ่าย</option>
        {account.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="amount"
        placeholder="จำนวนเงิน"
        value={formData.amount}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:ring focus:ring-red-300"
      />

      <input
        type="date"
        name="payDate"
        value={formData.payDate}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
      />

      <input
        type="file"
        name="transferProofs"
        multiple
        onChange={handleFileChange}
        accept="image/*"
        required
        className="w-full p-2 border rounded-lg"
      />
      <div className="flex items-center w-full gap-4">
        <label className="inline-flex items-center">มี Vat</label>
        <input
          type="checkbox"
          name="vat"
          checked={formData.vat}
          onChange={(e) => setFormData({ ...formData, vat: e.target.checked })}
          className="border rounded-lg focus:ring focus:ring-blue-300"
        />
      </div>
      <textarea
        name="description"
        placeholder="รายละเอียด"
        value={formData.description}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg focus:ring focus:ring-red-300"
      ></textarea>
      <button type="submit" className="w-full p-2 rounded-lg hover:bg-red-600">
        บันทึกรายจ่าย
      </button>
    </form>
  );
};

export default ExpenseForm;
