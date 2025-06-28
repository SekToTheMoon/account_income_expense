import { useEffect, useState } from "react";
import axios from "axios";

const ModalEditExpense = ({ expense_id, onClose, onUpdate }) => {
  const { payment_number, group_sequence } = expense_id;

  const [formData, setFormData] = useState({
    payment_number: "",
    group_sequence: "",
    name: "",
    account: "",
    amount: "",
    payDate: "",
    description: "",
    vat: false,
  });

  const [account, setAccount] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

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
    if (payment_number) {
      axios
        .get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/expenses/${payment_number}/${group_sequence}`
        )
        .then((res) => {
          const data = res.data.results[0];
          setFormData({
            payment_number: data.payment_number,
            name: data.name,
            group_sequence: data.group_sequence,
            amount: data.amount,
            payDate: new Date(data.payDate).toLocaleDateString("en-CA"),
            description: data.description,
            vat: data.vat,
            account: data.account,
          });
          setExistingImages(res.data.images);
        })
        .catch((error) => console.error("fetchExpenseData", error));

      fetchBank();
    }
  }, [payment_number]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const handleDeleteImage = async (fileName) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/api/expense/delete-image`,
        {
          data: { fileName },
        }
      );
      setExistingImages(
        existingImages.filter((img) => img.fileName !== fileName)
      );
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${
          import.meta.env.VITE_SERVER_URL
        }/api/expenses/${payment_number}/${group_sequence}`,
        formData
      );

      if (newImages.length > 0) {
        const uploadData = new FormData();
        newImages.forEach((image) => uploadData.append("files", image));
        uploadData.append("payment_number", payment_number);
        uploadData.append("group_sequence", group_sequence);

        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/expense/update-images`,
          uploadData
        );
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("updateExpense", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/60 z-50">
      <div className="bg-white rounded-lg shadow-lg w-2/3 h-2/3 overflow-y-auto p-5">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-semibold text-gray-900">แก้ไขรายจ่าย</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 rounded-lg p-1"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <div>
            <label className="block text-gray-700">เลขที่ใบจ่าย</label>
            <input
              type="text"
              name="payment_number"
              value={formData.payment_number}
              className="w-full border px-3 py-2 rounded-lg"
              disabled
            />
          </div>

          <select
            name="account"
            value={formData.account}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
          >
            <option value="">เลือกบัญชีจ่าย</option>
            {account.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <div>
            <label className="block text-gray-700">จำนวนเงิน</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">วันที่</label>
            <input
              type="date"
              name="payDate"
              value={formData.payDate}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          <div className="flex items-center w-full gap-4">
            <label className="inline-flex items-center">มี Vat</label>
            <input
              type="checkbox"
              name="vat"
              checked={formData.vat}
              onChange={(e) =>
                setFormData({ ...formData, vat: e.target.checked })
              }
              className="border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700">รายละเอียด</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {/* แสดงภาพที่มีอยู่ */}
          <div>
            <label className="block text-gray-700">หลักฐานที่มีอยู่</label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {existingImages.map((img) => (
                <div key={img.fileName} className="relative">
                  <img
                    src={`${import.meta.env.VITE_SERVER_URL}/images/expense/${
                      img.fileName
                    }`}
                    alt={img.fileName}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.fileName)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* อัปโหลดไฟล์ใหม่ */}
          <div>
            <label className="block text-gray-700">อัปโหลดรูปภาพใหม่</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditExpense;
