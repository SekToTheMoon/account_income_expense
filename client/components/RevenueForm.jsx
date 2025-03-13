import { useState } from "react";
import axios from "axios";

const RevenueForm = ({ account, onUpdate }) => {
  const [formData, setFormData] = useState({
    bill_number: "",
    group_sequence: "",
    account: "",
    amount: "",
    rcDate: new Date().toISOString().split("T")[0],
    vat: false,
    description: "",
  });

  const [transferProofs, setTransferProof] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setTransferProof([...e.target.files]);
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
        `${import.meta.env.VITE_SERVER_URL}/api/incomes`,
        data
      );
      alert("บันทึกสำเร็จ");
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
        name="bill_number"
        placeholder="เลขที่ใบวางบิล"
        value={formData.bill_number}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
      />
      <input
        type="text"
        name="group_sequence"
        placeholder="ลำดับกลุ่มใบ"
        value={formData.group_sequence}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
      />
      <select
        name="account"
        value={formData.account}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
      >
        <option value="">เลือกบัญชีรับเงิน</option>
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
        name="rcDate"
        value={formData.rcDate}
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
          checked={formData.vat} // ใช้ checked แทน value
          onChange={(e) => setFormData({ ...formData, vat: e.target.checked })} // อัปเดตค่าเป็น true/false
          className="border rounded-lg focus:ring focus:ring-blue-300"
        />
      </div>
      <textarea
        name="description"
        placeholder="รายละเอียด"
        value={formData.description}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
      ></textarea>
      <button
        type="submit"
        className="w-full  p-2 rounded-lg hover:bg-blue-600"
      >
        บันทึกรายรับ
      </button>
    </form>
  );
};

export default RevenueForm;
