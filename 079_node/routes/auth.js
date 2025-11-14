const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Endpoint untuk Registrasi Pengguna Baru
// POST http://localhost:3001/api/auth/register
router.post("/register", authController.register);

// Endpoint untuk Login Pengguna
// POST http://localhost:3001/api/auth/login
router.post("/login", authController.login);

module.exports = router;
