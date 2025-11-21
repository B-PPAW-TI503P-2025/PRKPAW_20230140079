import React, { useState } from 'react';
import API from '../api'; // Pastikan path ke api.js benar
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Panggil endpoint register yang baru kita buat
      await API.post('/api/auth/register', {
        username,
        email,
        password
      });
      
      alert("Registrasi Berhasil! Silakan Login.");
      navigate('/login'); // Pindahkan user ke halaman login
    } catch (error) {
      alert("Gagal: " + (error.response?.data?.message || "Terjadi kesalahan"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Daftar Akun</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block mb-1">Username</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Daftar Sekarang
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm">Sudah punya akun? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/login')}>Login disini</span></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;