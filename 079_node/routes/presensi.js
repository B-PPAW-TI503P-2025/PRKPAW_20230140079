const express = require("express");
const router = express.Router();
const presensiController = require("../controllers/presensiController");
const { authenticateToken } = require("../middleware/permissionMiddleware");

router.use(authenticateToken);

router.post("/check-in", presensiController.CheckIn);
router.post("/check-out", presensiController.CheckOut);

router.put("/:id", presensiController.updatePresensi);

router.delete("/:id", presensiController.hapusPresensi);

module.exports = router;
