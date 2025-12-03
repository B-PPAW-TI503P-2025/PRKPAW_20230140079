import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, CheckCircle, LogOut, AlertCircle } from "lucide-react";

// Perbaikan Icon Leaflet agar tidak error (blank image) di React
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
} catch (e) {
  console.warn("Leaflet icons setup failed (expected in some environments)", e);
}

const AttendancePage = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  // State baru untuk menampung pesan status (bukan alert)
  const [statusMessage, setStatusMessage] = useState(null); 

  // 1. Ambil Lokasi (Geolocation) saat halaman dibuka
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error lokasi:", error);
          setStatusMessage({ type: 'error', text: "Mohon izinkan akses lokasi di browser untuk presensi." });
        }
      );
    } else {
      setStatusMessage({ type: 'error', text: "Browser tidak mendukung Geolocation." });
    }
  }, []);

  // 2. Submit Check-In (Versi JSON - Tanpa Foto)
  const handleCheckIn = async () => {
    if (!location) {
      setStatusMessage({ type: 'error', text: "Tunggu lokasi terdeteksi dulu!" });
      return;
    }

    setLoading(true);
    setStatusMessage(null); // Reset pesan sebelumnya

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatusMessage({ type: 'error', text: "Token tidak ditemukan, silakan login ulang." });
        return;
      }

      // Kita kirim JSON biasa (Lat & Long saja)
      // Backend (Smart Validation) akan otomatis mengisi foto dengan placeholder "-"
      const payload = {
        latitude: location.lat,
        longitude: location.lng
      };

      const response = await axios.post(
        "http://localhost:3001/api/attendance/check-in",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Format JSON
          },
        }
      );

      // Ganti alert dengan setStatusMessage
      setStatusMessage({ 
        type: 'success', 
        text: `Sukses: ${response.data.message}` 
      });

    } catch (error) {
      console.error("Check-in Error:", error);
      const msg = error.response?.data?.message || error.message;
      // Ganti alert dengan setStatusMessage
      setStatusMessage({ type: 'error', text: `Gagal Check-in: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Check-Out
  const handleCheckOut = async () => {
    if (!location) {
      setStatusMessage({ type: 'error', text: "Lokasi belum terdeteksi!" });
      return;
    }
    
    setLoading(true);
    setStatusMessage(null); // Reset pesan sebelumnya

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/attendance/check-out",
        { latitude: location.lat, longitude: location.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Ganti alert dengan setStatusMessage
      setStatusMessage({ type: 'success', text: "Check-out Berhasil! Hati-hati di jalan." });

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal Check-out";
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg mt-10 mb-20">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Presensi Harian</h2>

      {/* --- BAGIAN PETA (LEAFLET OSM) --- */}
      {/* Ukuran peta diperbesar sedikit karena kamera hilang */}
      <div className="mb-6 h-72 rounded-lg overflow-hidden border border-gray-300 shadow-inner relative z-0">
        {location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>Posisi Anda</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500 flex-col gap-2">
            <MapPin className="animate-bounce text-red-500" size={32} /> 
            <span>Mencari GPS...</span>
          </div>
        )}
      </div>

      {/* --- INFO KOORDINAT --- */}
      {location && (
        <div className="bg-blue-50 p-3 rounded-lg mb-6 text-sm text-blue-800 text-center flex justify-between px-8">
          <span>Lat: <strong>{location.lat.toFixed(5)}</strong></span>
          <span>Long: <strong>{location.lng.toFixed(5)}</strong></span>
        </div>
      )}

      {/* --- TOMBOL AKSI --- */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleCheckIn}
          disabled={loading || !location}
          className="flex-1 flex justify-center items-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
        >
          {loading ? "Proses..." : <><CheckCircle size={20} /> Check In</>}
        </button>
        
        <button
          onClick={handleCheckOut}
          disabled={loading || !location}
          className="flex-1 flex justify-center items-center gap-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
        >
          <LogOut size={20} /> Check Out
        </button>
      </div>

      {/* --- PESAN STATUS (PENGGANTI ALERT) --- */}
      {statusMessage && (
        <div 
          className={`p-4 rounded-lg flex items-center gap-3 animate-fade-in-down ${
            statusMessage.type === 'success' 
              ? 'bg-green-100 border border-green-200 text-green-800' 
              : 'bg-red-100 border border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="flex-shrink-0" size={24} />
          ) : (
            <AlertCircle className="flex-shrink-0" size={24} />
          )}
          <div>
            <p className="font-bold">{statusMessage.type === 'success' ? 'Berhasil!' : 'Gagal'}</p>
            <p className="text-sm">{statusMessage.text}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendancePage;