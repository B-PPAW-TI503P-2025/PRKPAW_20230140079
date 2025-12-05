const express = require("express");
const router = express.Router();
const presensiController = require("../controllers/presensiController");

// PERBAIKAN: Import 'authenticateToken' dan 'isAdmin' dalam SATU baris saja.
// Pastikan tidak ada baris 'require' lain untuk permissionMiddleware selain ini.
const { authenticateToken, isAdmin } = require("../middleware/permissionMiddleware");

// Middleware ini akan jalan untuk semua rute di bawahnya
router.use(authenticateToken);

// --- RUTE PRESENSI ---

// Khusus Admin: Melihat semua laporan
router.get("/", isAdmin, presensiController.getAllPresensi); 

router.post(
  "/check-in",
  [presensiController.upload.single("image")], // authenticateToken sudah dipanggil di router.use di atas
  presensiController.CheckIn
);

router.post("/check-out", presensiController.CheckOut);

router.put("/:id", presensiController.updatePresensi);
router.delete("/:id", presensiController.hapusPresensi);

module.exports = router;