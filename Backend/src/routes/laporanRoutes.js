const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Semua route di sini harus authenticated sebagai petugas
router.use(authenticate);

// POST /api/laporan - Create laporan baru
router.post('/', upload.single('foto'), laporanController.createLaporan);

// GET /api/laporan/me - Get laporan saya
router.get('/me', laporanController.getMyLaporan);

// GET /api/laporan/:id - Get detail laporan
router.get('/:id', laporanController.getLaporanById);

// PUT /api/laporan/:id - Update laporan
router.put('/:id', upload.single('foto'), laporanController.updateLaporan);

// DELETE /api/laporan/:id - Delete laporan
router.delete('/:id', laporanController.deleteLaporan);

module.exports = router;