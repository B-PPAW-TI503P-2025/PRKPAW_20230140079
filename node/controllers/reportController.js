const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    const where = {};

    if (nama) {
      where.nama = { [Op.like]: `%${nama}%` };
    }

    if (tanggalMulai && tanggalSelesai) {
      // ubah agar bisa cari sepanjang hari, bukan jam exact
      const start = new Date(`${tanggalMulai} 00:00:00`);
      const end = new Date(`${tanggalSelesai} 23:59:59`);
      where.checkIn = { [Op.between]: [start, end] };
    }

    const records = await Presensi.findAll({ where });

    res.json({
      message: "Laporan harian berhasil diambil",
      reportDate: new Date().toLocaleDateString("id-ID"),
      total: records.length,
      data: records,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil laporan", error: error.message });
  }
};
