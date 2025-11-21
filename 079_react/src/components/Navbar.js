import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
    } catch (err) {
      localStorage.removeItem("token");
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex gap-6">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/presensi">Presensi</Link>
            {user.role === "admin" && <Link to="/reports">Laporan Admin</Link>}
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>

      {user && (
        <div>
          <span className="mr-4">Halo, {user.username}</span>
          <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
