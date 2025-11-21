import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Token invalid");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-6">
        <Link to="/dashboard" className="hover:text-gray-300 font-medium">
          Dashboard
        </Link>

        <Link to="/presensi" className="hover:text-gray-300 font-medium">
          Presensi
        </Link>

        {user?.role === "admin" && (
          <Link to="/reports" className="hover:text-gray-300 font-medium">
            Laporan Admin
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <span className="text-gray-300">
            Halo, <span className="font-semibold">{user.nama}</span>
          </span>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
