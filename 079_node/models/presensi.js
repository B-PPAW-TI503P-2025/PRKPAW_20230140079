const express = require('express');
const router = express.Router();
const { Presensi, User } = require('../models'); 
const { authenticateToken } = require('../middleware/permissionMiddleware');

// CHECK-IN
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const newPresensi = await Presensi.create({
      userId,
      status: 'masuk',
      waktu: new Date()
    });

    res.status(201).json({ 
      message: "Check-in berhasil", 
      data: newPresensi 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Terjadi kesalahan server", 
      error: error.message 
    });
  }
});

// CHECK-OUT
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const newPresensi = await Presensi.create({
      userId,
      status: 'pulang',
      waktu: new Date()
    });

    res.status(201).json({ 
      message: "Check-out berhasil", 
      data: newPresensi 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Terjadi kesalahan server", 
      error: error.message 
    });
  }
});

// RIWAYAT PRESENSI
router.get('/', authenticateToken, async (req, res) => {
  try {
    const history = await Presensi.findAll({
      include: [{
        model: User,
        as: 'userData',
        attributes: ['username', 'email']
      }]
    });

    res.json(history);

  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

module.exports = router;
