import React from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');  
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center p-10">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-blue-700 mb-4 text-center">
          Dashboard
        </h1>

        <p className="text-gray-700 text-center mb-6">
          Selamat datang di Dashboard!  
          Kamu berhasil login.
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
