const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- KONFIGURASI MULTER (SESUAI MODUL) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pastikan folder uploads ada
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir); 
  },
  filename: (req, file, cb) => {
    // Format nama file sesuai modul: userId-timestamp.ext
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
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

// --- CHECK IN (MODUL 10) ---
exports.CheckIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.nama || req.user.username || "User"; 
    const waktuSekarang = new Date();

    const { latitude, longitude } = req.body;
    
    // Ambil path foto dari req.file
    const buktiFoto = req.file ? req.file.path : null; 

    // Validasi Wajib Foto
    if (!buktiFoto) {
        return res.status(400).json({ message: "Foto selfie wajib disertakan!" });
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
      message: `Halo ${userName}, check-in berhasil!`,
      data: newRecord,
    });
  } catch (error) {
    console.error("Error CheckIn:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- CHECK OUT ---
exports.CheckOut = async (req, res) => {
  try {
    const userId = req.user.id;
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
      message: `Check-out berhasil! Hati-hati di jalan.`,
      data: recordToUpdate,
    });
  } catch (error) {
    console.error("Error CheckOut:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- GET ALL PRESENSI (REPORT) ---
exports.getAllPresensi = async (req, res) => {
  try {
    const data = await Presensi.findAll({
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['nama', 'email'] 
      }], 
      order: [['checkIn', 'DESC']]
    });
    res.json(data);
  } catch (error) {
    console.error("Error Report:", error);
    res.status(500).json({ message: "Gagal load report", error: error.message });
  }
};

// --- FUNGSI TAMBAHAN (MENCEGAH ERROR ROUTE) ---
// Fungsi ini ditambahkan agar routes/presensi.js tidak crash karena undefined

exports.updatePresensi = async (req, res) => {
    try {
        const presensiId = req.params.id;
        const { checkIn, checkOut } = req.body;
        const record = await Presensi.findByPk(presensiId);
        
        if (!record) return res.status(404).json({ message: "Data tidak ditemukan" });

        if (checkIn) record.checkIn = checkIn;
        if (checkOut) record.checkOut = checkOut;
        
        await record.save();
        res.json({ message: "Data berhasil diupdate", data: record });
    } catch (error) {
        res.status(500).json({ message: "Gagal update", error: error.message });
    }
};

exports.hapusPresensi = async (req, res) => {
    try {
        const record = await Presensi.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: "Data tidak ditemukan" });
        
        await record.destroy();
        res.json({ message: "Data berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal hapus", error: error.message });
    }
};

// Ekspor Upload Middleware juga
exports.upload = upload;