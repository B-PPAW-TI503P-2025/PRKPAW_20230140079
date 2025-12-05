import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, UserCheck, FileText } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  // AMBIL DATA USER DARI LOCALSTORAGE
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Hapus data user juga saat logout
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO GRADIENT */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-2 rounded-xl text-white shadow-lg group-hover:shadow-orange-200 transition-all">
               <UserCheck size={24} strokeWidth={3} />
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 tracking-tight">
              PRESENSI<span className="text-gray-800">APP</span>
            </span>
          </Link>

          {/* MENU ITEMS (Hanya tampil jika login) */}
          {token && (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="hidden md:flex items-center gap-2 text-gray-500 font-bold hover:text-orange-500 transition-colors">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/attendance" className="hidden md:flex items-center gap-2 text-gray-500 font-bold hover:text-pink-500 transition-colors">
                <UserCheck size={18} /> Presensi
              </Link>
              
              {/* LOGIKA ADMIN: Menu Laporan hanya muncul jika role === 'admin' */}
              {user && user.role === "admin" && (
                <Link to="/report" className="hidden md:flex items-center gap-2 text-gray-500 font-bold hover:text-orange-500 transition-colors">
                  <FileText size={18} /> Laporan
                </Link>
              )}
              
              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-pink-50 text-pink-600 px-5 py-2.5 rounded-full font-bold hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-sm"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;