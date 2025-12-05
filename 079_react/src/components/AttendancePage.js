import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, CheckCircle, LogOut, AlertCircle, Camera, RefreshCw } from "lucide-react";

// --- PERBAIKAN ICON LEAFLET ---
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
  const [image, setImage] = useState(null); // State untuk Foto (Base64)
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const webcamRef = useRef(null);

  // 1. Ambil Lokasi (Sama seperti Modul: coords)
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

  // 2. Fungsi Capture Foto (Sesuai Modul: getScreenshot)
  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  // 3. Helper: Convert Base64 ke File 
  // (Modul menyarankan fetch(image).blob(), fungsi ini melakukan hal yang sama tapi lebih stabil)
  const dataURLtoFile = (dataurl, filename) => {
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

  // 4. Logika Check-In (IMPLEMENTASI UTAMA MODUL)
  const handleCheckIn = async () => {
    // Validasi: Lokasi dan Foto Wajib Ada
    if (!location || !image) {
      setStatusMessage({ type: "error", text: "Lokasi dan Foto wajib ada!" });
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

      // LANGKAH 1: Konversi Foto ke File (Blob)
      const file = dataURLtoFile(image, "selfie-presensi.jpg");

      // LANGKAH 2: Buat FormData (Sesuai Modul)
      const formData = new FormData();
      formData.append("image", file); // Key 'image' sesuai dengan upload.single('image') di backend
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);

      // LANGKAH 3: Kirim via Axios
      const response = await axios.post(
        "http://localhost:3001/api/attendance/check-in", // Pastikan route sesuai backend Anda
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Header Wajib untuk File Upload
          },
        }
      );

      setStatusMessage({ type: "success", text: `Halo! ${response.data.message}` });
      setImage(null); // Reset foto setelah sukses
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal Check-in.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  // 5. Logika Check-Out
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
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white my-10">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md">
            PRESENSI
          </h2>
          <p className="text-orange-100 text-sm font-medium mt-1 uppercase tracking-wider">
            Selfie Check-in
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          
          {/* --- BAGIAN KAMERA (MODUL: React Webcam) --- */}
          <div className="mb-6 relative">
            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-gray-100 relative h-64 w-full">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover transform scale-x-[-1]" />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover transform scale-x-[-1]" 
                  videoConstraints={{ facingMode: "user" }}
                />
              )}
            </div>

            {/* Tombol Kamera Overlay */}
            <div className="mt-3 flex justify-center">
                {!image ? (
                    <button 
                        onClick={capture}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-orange-200 hover:scale-105 transition-all"
                    >
                        <Camera size={20} /> AMBIL FOTO
                    </button>
                ) : (
                    <button 
                        onClick={() => setImage(null)}
                        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-full font-bold shadow-md hover:bg-gray-50 transition-all"
                    >
                        <RefreshCw size={18} /> FOTO ULANG
                    </button>
                )}
            </div>
          </div>

          {/* --- BAGIAN PETA --- */}
          <div className="bg-white p-2 rounded-2xl shadow-md mb-6 border border-gray-100">
            <div className="h-40 w-full rounded-xl overflow-hidden border border-orange-100 relative">
              {location ? (
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.lat, location.lng]}>
                    <Popup>Lokasi Anda</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400 animate-pulse">
                  <MapPin size={32} className="text-orange-300 mb-2" />
                  <span className="text-xs font-semibold">Mendeteksi GPS...</span>
                </div>
              )}
            </div>
          </div>

          {/* TOMBOL UTAMA */}
          <div className="space-y-3">
            <button
              onClick={handleCheckIn}
              disabled={loading || !location || !image}
              className="w-full group relative flex justify-center items-center gap-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-200 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                 <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <CheckCircle className="text-orange-100 group-hover:text-white transition-colors" />
                  CHECK IN
                </>
              )}
            </button>

            <button
              onClick={handleCheckOut}
              disabled={loading || !location}
              className="w-full flex justify-center items-center gap-3 bg-white border-2 border-pink-100 text-pink-500 py-3 rounded-xl font-bold text-lg hover:bg-pink-50 hover:border-pink-200 transition-colors disabled:opacity-50"
            >
              <LogOut size={20} />
              Check Out
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