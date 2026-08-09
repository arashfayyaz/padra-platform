const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { run, get } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const sign = (u) => jwt.sign({ id:u.id, email:u.email, role:u.role }, process.env.JWT_SECRET, { expiresIn:'7d' });

// ── ثبت‌نام ───────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().isLength({min:2,max:60}),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({min:6}).withMessage('رمز عبور حداقل ۶ کاراکتر'),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });

  const { name, email, password, phone, national_id } = req.body;
  try {
    if (await get('SELECT id FROM users WHERE email=?',[email]))
      return res.status(409).json({ message: 'این ایمیل قبلاً ثبت شده است' });

    const hash = bcrypt.hashSync(password, 12);
    const r = await run('INSERT INTO users(name,email,password,phone,national_id) VALUES(?,?,?,?,?)',
      [name, email, hash, phone||null, national_id||null]);

    const user = { id: r.lastID, name, email, role:'user' };
    res.status(201).json({ message:'ثبت‌نام موفق', token: sign(user), user });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── ورود ─────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });

  const { email, password } = req.body;
  try {
    const user = await get('SELECT * FROM users WHERE email=?',[email]);
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message:'ایمیل یا رمز عبور اشتباه است' });
    if (!user.is_active)
      return res.status(403).json({ message:'حساب غیرفعال است' });

    await run('UPDATE users SET last_login=CURRENT_TIMESTAMP WHERE id=?',[user.id]);
    const payload = { id:user.id, name:user.name, email:user.email, role:user.role };
    res.json({ message:'ورود موفق', token: sign(payload), user: payload });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── پروفایل ───────────────────────────────────────────────
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await get('SELECT id,name,email,phone,national_id,role,avatar,last_login,created_at FROM users WHERE id=?',[req.user.id]);
    if (!user) return res.status(404).json({ message:'کاربر یافت نشد' });
    res.json({ user });
  } catch(e) { res.status(500).json({ message:'خطای سرور' }); }
});

// ── ویرایش پروفایل ────────────────────────────────────────
router.put('/profile', authMiddleware, [
  body('name').trim().notEmpty().isLength({min:2,max:60}),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });
  const { name, phone, national_id } = req.body;
  try {
    await run('UPDATE users SET name=?,phone=?,national_id=? WHERE id=?',
      [name, phone||null, national_id||null, req.user.id]);
    res.json({ message:'پروفایل بروزرسانی شد' });
  } catch(e) { res.status(500).json({ message:'خطای سرور' }); }
});

// ── تغییر رمز عبور ────────────────────────────────────────
router.put('/change-password', authMiddleware, [
  body('new_password').isLength({min:6}).withMessage('رمز جدید حداقل ۶ کاراکتر'),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });
  const { current_password, new_password } = req.body;
  try {
    const user = await get('SELECT password FROM users WHERE id=?',[req.user.id]);
    if (!bcrypt.compareSync(current_password, user.password))
      return res.status(400).json({ message:'رمز عبور فعلی اشتباه است' });
    await run('UPDATE users SET password=? WHERE id=?',[bcrypt.hashSync(new_password,12), req.user.id]);
    res.json({ message:'رمز عبور تغییر کرد' });
  } catch(e) { res.status(500).json({ message:'خطای سرور' }); }
});

module.exports = router;
