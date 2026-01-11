
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

console.log({
  register: authController.register,
  login: authController.login,
  logout: authController.logout,
  authenticate
});


// POST /api/auth/register - Register petugas baru
router.post('/register', authController.register);

// POST /api/auth/login - Login (admin & petugas)
router.post('/login', authController.login);

// POST /api/auth/logout - Logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;