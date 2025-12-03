require("dotenv").config();
console.log("Nilai JWT_SECRET di server.js:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require("./models"); 
const fs = require("fs"); // Tambahan: untuk cek folder
const path = require("path"); // Tambahan: untuk path folder

const app = express();
const PORT = process.env.PORT || 3001; // Port 3001

// --- PERBAIKAN: BUAT FOLDER UPLOADS OTOMATIS ---
// Cek apakah folder 'uploads' sudah ada. Jika belum, buat folder tersebut.
// Ini mencegah error "ENOENT: no such file or directory" saat upload foto.
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log(">>> Folder 'uploads' berhasil dibuat otomatis! <<<");
}

// Impor router
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");
const authRoutes = require("./routes/auth");
const ruteBuku = require("./routes/books");

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // Logger

// Middleware untuk menyajikan file statis (foto) dari folder uploads
// Agar nanti foto bisa diakses via http://localhost:3001/uploads/namafile.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Server Presensi Berjalan!");
});

// --- PENYESUAIAN RUTE ---
app.use("/api/books", ruteBuku);

// PERBAIKAN 1: Mengubah route agar sesuai dengan request Frontend (/api/attendance/check-in)
// Sebelumnya "/api/presensi" yang menyebabkan error 404
app.use("/api/attendance", presensiRoutes); 

app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);

// --- DATABASE SYNC ---
// PERBAIKAN 2: Menggunakan { alter: true } agar data TIDAK HILANG saat restart
// { force: true } hanya dipakai saat pertama kali develop jika ingin reset total
db.sequelize.sync({ alter: true }).then(() => {
  console.log(">>> DATABASE DISINKRONISASI (Data aman, tidak di-reset) <<<");
  
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}/`);
  });
}).catch((err) => {
  console.error("Gagal sinkronisasi database:", err);
});