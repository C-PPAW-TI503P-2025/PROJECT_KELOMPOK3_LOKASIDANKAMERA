const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/reponse');

const prisma = new PrismaClient();

// ============================================
// GET ALL LAPORAN (ADMIN)
// ============================================
const getAllLaporan = async (req, res) => {
  try {
    const { status, user_id, page = 1, limit = 10, search } = req.query;

    // Validasi pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1) {
      return errorResponse(res, 400, 'Page dan limit harus lebih dari 0');
    }

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    // Build where clause
    const where = {};

    // Filter by status
    if (status && ['pending', 'valid', 'invalid'].includes(status)) {
      where.status = status;
    }

    // Filter by user_id (petugas tertentu)
    if (user_id) {
      const userId = parseInt(user_id);
      if (!isNaN(userId)) {
        where.user_id = userId;
      }
    }

    // Search in keterangan
    if (search) {
      where.keterangan = {
        contains: search,
        mode: 'insensitive' // case-insensitive search
      };
    }

    // Get data dengan Promise.all
    const [laporan, total] = await Promise.all([
      prisma.laporanKebersihan.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
    console.error('Error getting all laporan:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data laporan');
  }
};

// ============================================
// GET DETAIL LAPORAN (ADMIN)
// ============================================
const getLaporanDetail = async (req, res) => {
  try {
    const { id } = req.params;

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

    return successResponse(res, 200, 'Data laporan berhasil diambil', laporan);

  } catch (error) {
    console.error('Error getting laporan detail:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data laporan');
  }
};

// ============================================
// VERIFIKASI LAPORAN (ADMIN)
// ============================================
const verifikasiLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;
    const admin_id = req.user.user_id;

    // Validasi ID
    const laporanId = parseInt(id);
    if (isNaN(laporanId)) {
      return errorResponse(res, 400, 'ID laporan tidak valid');
    }

    // Validasi status
    if (!status || !['valid', 'invalid'].includes(status)) {
      return errorResponse(res, 400, 'Status harus "valid" atau "invalid"');
    }

    // Cek laporan ada atau tidak
    const laporan = await prisma.laporanKebersihan.findUnique({
      where: { id: laporanId }
    });

    if (!laporan) {
      return errorResponse(res, 404, 'Laporan tidak ditemukan');
    }

    // Cek apakah laporan masih pending
    if (laporan.status !== 'pending') {
      return errorResponse(res, 400, 'Laporan sudah diverifikasi sebelumnya');
    }

    // Update status laporan
    const updatedLaporan = await prisma.laporanKebersihan.update({
      where: { id: laporanId },
      data: {
        status,
        validated_by: admin_id,
        catatan_admin: catatan_admin ? catatan_admin.trim() : null
      },
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

    return successResponse(res, 200, 'Laporan berhasil diverifikasi', updatedLaporan);

  } catch (error) {
    console.error('Error verifying laporan:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat memverifikasi laporan');
  }
};

// ============================================
// GET STATISTICS (ADMIN) - Optional
// ============================================
const getStatistics = async (req, res) => {
  try {
    // Get counts dengan Promise.all untuk efisiensi
    const [totalLaporan, pending, valid, invalid, totalPetugas] = await Promise.all([
      prisma.laporanKebersihan.count(),
      prisma.laporanKebersihan.count({ where: { status: 'pending' } }),
      prisma.laporanKebersihan.count({ where: { status: 'valid' } }),
      prisma.laporanKebersihan.count({ where: { status: 'invalid' } }),
      prisma.user.count({ where: { role: 'petugas' } })
    ]);

    const statistics = {
      total_laporan: totalLaporan,
      pending,
      valid,
      invalid,
      total_petugas: totalPetugas
    };

    return successResponse(res, 200, 'Data statistik berhasil diambil', statistics);

  } catch (error) {
    console.error('Error getting statistics:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data statistik');
  }
};

module.exports = {
  getAllLaporan,
  getLaporanDetail,
  verifikasiLaporan,
  getStatistics
};