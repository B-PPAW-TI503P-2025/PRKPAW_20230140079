import React from "react";
import { Link } from "react-router-dom";
import { UserCheck, FileText, ArrowRight } from "lucide-react";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 p-6">
      <div className="max-w-5xl mx-auto mt-10">
        
        {/* WELCOME SECTION */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-600">Selamat Datang!</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Apa yang ingin kamu lakukan hari ini?
          </p>
        </div>

        {/* MENU GRID */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* CARD PRESENSI */}
          <Link to="/attendance" className="group relative bg-white p-8 rounded-3xl shadow-xl border border-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-200 transition-all"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <UserCheck size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Isi Presensi</h2>
              <p className="text-gray-500 mb-6 font-medium">
                Check-in kedatangan atau check-out kepulanganmu di sini.
              </p>
              <span className="flex items-center gap-2 text-orange-500 font-bold group-hover:gap-3 transition-all">
                Mulai Sekarang <ArrowRight size={20} />
              </span>
            </div>
          </Link>

          {/* CARD LAPORAN */}
          <Link to="/report" className="group relative bg-white p-8 rounded-3xl shadow-xl border border-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-pink-200 transition-all"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-pink-500 to-pink-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Lihat Laporan</h2>
              <p className="text-gray-500 mb-6 font-medium">
                Cek riwayat kehadiranmu dan rekan kerja lainnya.
              </p>
              <span className="flex items-center gap-2 text-pink-500 font-bold group-hover:gap-3 transition-all">
                Lihat Data <ArrowRight size={20} />
              </span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;