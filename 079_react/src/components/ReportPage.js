import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const params = {};
      if (searchTerm) params.nama = searchTerm;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const response = await axios.get(
        "http://localhost:3001/api/reports/daily",
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      setReports(response.data.data || []);
      setError(null);
    } catch (err) {
      setError("Gagal mengambil data laporan");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Laporan Presensi Harian
      </h1>

      <form onSubmit={handleSearch} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Cari nama..."
          className="w-full px-3 py-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex space-x-2">
          <input
            type="date"
            className="px-3 py-2 border rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2 border rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Cari
        </button>
      </form>

      {error && (
        <p className="text-red-600 bg-red-100 p-4 rounded mb-4">{error}</p>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Check-In</th>
              <th className="p-3 text-left">Check-Out</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.user?.nama || "N/A"}</td>
                  <td className="p-3">
                    {new Date(r.checkIn).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3">
                    {r.checkOut
                      ? new Date(r.checkOut).toLocaleString("id-ID")
                      : "Belum checkout"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportPage;
