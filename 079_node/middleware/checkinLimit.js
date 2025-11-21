const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.checkInOncePerDay = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyCheckedIn = await Presensi.findOne({
      where: {
        userId,
        status: "masuk",
        waktu: {
          [Op.gte]: today
        }
      }
    });

    if (alreadyCheckedIn) {
      return res.status(400).json({
        message: "Anda sudah check-in hari ini."
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
