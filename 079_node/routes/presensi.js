const express = require("express");
const router = express.Router();
const presensiController = require("../controllers/presensiController");
const { authenticateToken } = require("../middleware/permissionMiddleware");

router.use(authenticateToken);

// --- TAMBAHKAN BAGIAN INI AGAR REPORT BISA DIBUKA ---
// Ini membuka pintu untuk React mengambil data (GET /api/attendance)
router.get("/", presensiController.getAllPresensi); 

router.post(
  "/check-in",
  [authenticateToken, presensiController.upload.single("image")],
  presensiController.CheckIn
);
router.post("/check-out", presensiController.CheckOut);

router.put("/:id", presensiController.updatePresensi);
router.delete("/:id", presensiController.hapusPresensi);

module.exports = router;