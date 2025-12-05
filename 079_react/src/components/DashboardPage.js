import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCheck, FileText, LogOut, MapPin, Calendar, Clock } from "lucide-react";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Ambil data user dari localStorage
    const userString = localStorage.getItem("user");
    if (userString) {
      setUser(JSON.parse(userString));
    }

    // Timer untuk jam real-time
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER WELCOME */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <UserCheck size={150} />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold mb-2">
              Halo, {user?.nama || "User"}! 👋
            </h1>
            <p className="text-orange-100 font-medium text-lg mb-6">
              Selamat datang kembali di Aplikasi Presensi.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 font-bold border border-white/30">
                <Calendar size={18} /> {formatDate(currentTime)}
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 font-bold border border-white/30">
                <Clock size={18} /> {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* MENU GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* CARD 1: PRESENSI (Untuk Semua User) */}
          <Link to="/attendance" className="group">
            <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all border border-orange-100 h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-800 mb-2">Presensi Masuk/Pulang</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Lakukan presensi harian dengan foto bukti dan lokasi GPS terkini.
                </p>
              </div>
              <div className="mt-6 font-bold text-pink-500 flex items-center gap-2 group-hover:gap-3 transition-all">
                Mulai Absen <span>→</span>
              </div>
            </div>
          </Link>

          {/* CARD 2: LAPORAN (HANYA ADMIN) */}
          {/* LOGIKA: Hanya render jika user ada DAN role-nya admin */}
          {user && user.role === "admin" && (
            <Link to="/report" className="group">
              <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all border border-orange-100 h-full flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-800 mb-2">Laporan Pegawai</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Pantau data kehadiran seluruh pegawai, lokasi, dan bukti foto secara real-time.
                  </p>
                </div>
                <div className="mt-6 font-bold text-orange-500 flex items-center gap-2 group-hover:gap-3 transition-all">
                  Lihat Data <span>→</span>
                </div>
              </div>
            </Link>
          )}

          {/* CARD 3: LOGOUT (Opsional di dashboard karena sudah ada di navbar, tapi bagus untuk UX mobile) */}
          <button onClick={handleLogout} className="group text-left w-full">
            <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all border border-orange-100 h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <LogOut size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-800 mb-2">Logout Akun</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Keluar dari sesi aplikasi dengan aman di perangkat ini.
                </p>
              </div>
              <div className="mt-6 font-bold text-gray-400 group-hover:text-red-500 flex items-center gap-2 group-hover:gap-3 transition-all">
                Keluar Sekarang <span>→</span>
              </div>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;