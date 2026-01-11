const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ============================================
// CREATE LAPORAN
// ============================================
const createLaporan = async (req, res) => {
  try {
    const { latitude, longitude, keterangan } = req.body;
    const user_id = req.user.user_id;

    // Validasi foto
    if (!req.file) {
      return errorResponse(res, 400, 'Foto harus diupload');
    }

    // Validasi input
    if (!latitude || !longitude || !keterangan) {
      // Hapus file yang sudah diupload jika validasi gagal
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, 'Latitude, longitude, dan keterangan harus diisi');
    }

    // Validasi latitude dan longitude format
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, 'Format latitude atau longitude tidak valid');
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, 'Latitude atau longitude di luar jangkauan');
    }

    // Simpan ke database
    const laporan = await prisma.laporanKebersihan.create({
      data: {
        user_id,
        foto: `/uploads/laporan/${req.file.filename}`,
        latitude: lat,
        longitude: lng,
        keterangan: keterangan.trim(),
        status: 'pending'
      },
      select: {
        id: true,
        user_id: true,
        foto: true,
        latitude: true,
        longitude: true,
        keterangan: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(res, 201, 'Laporan berhasil dibuat', laporan);

  } catch (error) {
    console.error('Error creating laporan:', error);
    
    // Hapus file jika terjadi error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return errorResponse(res, 500, 'Terjadi kesalahan saat membuat laporan');
  }
};

// ============================================
// GET LAPORAN SAYA (PETUGAS)
// ============================================
const getMyLaporan = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { status, page = 1, limit = 10 } = req.query;

    // Validasi pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1) {
      return errorResponse(res, 400, 'Page dan limit harus lebih dari 0');
    }

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    // Build where clause
    const where = { user_id };
    
    // Filter by status jika ada
    if (status && ['pending', 'valid', 'invalid'].includes(status)) {
      where.status = status;
    }

    // Get data dengan Promise.all untuk efisiensi
    const [laporan, total] = await Promise.all([
      prisma.laporanKebersihan.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          foto: true,
          latitude: true,
          longitude: true,
          keterangan: true,
          status: true,
          validated_by: true,
          catatan_admin: true,
          createdAt: true,
          updatedAt: true,
          admin: {
            select: {
              user_id: true,
              nama: true
            }
          }
        }
      }),
      prisma.laporanKebersihan.count({ where })
    ]);

    return successResponse(res, 200, 'Data laporan berhasil diambil', {
      laporan,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error getting my laporan:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data laporan');
  }
};

// ============================================
// GET DETAIL LAPORAN BY ID
// ============================================
const getLaporanById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;
    const user_role = req.user.role;

    // Validasi ID
    const laporanId = parseInt(id);
    if (isNaN(laporanId)) {
      return errorResponse(res, 400, 'ID laporan tidak valid');
    }

    // Cari laporan
    const laporan = await prisma.laporanKebersihan.findUnique({
      where: { id: laporanId },
      include: {
        petugas: {
          select: {
            user_id: true,
            nama: true,
            email: true
          }
        },
        admin: {
          select: {
            user_id: true,
            nama: true
          }
        }
      }
    });

    if (!laporan) {
      return errorResponse(res, 404, 'Laporan tidak ditemukan');
    }

    // Petugas hanya bisa lihat laporan sendiri
    if (user_role === 'petugas' && laporan.user_id !== user_id) {
      return errorResponse(res, 403, 'Anda tidak memiliki akses untuk melihat laporan ini');
    }

    return successResponse(res, 200, 'Data laporan berhasil diambil', laporan);

  } catch (error) {
    console.error('Error getting laporan by id:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data laporan');
  }
};

