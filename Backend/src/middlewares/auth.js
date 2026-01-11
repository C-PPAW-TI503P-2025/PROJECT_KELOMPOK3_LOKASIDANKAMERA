const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'Token tidak ditemukan');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // simpan user hasil decode ke request
    req.user = decoded;

    next();
  } catch (err) {
    return errorResponse(res, 401, 'Token tidak valid');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Akses ditolak. Hanya admin yang dapat mengakses');
  }
  next();
};

const isPetugas = (req, res, next) => {
  if (req.user.role !== 'petugas') {
    return errorResponse(res, 403, 'Akses ditolak. Hanya petugas yang dapat mengakses');
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin,
  isPetugas
};
