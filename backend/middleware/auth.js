const jwt = require('jsonwebtoken');
const { get } = require('../config/database');

const getAuthenticatedUser = async (userId) => {
  if (!userId) return null;

  return get(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.phone,
       u.avatar,
       u.status,
       u.role_id,
       r.name AS role
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );
};

const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ message: 'لطفاً وارد حساب کاربری شوید' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ message: 'خطای پیکربندی سرور' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'توکن نامعتبر است' });
    }

    const user = await getAuthenticatedUser(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'کاربر یافت نشد' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'حساب کاربری فعال نیست' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'نشست منقضی شده است، دوباره وارد شوید'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'توکن نامعتبر است' });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'خطای احراز هویت' });
  }
};

const adminMiddleware = (req, res, next) => {
  const role = req.user?.role;

  if (role === 'admin' || role === 'super_admin') {
    return next();
  }

  return res.status(403).json({
    message: 'دسترسی فقط برای مدیران مجاز است'
  });
};

const optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;

  if (!token) {
    return next();
  }

  try {
    if (!process.env.JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return next();
    }

    const user = await getAuthenticatedUser(decoded.id);

    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch {
    // optionalAuth must not block public requests because of an invalid token.
  }

  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuth
};
