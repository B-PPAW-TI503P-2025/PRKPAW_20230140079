import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import DashboardPage from "./components/DashboardPage";
import AttendancePage from "./components/AttendancePage";
import ReportPage from "./components/ReportPage"; // Pastikan sudah di-import
import Navbar from "./components/Navbar";

// Komponen Layout agar Navbar otomatis muncul di halaman tertentu
const Layout = ({ children }) => {
  const location = useLocation();
  // Daftar path yang TIDAK boleh ada Navbar (Login & Register)
  const hideNavbarPaths = ["/login", "/register", "/"];

  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};

// Komponen PrivateRoute untuk memproteksi halaman
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  // Jika tidak ada token, tendang ke login
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rute Private (Butuh Login) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <AttendancePage />
              </PrivateRoute>
            }
          />
          
          {/* PASTIKAN RUTE LAPORAN ADA DI SINI */}
          <Route
            path="/report"
            element={
              <PrivateRoute>
                <ReportPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;