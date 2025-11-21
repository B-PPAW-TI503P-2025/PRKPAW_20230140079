// controllers/authController.js
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "kunci_rahasia_dev";

exports.register = async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Lengkapi semua field" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
      role,
    });

    return res.status(201).json({ success: true, message: "Registrasi berhasil", data: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email & password dibutuhkan" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Email atau password salah" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Email atau password salah" });

    // payload: id, username, role
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    return res.json({ success: true, message: "Login berhasil", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
