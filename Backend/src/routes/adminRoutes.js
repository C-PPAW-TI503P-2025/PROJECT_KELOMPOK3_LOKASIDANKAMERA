const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middlewares/auth');

// Semua route di sini harus authenticated sebagai admin
router.use(authenticate);

// GET /api/admin/laporan - Get all laporan
router.get('/laporan', adminController.getAllLaporan);

// GET /api/admin/laporan/:id - Get detail laporan
router.get('/laporan/:id', adminController.getLaporanDetail);

// PUT /api/admin/laporan/:id/verify - Verifikasi laporan
router.put('/laporan/:id/verify', adminController.verifikasiLaporan);

// GET /api/admin/statistics - Get statistics (optional)
router.get('/statistics', adminController.getStatistics);

module.exports = router;