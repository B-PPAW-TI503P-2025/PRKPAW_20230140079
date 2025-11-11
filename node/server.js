const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = 3001;

// Import routes
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("✅ Home Page for API Presensi");
});

app.use("/api/presensi", presensiRoutes);
app.use("/api/reports", reportRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
});
