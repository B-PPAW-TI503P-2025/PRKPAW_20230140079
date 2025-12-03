import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, AlertCircle, MapPin, Image as ImageIcon } from "lucide-react";

const ReportPage = () => {
  const [dataPresensi, setDataPresensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(""); 
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login kembali.");
      }

      const response = await axios.get("http://localhost:3001/api/attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Data diterima:", response.data); 
      setDataPresensi(response.data);
    } catch (err) {
      console.error("Error Detail:", err);
      const msg = err.response?.data?.message || err.message || "Gagal memuat data laporan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 mb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Laporan Presensi Pegawai</h2>
        <button 
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Download size={18} /> Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={24} />
          <div>
            <p className="font-bold">Terjadi Kesalahan</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr className="text-gray-600 uppercase text-xs leading-normal">
                <th className="py-3 px-6 text-left font-semibold">No</th>
                <th className="py-3 px-6 text-left font-semibold">Nama User</th>
                <th className="py-3 px-6 text-center font-semibold">Waktu Masuk</th>
                <th className="py-3 px-6 text-center font-semibold">Waktu Pulang</th>
                <th className="py-3 px-6 text-center font-semibold">Bukti Foto</th>
                <th className="py-3 px-6 text-center font-semibold">Lokasi</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {dataPresensi.length > 0 ? (
                dataPresensi.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-3 px-6 text-left whitespace-nowrap font-medium">
                      {index + 1}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <div className="flex items-center">
                        <div className="mr-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                            {/* PERBAIKAN: Menggunakan item.user (kecil) */}
                            {item.user?.nama?.charAt(0) || "U"}
                          </div>
                        </div>
                        <span className="font-medium">
                          {/* PERBAIKAN: Menggunakan item.user (kecil) */}
                          {item.user ? (item.user.nama || item.user.username) : "User Tidak Dikenal"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-semibold">
                        {formatDate(item.checkIn)}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.checkOut ? (
                         <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-semibold">
                           {formatDate(item.checkOut)}
                         </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 py-1 px-3 rounded-full text-xs font-semibold animate-pulse">
                          Belum Check-Out
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.buktiFoto ? (
                        <a 
                          href={`http://localhost:3001/${item.buktiFoto.replace(/\\/g, "/")}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium underline decoration-dotted"
                        >
                          <ImageIcon size={14} /> Lihat
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.latitude && item.longitude ? (
                        <a 
                          href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium"
                        >
                          <MapPin size={14} /> Maps
                        </a>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Belum ada data presensi yang terekam.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportPage;