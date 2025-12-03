import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, CheckCircle, LogOut, AlertCircle, Navigation } from "lucide-react";

// --- PERBAIKAN ICON LEAFLET (JANGAN DIHAPUS) ---
try {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
} catch (e) {
  console.warn("Leaflet icons setup failed", e);
}

const AttendancePage = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // 1. Ambil Lokasi
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
          setStatusMessage({ type: "error", text: "Mohon izinkan akses lokasi." });
        }
      );
    } else {
      setStatusMessage({ type: "error", text: "Browser tidak support GPS." });
    }
  }, []);

  // 2. Logika Check-In (JSON)
  const handleCheckIn = async () => {
    if (!location) {
      setStatusMessage({ type: "error", text: "Mencari lokasi..." });
      return;
    }
    setLoading(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatusMessage({ type: "error", text: "Silakan login ulang." });
        return;
      }

      const payload = { latitude: location.lat, longitude: location.lng };

      const response = await axios.post(
        "http://localhost:3001/api/attendance/check-in",
        payload,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      setStatusMessage({ type: "success", text: `Halo! ${response.data.message}` });
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal Check-in.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  // 3. Logika Check-Out
  const handleCheckOut = async () => {
    if (!location) {
      setStatusMessage({ type: "error", text: "Mencari lokasi..." });
      return;
    }
    setLoading(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/attendance/check-out",
        { latitude: location.lat, longitude: location.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatusMessage({ type: "success", text: "Hati-hati di jalan, Check-out berhasil!" });
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal Check-out.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4 font-sans">
      
      {/* CARD CONTAINER */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white">
        
        {/* HEADER GRADASI */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md">
            PRESENSI
          </h2>
          <p className="text-orange-100 text-sm font-medium mt-1 uppercase tracking-wider">
            Sistem Monitoring Pegawai
          </p>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 -mt-6">
          
          {/* PETA CONTAINER */}
          <div className="bg-white p-2 rounded-2xl shadow-lg mb-6 relative z-10">
            <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-orange-100 relative">
              {location ? (
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={16}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[location.lat, location.lng]}>
                    <Popup>Lokasi Anda</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400 animate-pulse">
                  <MapPin size={40} className="text-orange-300 mb-2" />
                  <span className="font-semibold text-sm">Mendeteksi GPS...</span>
                </div>
              )}
            </div>
          </div>

          {/* KOORDINAT PILLS */}
          {location && (
            <div className="flex justify-center gap-3 mb-8">
              <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 shadow-sm">
                <Navigation size={12} /> {location.lat.toFixed(5)}
              </div>
              <div className="flex items-center gap-1 bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-100 shadow-sm">
                <Navigation size={12} /> {location.lng.toFixed(5)}
              </div>
            </div>
          )}

          {/* TOMBOL AKSI */}
          <div className="space-y-4">
            <button
              onClick={handleCheckIn}
              disabled={loading || !location}
              className="w-full group relative flex justify-center items-center gap-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-200 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                 <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <CheckCircle className="text-orange-100 group-hover:text-white transition-colors" />
                  CHECK IN SEKARANG
                </>
              )}
            </button>

            <button
              onClick={handleCheckOut}
              disabled={loading || !location}
              className="w-full flex justify-center items-center gap-3 bg-white border-2 border-pink-100 text-pink-500 py-3 rounded-xl font-bold text-lg hover:bg-pink-50 hover:border-pink-200 transition-colors disabled:opacity-50"
            >
              <LogOut size={20} />
              Check Out (Pulang)
            </button>
          </div>

          {/* STATUS MESSAGE BOX */}
          {statusMessage && (
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 border-l-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              statusMessage.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <div className="bg-green-200 p-1 rounded-full">
                   <CheckCircle size={16} className="text-green-700" />
                </div>
              ) : (
                <div className="bg-red-200 p-1 rounded-full">
                   <AlertCircle size={16} className="text-red-700" />
                </div>
              )}
              <div className="text-sm font-semibold">
                {statusMessage.text}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AttendancePage;