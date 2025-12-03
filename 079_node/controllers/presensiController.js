const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";
const multer = require("multer");
const path = require("path");

// --- CONFIG UPLOAD ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- CHECK IN ---
const CheckIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.nama || req.user.username || "User"; 
    const waktuSekarang = new Date();
    const { latitude, longitude } = req.body;
    const buktiFoto = req.file ? req.file.path : null;

    if (!buktiFoto) {
        return res.status(400).json({ message: "Foto bukti wajib diupload!" });
    }

    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "Anda sudah check-in hari ini." });
    }

    const newRecord = await Presensi.create({
      userId: userId,
      checkIn: waktuSekarang,
      latitude: latitude || null,
      longitude: longitude || null,
      buktiFoto: buktiFoto,
    });

    res.status(201).json({
      message: `Halo ${userName}, check-in berhasil pukul ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
      data: newRecord,
    });
  } catch (error) {
    console.error("Error CheckIn:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- CHECK OUT ---
const CheckOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.nama || req.user.username || "User";
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
      order: [['checkIn', 'DESC']]
    });

    if (!recordToUpdate) {
      return res.status(404).json({ message: "Belum ada data check-in aktif." });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    res.json({
      message: `Bye ${userName}, check-out berhasil pukul ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
      data: recordToUpdate,
    });
  } catch (error) {
    console.error("Error CheckOut:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- GET ALL PRESENSI (REPORT) ---
// PERBAIKAN: Mengganti 'username' menjadi 'nama' sesuai database Anda
const getAllPresensi = async (req, res) => {
  try {
    const data = await Presensi.findAll({
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['nama', 'email'] // <--- DIGANTI: 'username' jadi 'nama'
      }], 
      order: [['checkIn', 'DESC']]
    });
    res.json(data);
  } catch (error) {
    console.error("Error Get All Report:", error);
    res.status(500).json({ message: "Gagal load report", error: error.message });
  }
};

const hapusPresensi = async (req, res) => {
  try {
    const record = await Presensi.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Data tidak ditemukan" });
    await record.destroy();
    res.status(200).json({ message: "Data dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updatePresensi = async (req, res) => {
    // ... (Logika update sama seperti sebelumnya)
    res.status(200).json({ message: "Fitur update belum diimplementasi penuh" });
};

module.exports = {
  upload,
  CheckIn,
  CheckOut,
  getAllPresensi,
  hapusPresensi,
  updatePresensi
};