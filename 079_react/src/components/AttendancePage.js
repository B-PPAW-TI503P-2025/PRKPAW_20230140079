import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// TAMBAHAN: Import 'CameraOff' untuk ikon kamera mati
import { MapPin, CheckCircle, LogOut, AlertCircle, Navigation, Lock, Camera, CameraOff, X, RefreshCw, Send } from "lucide-react";

// --- KONFIGURASI ICON LEAFLET ---
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
  
  // STATE FOTO & KAMERA
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // STATE STATUS CHECK-IN
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  useEffect(() => {
    // 1. Ambil Lokasi GPS
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

    // 2. Cek Status LocalStorage
    const today = new Date().toISOString().split('T')[0];
    const savedStatus = JSON.parse(localStorage.getItem("attendanceStatus"));
    if (savedStatus && savedStatus.date === today) {
      setHasCheckedIn(savedStatus.hasCheckedIn);
      setHasCheckedOut(savedStatus.hasCheckedOut);
    } else {
      localStorage.removeItem("attendanceStatus");
    }

    // Cleanup saat keluar halaman
    return () => {
      stopCamera();
    };
  }, []);

  const saveStatusToLocal = (checkIn, checkOut) => {
    const today = new Date().toISOString().split('T')[0];
    const status = { date: today, hasCheckedIn: checkIn, hasCheckedOut: checkOut };
    localStorage.setItem("attendanceStatus", JSON.stringify(status));
    setHasCheckedIn(checkIn);
    setHasCheckedOut(checkOut);
  };

  // --- FUNGSI KAMERA ---
  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      setStatusMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      setStatusMessage({ type: "error", text: "Gagal membuka kamera. Izinkan akses." });
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setImage(file);
        setPreview(URL.createObjectURL(file));
      }, "image/jpeg", 0.8);
    }
  };

  const retakePhoto = () => {
    setImage(null);
    setPreview(null);
  };

  // --- LOGIKA CHECK-IN ---
  const handleCheckIn = async () => {
    if (!location || !image) {
      setStatusMessage({ type: "error", text: "Lokasi & Foto wajib ada!" });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);
      formData.append("image", image);

      const response = await axios.post(
        "http://localhost:3001/api/attendance/check-in",
        formData,
        { 
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } 
        }
      );

      setStatusMessage({ type: "success", text: `Berhasil! ${response.data.message}` });
      saveStatusToLocal(true, false);
      
      // Matikan kamera setelah SUKSES Check-In
      stopCamera();

    } catch (error) {
      const msg = error.response?.data?.message || "Gagal Check-in.";
      setStatusMessage({ type: "error", text: msg });
      if (msg.toLowerCase().includes("sudah check-in")) saveStatusToLocal(true, false);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA CHECK-OUT ---
  const handleCheckOut = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/attendance/check-out",
        { latitude: location.lat, longitude: location.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatusMessage({ type: "success", text: "Check-out berhasil!" });
      saveStatusToLocal(true, true);
    } catch (error) {
      setStatusMessage({ type: "error", text: "Gagal Check-out." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md">PRESENSI</h2>
          <p className="text-orange-100 text-sm font-medium mt-1 uppercase tracking-wider">Sistem Monitoring Pegawai</p>
        </div>

        <div className="p-6 -mt-6">
          
          {/* MAP */}
          <div className="bg-white p-2 rounded-2xl shadow-lg mb-6 relative z-10">
            <div className="h-48 w-full rounded-xl overflow-hidden border-2 border-orange-100 relative">
              {location ? (
                <MapContainer center={[location.lat, location.lng]} zoom={16} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.lat, location.lng]}><Popup>Lokasi Anda</Popup></Marker>
                </MapContainer>
              ) : (
                <div className="h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400 animate-pulse">
                  <MapPin size={40} className="text-orange-300 mb-2" />
                  <span className="font-semibold text-sm">Mendeteksi GPS...</span>
                </div>
              )}
            </div>
          </div>

          {/* --- LOGIKA TAMPILAN KAMERA --- */}
          
          {/* KONDISI 1: SUDAH CHECK-IN (Tampilkan Card Kamera Non-Aktif) */}
          {hasCheckedIn && !preview && (
            <div className="mb-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-gray-100 p-4 rounded-full mb-3 text-gray-400 shadow-sm">
                <CameraOff size={32} />
              </div>
              <p className="text-gray-500 font-bold">Kamera Dinonaktifkan</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Anda sudah berhasil melakukan Check-In. Kamera tidak diperlukan lagi hari ini.
              </p>
            </div>
          )}

          {/* KONDISI 2: BELUM CHECK-IN ATAU ADA PREVIEW FOTO BARU */}
          {(!hasCheckedIn || (hasCheckedIn && preview)) && (
            <div className="mb-6 relative">
              
              {/* Live Stream */}
              {isCameraOpen && !preview && (
                <div className="relative rounded-xl overflow-hidden bg-black shadow-lg">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover transform scale-x-[-1]" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                     <button onClick={stopCamera} className="bg-white/20 backdrop-blur text-white p-3 rounded-full hover:bg-white/40"><X size={24} /></button>
                     <button onClick={takePhoto} className="bg-white border-4 border-gray-300 w-16 h-16 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <div className="w-12 h-12 bg-red-500 rounded-full"></div>
                     </button>
                  </div>
                </div>
              )}

              {/* Preview Foto */}
              {preview && (
                <div className="relative rounded-xl overflow-hidden bg-gray-100 border-2 border-orange-200 shadow-md">
                  <img src={preview} alt="Hasil Jepretan" className="w-full h-64 object-cover" />
                  
                  {/* Tombol Retake (Hanya muncul jika BELUM Check-In) */}
                  {!hasCheckedIn ? (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button onClick={retakePhoto} className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                        <RefreshCw size={18} /> Foto Ulang
                      </button>
                    </div>
                  ) : (
                    // Label Sukses
                    <div className="absolute bottom-0 w-full bg-green-500/90 text-white text-center py-2 font-bold text-sm backdrop-blur-sm">
                       Foto Bukti Terkirim ✓
                    </div>
                  )}

                  {!hasCheckedIn && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow flex items-center gap-1">
                      <CheckCircle size={12} /> Terambil
                    </div>
                  )}
                </div>
              )}

              {/* Tombol Buka Kamera Awal */}
              {!isCameraOpen && !preview && !hasCheckedIn && (
                 <button onClick={startCamera} className="w-full h-32 border-2 border-dashed border-orange-300 rounded-xl flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100 transition-colors group cursor-pointer">
                  <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="text-orange-500" size={24} />
                  </div>
                  <span className="text-gray-500 font-bold text-sm group-hover:text-orange-600">Buka Kamera & Ambil Foto</span>
                </button>
              )}
            </div>
          )}

          {/* TOMBOL ACTION */}
          <div className="space-y-4">
            <button
              onClick={handleCheckIn}
              disabled={loading || !location || hasCheckedIn || (!image && !hasCheckedIn)}
              className={`w-full group relative flex justify-center items-center gap-3 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 
                ${hasCheckedIn 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                  : "bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:shadow-orange-200 hover:scale-[1.02]"
                }`}
            >
              {loading ? (
                 <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : hasCheckedIn ? (
                <> <CheckCircle size={20} /> SUDAH CHECK-IN </>
              ) : (
                <> <Send className="text-orange-100 group-hover:text-white" size={20} /> KIRIM ABSEN </>
              )}
            </button>

            <button
              onClick={handleCheckOut}
              disabled={loading || !location || !hasCheckedIn || hasCheckedOut}
              className={`w-full flex justify-center items-center gap-3 border-2 py-3 rounded-xl font-bold text-lg transition-colors
                ${(!hasCheckedIn || hasCheckedOut)
                  ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed" 
                  : "bg-white border-pink-100 text-pink-500 hover:bg-pink-50 hover:border-pink-200"
                }`}
            >
              {hasCheckedOut ? (
                <> <Lock size={20} /> SUDAH PULANG </>
              ) : (
                <> <LogOut size={20} /> Check Out (Pulang) </>
              )}
            </button>
          </div>

          {/* PESAN STATUS */}
          {statusMessage && (
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 border-l-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 ${
              statusMessage.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <div className="text-sm font-semibold">{statusMessage.text}</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AttendancePage;