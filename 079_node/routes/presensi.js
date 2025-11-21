const express = require("express");
const router = express.Router();
const { Presensi, User } = require("../models");
const { authenticateToken } = require("../middleware/permissionMiddleware");
const { checkInOncePerDay } = require("../middleware/checkinLimit");

// ======================
// CHECK-IN
// ======================
router.post("/checkin", authenticateToken, checkInOncePerDay, async (req, res) => {
  try {
    const userId = req.user.id;

    const newPresensi = await Presensi.create({
      userId: userId,
      status: "masuk",
      waktu: new Date(),
    });

    return res.status(201).json({
      status: "success",
      message: "Check-in berhasil",
      data: newPresensi,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

// ======================
// CHECK-OUT
// ======================
router.post("/checkout", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const newPresensi = await Presensi.create({
      userId: userId,
      status: "pulang",
      waktu: new Date(),
    });

    return res.status(201).json({
      status: "success",
      message: "Check-out berhasil",
      data: newPresensi,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
});

// ======================
// GET ALL PRESENSI
// ======================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const history = await Presensi.findAll({
      include: [
        {
          model: User,
          as: "userData",
          attributes: ["username", "email"],
        },
      ],
    });

    return res.json({
      status: "success",
      message: "Berhasil mengambil semua data presensi",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
});

module.exports = router;
