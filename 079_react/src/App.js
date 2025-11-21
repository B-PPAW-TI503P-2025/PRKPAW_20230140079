import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import DashboardPage from "./components/DashboardPage";
import PresensiPage from "./components/PresensiPage";
import ReportPage from "./components/ReportPage";
import Navbar from "./components/Navbar";

function App() {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <Router>
      {isLoggedIn && <Navbar />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/presensi" element={<PresensiPage />} />
        <Route path="/reports" element={<ReportPage />} />

        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
