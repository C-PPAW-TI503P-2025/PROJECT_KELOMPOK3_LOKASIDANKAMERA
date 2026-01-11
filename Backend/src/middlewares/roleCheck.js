const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_API_KEY',
          message: 'API Key tidak ditemukan. Tambahkan header X-API-Key.'
        }
      });
    }

    if (!isValidApiKeyFormat(apiKey)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Format API Key tidak valid.'
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        apiCalls: true,
        monthlyQuota: true,
        dailyQuota: true,
        lastReset: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'API Key tidak valid. Silakan cek API Key Anda.'
        }
      });
    }

    // Cek apakah perlu reset quota (setiap bulan)
    const now = new Date();
    const lastReset = new Date(user.lastReset);
    const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));

    if (daysSinceReset >= 30) {
      // Reset monthly quota
      await prisma.user.update({
        where: { id: user.id },
        data: {
          apiCalls: 0,
          lastReset: now
        }
      });
      user.apiCalls = 0;
    }

    // Cek quota
    if (user.apiCalls >= user.monthlyQuota) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Quota bulanan Anda telah habis. Upgrade plan untuk mendapatkan quota lebih besar.',
          retryAfter: 86400
        }
      });
    }

    // Increment API calls
    await prisma.user.update({
      where: { id: user.id },
      data: {
        apiCalls: {
          increment: 1
        }
      }
    });

    // Log API usage
    await prisma.apiUsage.create({
      data: {
        userId: user.id,
        endpoint: req.path,
        method: req.method,
        statusCode: 200
      }
    });

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', user.monthlyQuota);
    res.setHeader('X-RateLimit-Remaining', user.monthlyQuota - user.apiCalls - 1);
    
    const resetDate = new Date(lastReset);
    resetDate.setDate(resetDate.getDate() + 30);
    res.setHeader('X-RateLimit-Reset', Math.floor(resetDate.getTime() / 1000));

    req.apiUser = user;
    next();
  } catch (error) {
    console.error('API Key validation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan server'
      }
    });
  }
};

module.exports = {
  validateApiKey
};