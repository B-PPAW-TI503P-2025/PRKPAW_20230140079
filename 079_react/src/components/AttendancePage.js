import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Camera, MapPin, CheckCircle, LogOut } from "lucide-react";

// Perbaikan Icon Leaflet agar tidak error (blank image) di React
// Menggunakan try-catch agar aman jika dijalankan di environment berbeda
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
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

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
          alert("Mohon izinkan akses lokasi di browser untuk presensi.");
        }
      );
    } else {
      alert("Browser tidak mendukung Geolocation.");
    }
  }, []);

  // 2. Fungsi Capture Foto
  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
    }
  }, [webcamRef]);

  // 3. Fungsi Konversi Base64 ke File (Agar bisa diupload ke Multer)
  const dataURLtoFile = (dataurl, filename) => {
    if (!dataurl) return null;
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // 4. Submit Check-In
  const handleCheckIn = async () => {
    if (!image || !location) {
      alert("Mohon ambil foto dan tunggu lokasi terdeteksi!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token tidak ditemukan, silakan login ulang.");
        return;
      }
      
      const file = dataURLtoFile(image, "foto-presensi.jpg");

      const formData = new FormData();
      formData.append("image", file);
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);

      // Pastikan port sesuai dengan server.js (3001)
      const response = await axios.post(
        "http://localhost:3001/api/attendance/check-in",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(`Sukses: ${response.data.message}`);
      setImage(null); // Reset foto setelah berhasil
    } catch (error) {
      console.error("Check-in Error:", error);
      const msg = error.response?.data?.message || error.message;
      alert(`Gagal Check-in: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // 5. Submit Check-Out (Tanpa Foto)
  const handleCheckOut = async () => {
    if (!location) {
      alert("Lokasi belum terdeteksi!");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/attendance/check-out",
        { latitude: location.lat, longitude: location.lng }, // Kirim lokasi saat check-out juga
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Check-out Berhasil!");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal Check-out";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg mt-10 mb-20">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Presensi Harian</h2>

      {/* --- BAGIAN KAMERA --- */}
      <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-300">
        {image ? (
          <img src={image} alt="Preview" className="w-full h-64 object-cover" />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-64 object-cover"
            videoConstraints={{ facingMode: "user" }} // Kamera depan
          />
        )}
      </div>

      <div className="flex gap-2 justify-center mb-6">
        {!image ? (
          <button
            onClick={capture}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition shadow-md"
          >
            <Camera size={20} /> Ambil Foto
          </button>
        ) : (
          <button
            onClick={() => setImage(null)}
            className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition shadow-md"
          >
            Ambil Ulang
          </button>
        )}
      </div>

      {/* --- BAGIAN PETA (LEAFLET OSM) --- */}
      <div className="mb-6 h-48 rounded-lg overflow-hidden border border-gray-300 shadow-inner relative z-0">
        {location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>Lokasi Kamu Saat Ini</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 text-gray-500 flex-col gap-2">
            <MapPin className="animate-bounce text-red-500" size={32} /> 
            <span>Mencari Lokasi GPS...</span>
          </div>
        )}
      </div>

      {/* --- TOMBOL AKSI --- */}
      <div className="flex gap-4">
        <button
          onClick={handleCheckIn}
          disabled={loading || !location}
          className="flex-1 flex justify-center items-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
        >
          {loading ? "Loading..." : <><CheckCircle size={20} /> Check In</>}
        </button>
        
        <button
          onClick={handleCheckOut}
          disabled={loading || !location}
          className="flex-1 flex justify-center items-center gap-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
        >
          <LogOut size={20} /> Check Out
        </button>
      </div>
    </div>
  );
};

export default AttendancePage;