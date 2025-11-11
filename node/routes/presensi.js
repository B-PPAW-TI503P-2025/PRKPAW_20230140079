const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const presensiController = require("../controllers/presensiController");
const { addUserData } = require("../middleware/permissionMiddleware");

// Tambahkan data user dummy
router.use(addUserData);

// Endpoint utama
router.post("/check-in", presensiController.CheckIn);
router.post("/check-out", presensiController.CheckOut);

// Validasi untuk PUT
router.put(
  "/:id",
  [
    body("checkIn")
      .optional()
      .isISO8601()
      .withMessage("checkIn harus berupa tanggal valid (format ISO8601)"),
    body("checkOut")
      .optional()
      .isISO8601()
      .withMessage("checkOut harus berupa tanggal valid (format ISO8601)")
      .custom((value, { req }) => {
        if (req.body.checkIn && new Date(value) < new Date(req.body.checkIn)) {
          throw new Error("checkOut harus lebih besar dari checkIn");
        }
        return true;
      }),
  ],
  presensiController.updatePresensi
);

router.delete("/:id", presensiController.deletePresensi);

module.exports = router;
