import React, { useEffect, useState } from "react";
import axios from "axios";

function PresensiPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:3000", 
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchHistory = async () => {
    try {
      const response = await api.get("/presensi");
      setHistory(response.data);
    } catch (err) {
      console.error("Error fetch:", err);
    }
  };

  const checkIn = async () => {
    setLoading(true);
    try {
      await api.post("/presensi/checkin");
      await fetchHistory();
      alert("Check-in berhasil!");
    } catch (error) {
      alert(error.response?.data?.message || "Gagal check-in");
    }
    setLoading(false);
  };

  const checkOut = async () => {
    setLoading(true);
    try {
      await api.post("/presensi/checkout");
      await fetchHistory();
      alert("Check-out berhasil!");
    } catch (error) {
      alert(error.response?.data?.message || "Gagal check-out");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Presensi</h1>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={checkIn}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Check In
        </button>

        <button 
          onClick={checkOut}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Check Out
        </button>
      </div>

      <h2 className="text-lg font-semibold">Riwayat Presensi</h2>
      <table className="w-full mt-3 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">User</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row) => (
            <tr key={row.id}>
              <td className="p-2 border">{row.userData?.username}</td>
              <td className="p-2 border">{row.status}</td>
              <td className="p-2 border">
                {new Date(row.waktu).toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PresensiPage;
