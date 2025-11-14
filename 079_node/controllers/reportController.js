const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama } = req.query;
    const { tanggal } = req.params;
    let options = { where: {} };

    if (tanggal) {
      options.where.createdAt = {
        [Op.gte]: new Date(tanggal + " 00:00:00"),
        [Op.lte]: new Date(tanggal + " 23:59:59"),
      };
    }

    if (nama) {
      options.where.nama = {
        [Op.like]: `%${nama}%`,
      };
    }

    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString(),

      data: records,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil laporan", error: error.message });
  }
};
