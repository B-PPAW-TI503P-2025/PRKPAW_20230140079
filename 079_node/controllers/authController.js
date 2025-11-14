console.log(
  "Nilai JWT_SECRET di authController.js (atas):",
  process.env.JWT_SECRET
);

const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Tentukan Kunci Rahasia Anda di sini (Simpan di .env di aplikasi nyata)
const JWT_SECRET = process.env.JWT_SECRET;

// --- FUNGSI REGISTRASI ---
exports.register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    // 1. Validasi input dasar
    if (!nama || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nama, email, dan password harus diisi" });
    }

    // 2. Validasi role (jika dikirim, jika tidak akan pakai default 'mahasiswa')
    if (role && !["mahasiswa", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role tidak valid. Harus 'mahasiswa' atau 'admin'." });
    }

    // 3. Hash password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 adalah salt rounds

    // 4. Buat user baru di database
    const newUser = await User.create({
      nama,
      email,
      password: hashedPassword,
      role: role || "mahasiswa", // Jika role tidak dikirim, default ke 'mahasiswa'
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      data: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    // 5. Tangani error jika email sudah terdaftar (karena 'unique: true')
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// --- FUNGSI LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan." });
    }

    // 2. Bandingkan password yang dimasukkan dengan hash di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah." });
    }

    // 3. Buat Payload (data) untuk JWT
    const payload = {
      id: user.id,
      nama: user.nama,
      role: user.role, // Masukkan role ke dalam token
    };

    // 4. Buat dan tandatangani JWT
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h", // Token akan kedaluwarsa dalam 1 jam
    });

    res.json({
      message: "Login berhasil",
      token: token, // Kirim token ke klien
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error); // <--- WAJIB TAMBAHKAN INI

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};
