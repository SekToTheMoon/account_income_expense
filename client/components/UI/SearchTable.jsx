import { useState } from "react";
import axios from "axios";

const SearchTable = ({ url, setResult }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${url}?search=${searchTerm}`);

      setResult(response.data); // อัปเดตค่าผลลัพธ์
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการค้นหา", error);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        placeholder="ค้นหา..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        ค้นหา
      </button>
    </form>
  );
};

export default SearchTable;
