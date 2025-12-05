import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, AlertCircle, MapPin, Image as ImageIcon, X } from "lucide-react";

const ReportPage = () => {
  const [dataPresensi, setDataPresensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // STATE BARU: Untuk menyimpan URL gambar yang sedang dibuka di pop-up
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Cek Role Admin
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!user || user.role !== "admin") {
      setError("AKSES DITOLAK: Halaman ini khusus Administrator.");
      setLoading(false);
      return; 
    }

    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan.");

      const response = await axios.get("http://localhost:3001/api/attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDataPresensi(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Gagal memuat data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
  };

  // HELPER BARU: Mengubah path file server menjadi URL browser yang valid
  const getImageUrl = (path) => {
    if (!path || path.includes("no-image")) return null;
    // Ganti backslash (\) menjadi forward slash (/) untuk kompatibilitas Windows
    const cleanPath = path.replace(/\\/g, "/");
    return `http://localhost:3001/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto mt-6 bg-white rounded-3xl shadow-xl border border-white overflow-hidden relative">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-wide">LAPORAN PEGAWAI</h2>
            <p className="text-orange-100 text-sm font-medium mt-1">Data Real-time Kehadiran</p>
          </div>
          
          <button 
            onClick={fetchReport}
            className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-pink-600 transition-all flex items-center gap-2 shadow-lg"
          >
            <Download size={20} /> REFRESH DATA
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-500 font-bold">Sedang memuat data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-4">
              <AlertCircle size={32} />
              <div>
                <p className="font-extrabold text-lg">Gagal Memuat Laporan</p>
                <p>{error}</p>
                {error.includes("AKSES DITOLAK") && (
                   <p className="text-sm mt-1 text-red-600">Silakan login menggunakan akun admin.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="py-4 px-6 font-extrabold text-gray-600 uppercase text-xs tracking-wider">No</th>
                    <th className="py-4 px-6 font-extrabold text-gray-600 uppercase text-xs tracking-wider">Pegawai</th>
                    <th className="py-4 px-6 font-extrabold text-gray-600 uppercase text-xs tracking-wider text-center">Check-In</th>
                    <th className="py-4 px-6 font-extrabold text-gray-600 uppercase text-xs tracking-wider text-center">Check-Out</th>
                    {/* KOLOM BARU */}
                    <th className="py-4 px-6 font-extrabold text-gray-600 uppercase text-xs tracking-wider text-center">Foto</th>
                    <th className="py-4 px-6 font-extrabold text-gray-600 uppercase text-xs tracking-wider text-center">Lokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataPresensi.length > 0 ? (
                    dataPresensi.map((item, index) => (
                      <tr key={item.id} className="hover:bg-orange-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-400">{index + 1}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {item.user?.nama?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{item.user?.nama || "Unknown"}</p>
                              <p className="text-xs text-gray-500 font-medium">{item.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="bg-green-100 text-green-700 py-1.5 px-4 rounded-full text-xs font-bold border border-green-200 inline-block">
                            {formatDate(item.checkIn)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.checkOut ? (
                            <span className="bg-blue-100 text-blue-700 py-1.5 px-4 rounded-full text-xs font-bold border border-blue-200 inline-block">
                              {formatDate(item.checkOut)}
                            </span>
                          ) : (
                            <span className="bg-orange-100 text-orange-600 py-1.5 px-4 rounded-full text-xs font-bold border border-orange-200 animate-pulse inline-block">
                              Belum Pulang
                            </span>
                          )}
                        </td>
                        
                        {/* BUTTON LIHAT FOTO */}
                        <td className="py-4 px-6 text-center">
                          {getImageUrl(item.buktiFoto) ? (
                            <button
                              onClick={() => setSelectedImage(getImageUrl(item.buktiFoto))}
                              className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-purple-500 hover:text-white transition-all shadow-sm border border-purple-100"
                            >
                              <ImageIcon size={14} /> Lihat
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No Image</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-center">
                           {item.latitude ? (
                             <a 
                               href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 text-pink-500 hover:text-pink-700 font-bold text-sm transition-colors bg-pink-50 px-3 py-1.5 rounded-lg"
                             >
                               <MapPin size={16} /> Cek Maps
                             </a>
                           ) : <span className="text-gray-300">-</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-400 font-medium">
                        Belum ada data presensi hari ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- MODAL POP-UP FOTO --- */}
        {selectedImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-200">
            <div className="relative bg-white p-2 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              
              {/* Tombol Close */}
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110 z-10"
              >
                <X size={24} />
              </button>

              {/* Gambar */}
              <div className="overflow-hidden rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center h-full">
                <img 
                  src={selectedImage} 
                  alt="Bukti Check-In" 
                  className="w-full h-full object-contain max-h-[80vh]"
                />
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-500 font-medium">Bukti Foto Presensi</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportPage;