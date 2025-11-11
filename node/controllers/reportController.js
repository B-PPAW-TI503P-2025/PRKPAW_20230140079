const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let options = { where: {} };

    // Filter berdasarkan nama (jika ada)
    if (nama) {
      options.where.nama = {
        [Op.like]: `%${nama}%`,
      };
    }

    // Filter berdasarkan rentang tanggal (jika dua-duanya dikirim)
    if (tanggalMulai && tanggalSelesai) {
      options.where.tanggal = {
        [Op.between]: [tanggalMulai, tanggalSelesai],
      };
    }

    // Ambil data dari database sesuai filter
    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString(),
      filter: { nama, tanggalMulai, tanggalSelesai },
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan",
      error: error.message,
    });
  }
};
