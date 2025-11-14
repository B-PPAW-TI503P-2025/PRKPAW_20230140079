// File: middleware/permissionMiddleware.js (REVISI TOTAL)

const jwt = require("jsonwebtoken");
// Pastikan Kunci Rahasia ini SAMA PERSIS dengan yang ada di authController.js
const JWT_SECRET =
  process.env.JWT_SECRET || "INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN";

// Ganti nama 'addUserData' menjadi 'authenticateToken'
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (token == null) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Token tidak disediakan." });
  }

  // Verifikasi token
  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token tidak valid atau kedaluwarsa." });
    }

    // PENTING: Token valid, simpan payload (data user) ke req.user
    req.user = userPayload; // userPayload berisi { id, nama, role }
    next();
  });
};

// Middleware 'isAdmin' sekarang akan memeriksa 'role' dari token
exports.isAdmin = (req, res, next) => {
  // Middleware ini harus dijalankan SETELAH authenticateToken
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya untuk admin." });
  }
};
