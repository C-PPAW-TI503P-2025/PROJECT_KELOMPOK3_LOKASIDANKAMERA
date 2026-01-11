const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/reponse');

const prisma = new PrismaClient();

// Register (Petugas only)
const register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    // Validasi input
    if (!nama || !email || !password) {
      return errorResponse(res, 400, 'Semua field harus diisi');
    }

    // Cek email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 400, 'Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: 'petugas'
      },
      select: {
        user_id: true,
        nama: true,
        email: true,
        role: true
      }
    });

    return successResponse(res, 201, 'Registrasi berhasil', user);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat registrasi');
  }
};

// Login (Admin & Petugas)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return errorResponse(res, 400, 'Email dan password harus diisi');
    }

    // Cari user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return errorResponse(res, 401, 'Email atau password salah');
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Email atau password salah');
    }

    // Generate token
    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    // Response tanpa password
    const userData = {
      user_id: user.user_id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      token
    };

    return successResponse(res, 200, 'Login berhasil', userData);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat login');
  }
};

// Logout
const logout = async (req, res) => {
  // Untuk stateless JWT, logout dilakukan di client side
  // Hapus token dari local storage/cookie
  return successResponse(res, 200, 'Logout berhasil');
};

module.exports = { register, login, logout };