// ============================================
// UPDATE LAPORAN (PETUGAS)
// ============================================
const updateLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;
    const { latitude, longitude, keterangan } = req.body;

    // Validasi ID
    const laporanId = parseInt(id);
    if (isNaN(laporanId)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, 'ID laporan tidak valid');
    }

    // Cek laporan ada atau tidak
    const laporan = await prisma.laporanKebersihan.findUnique({
      where: { id: laporanId }
    });

    if (!laporan) {
      if (req.file) fs.unlinkSync(req.file.path);
      return errorResponse(res, 404, 'Laporan tidak ditemukan');
    }

    // Cek ownership (petugas hanya bisa update laporan sendiri)
    if (laporan.user_id !== user_id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return errorResponse(res, 403, 'Anda tidak memiliki akses untuk mengupdate laporan ini');
    }

    // Tidak bisa update jika sudah diverifikasi
    if (laporan.status !== 'pending') {
      if (req.file) fs.unlinkSync(req.file.path);
      return errorResponse(res, 403, 'Tidak dapat mengupdate laporan yang sudah diverifikasi');
    }

    // Build update data
    const updateData = {};

    // Update foto jika ada file baru
    if (req.file) {
      // Hapus foto lama
      const oldPhotoPath = path.join(__dirname, '../../', laporan.foto);
      if (fs.existsSync(oldPhotoPath)) {
        try {
          fs.unlinkSync(oldPhotoPath);
        } catch (err) {
          console.error('Error deleting old photo:', err);
        }
      }
      updateData.foto = `/uploads/laporan/${req.file.filename}`;
    }

    // Update latitude jika ada
    if (latitude) {
      const lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        if (req.file) fs.unlinkSync(req.file.path);
        return errorResponse(res, 400, 'Format latitude tidak valid');
      }
      updateData.latitude = lat;
    }

    // Update longitude jika ada
    if (longitude) {
      const lng = parseFloat(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        if (req.file) fs.unlinkSync(req.file.path);
        return errorResponse(res, 400, 'Format longitude tidak valid');
      }
      updateData.longitude = lng;
    }

    // Update keterangan jika ada
    if (keterangan) {
      updateData.keterangan = keterangan.trim();
    }

    // Cek apakah ada data yang diupdate
    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, 'Tidak ada data yang diupdate');
    }

    // Update laporan
    const updatedLaporan = await prisma.laporanKebersihan.update({
      where: { id: laporanId },
      data: updateData,
      select: {
        id: true,
        user_id: true,
        foto: true,
        latitude: true,
        longitude: true,
        keterangan: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(res, 200, 'Laporan berhasil diupdate', updatedLaporan);

  } catch (error) {
    console.error('Error updating laporan:', error);
    
    // Hapus file baru jika terjadi error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengupdate laporan');
  }
};

// ============================================
// DELETE LAPORAN (PETUGAS)
// ============================================
const deleteLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    // Validasi ID
    const laporanId = parseInt(id);
    if (isNaN(laporanId)) {
      return errorResponse(res, 400, 'ID laporan tidak valid');
    }

    // Cek laporan
    const laporan = await prisma.laporanKebersihan.findUnique({
      where: { id: laporanId }
    });

    if (!laporan) {
      return errorResponse(res, 404, 'Laporan tidak ditemukan');
    }

    // Cek ownership
    if (laporan.user_id !== user_id) {
      return errorResponse(res, 403, 'Anda tidak memiliki akses untuk menghapus laporan ini');
    }

    // Hapus foto dari storage
    const photoPath = path.join(__dirname, '../../', laporan.foto);
    if (fs.existsSync(photoPath)) {
      try {
        fs.unlinkSync(photoPath);
      } catch (err) {
        console.error('Error deleting photo:', err);
        // Lanjutkan proses hapus meskipun foto gagal dihapus
      }
    }

    // Hapus dari database
    await prisma.laporanKebersihan.delete({
      where: { id: laporanId }
    });

    return successResponse(res, 200, 'Laporan berhasil dihapus');

  } catch (error) {
    console.error('Error deleting laporan:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat menghapus laporan');
  }
};

module.exports = {
  createLaporan,
  getMyLaporan,
  getLaporanById,
  updateLaporan,
  deleteLaporan
};