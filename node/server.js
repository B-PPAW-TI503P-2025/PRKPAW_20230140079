const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = 3001;

const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");
const authRoutes = require("./routes/auth")

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("✅ Home Page for API Presensi");
});

app.use("/api/presensi", presensiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/route", authRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
});
