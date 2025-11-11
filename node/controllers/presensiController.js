const { Presensi } = require("../models");
const { validationResult } = require("express-validator");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

// ✅ Check-In
exports.CheckIn = async (req, res) => {
  try {
    const { nama } = req.body; // Bisa custom nama
    const waktuSekarang = new Date();

    const newRecord = await Presensi.create({
      nama: nama || "Pengguna Tanpa Nama",
      checkIn: waktuSekarang,
    });

    res.status(201).json({
      message: `Halo ${newRecord.nama}, check-in berhasil pada ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// ✅ Check-Out
exports.CheckOut = async (req, res) => {
  try {
    const { nama } = req.body;
    const waktuSekarang = new Date();

    const record = await Presensi.findOne({
      where: { nama, checkOut: null },
    });

    if (!record) {
      return res.status(404).json({ message: "Tidak ditemukan catatan check-in aktif untuk nama ini." });
    }

    record.checkOut = waktuSekarang;
    await record.save();

    res.json({
      message: `Check-out berhasil untuk ${record.nama} pada ${format(waktuSekarang, "HH:mm:ss", { timeZone })} WIB`,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// ✅ Update Presensi
exports.updatePresensi = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { id } = req.params;
    const { checkIn, checkOut, nama } = req.body;

    const record = await Presensi.findByPk(id);
    if (!record) return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });

    record.checkIn = checkIn || record.checkIn;
    record.checkOut = checkOut || record.checkOut;
    record.nama = nama || record.nama;
    await record.save();

    res.json({ message: "Data presensi berhasil diperbarui.", data: record });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// ✅ Delete Presensi
exports.deletePresensi = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Presensi.findByPk(id);

    if (!record) return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });

    await record.destroy();
    res.status(200).json({ message: "Catatan presensi berhasil dihapus.", deletedId: id });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};
