import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email,
          password,
        }
      );
      // Simpan token
      localStorage.setItem("token", response.data.token);
      // TAMBAHAN: Simpan data user (termasuk role) sebagai JSON string
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert("Login Berhasil! Selamat Datang.");
      navigate("/dashboard");
    } catch (error) {
      alert("Login Gagal: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="bg-white/20 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner">
              <LogIn className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-wide">
              WELCOME BACK
            </h2>
            <p className="text-orange-100 font-medium mt-2">
              Silakan login untuk presensi
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all font-medium"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-orange-200 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  LOGIN SEKARANG <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 font-medium">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-pink-500 font-bold hover:underline"
            >
              Daftar Disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
