require("dotenv").config();
console.log("Nilai JWT_SECRET di server.js:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require("./models"); 

const app = express();
const PORT = process.env.PORT || 3001; // Port 3001

// Impor router
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");
const authRoutes = require("./routes/auth");
const ruteBuku = require("./routes/books");

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // Logger

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Server Presensi Berjalan!");
});

// --- PENYESUAIAN RUTE (Menambahkan /api) ---
// Agar cocok dengan log error: POST /api/auth/register
app.use("/api/books", ruteBuku);
app.use("/api/presensi", presensiRoutes); 
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes); // <--- PENTING: Ini yang memperbaiki error 404 Register

// --- DATABASE SYNC ---
// force: true akan mereset tabel setiap server dinyalakan.
// Jika struktur database sudah benar dan user sudah bisa dibuat, 
// nanti ubah ini menjadi { alter: true } atau hapus parameternya.
db.sequelize.sync({ force: true }).then(() => {
  console.log(">>> DATABASE DI-RESET (Force Sync): Tabel dibuat ulang! <<<");
  
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}/`);
  });
}).catch((err) => {
  console.error("Gagal sinkronisasi database:", err);
});