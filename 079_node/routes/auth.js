// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Cek apakah email sudah dipakai
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // 2. Hash Password (Amankan password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Buat User Baru
    // Default role kita set 'user'. Jika mau admin, ubah manual di database nanti.
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user' 
    });

    res.status(201).json({ message: "Registrasi berhasil! Silakan login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
