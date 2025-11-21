import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // INI ADALAH FUNGSI YANG TADI HILANG
  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    try {
      // Panggil API Login
      const response = await API.post('/api/auth/login', { email, password });
      
      // Simpan token
      localStorage.setItem('token', response.data.token);
      
      // Redirect ke dashboard
      alert("Login Berhasil!");
      navigate('/dashboard');
    } catch (error) {
      // Tampilkan pesan error
      alert("Login Gagal: " + (error.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login Aplikasi</h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-gray-600">Email</label>
            <input 
              type="email" 
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Masukkan email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 font-semibold text-gray-600">Password</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Masukkan password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Masuk
          </button>
        </form>

        {/* Bagian Navigasi ke Register */}
        <div className="mt-6 text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Belum punya akun?</p>
          <button 
            onClick={() => navigate('/register')}
            className="text-blue-600 font-bold hover:underline"
          >
            Daftar User Baru
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;