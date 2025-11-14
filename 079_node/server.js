require("dotenv").config();
console.log("Nilai JWT_SECRET di server.js:", process.env.JWT_SECRET);
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;
const morgan = require("morgan");

// Impor router
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");

const authRoutes = require("./routes/auth"); // <-- Impor rute auth

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Home Page for API");
});

const ruteBuku = require("./routes/books");

app.use("/api/books", ruteBuku);

app.use("/api/attendance", presensiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes); // <-- Daftarkan rute /api/auth

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});
