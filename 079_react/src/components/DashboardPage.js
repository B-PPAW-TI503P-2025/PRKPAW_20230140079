import React, { useState } from 'react';
import Navbar from "./Navbar";
import API from '../api'; // Import konfigurasi Axios

function DashboardPage() {
  const [message, setMessage] = useState('');

  // Fungsi untuk menangani Check-in dan Check-out
  const handlePresensi = async (type) => {
    try {
      const endpoint = type === 'in' ? '/presensi/checkin' : '/presensi/checkout';
      const response = await API.post(endpoint);
      setMessage(`Sukses: ${response.data.message}`);
    } catch (error) {
      setMessage("Gagal: " + (error.response?.data?.message || "Terjadi kesalahan server"));
    }
  };

  return (
    // Gunakan Fragment (<>...</>) agar Navbar berada di luar container centering
    <>
      <Navbar />
      
      <div className="min-h-screen bg-blue-50 flex flex-col items-center p-10">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            Dashboard Presensi
          </h1>

          <p className="text-gray-700 mb-6">
            Silakan lakukan absensi kehadiran Anda di bawah ini.
          </p>

          {/* Menampilkan pesan status jika ada (Sukses/Gagal) */}
          {message && (
            <div className={`p-3 mb-4 rounded ${message.includes('Sukses') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-center gap-4">
            {/* Tombol Check In */}
            <button
              onClick={() => handlePresensi('in')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition duration-200"
            >
              Check In (Masuk)
            </button>

            {/* Tombol Check Out */}
            <button
              onClick={() => handlePresensi('out')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold shadow hover:bg-orange-600 transition duration-200"
            >
              Check Out (Pulang)
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default DashboardPage;