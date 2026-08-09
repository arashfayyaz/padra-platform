const jwt = require('jsonwebtoken');
const { get } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message:'لطفاً وارد حساب کاربری شوید' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await get('SELECT id,name,email,role,is_active FROM users WHERE id=?',[decoded.id]);
    if (!user || !user.is_active) return res.status(401).json({ message:'حساب غیرفعال است' });
    req.user = user;
    next();
  } catch(e) {
    if (e.name === 'TokenExpiredError') return res.status(401).json({ message:'نشست منقضی شده، دوباره وارد شوید' });
    return res.status(403).json({ message:'توکن نامعتبر' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message:'دسترسی فقط برای مدیران' });
};

const optionalAuth = async (req, res, next) => {
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return next();
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  next();
};

module.exports = { authMiddleware, adminMiddleware, optionalAuth };
