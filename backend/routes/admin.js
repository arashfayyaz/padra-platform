const express = require('express');
const { run, get, all } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.get('/users', async (req, res) => {
  const { page=1, limit=20, search } = req.query;
  let sql = 'SELECT id,name,email,phone,role,is_active,last_login,created_at FROM users';
  const p = [];
  if (search) { sql += ' WHERE name LIKE ? OR email LIKE ?'; p.push(`%${search}%`,`%${search}%`); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  p.push(Number(limit),(Number(page)-1)*Number(limit));
  try {
    const users = await all(sql, p);
    const { c: total } = await get('SELECT COUNT(*) as c FROM users');
    res.json({ users, total });
  } catch(e) { res.status(500).json({ message:'خطای سرور' }); }
});

router.put('/users/:id/toggle', async (req, res) => {
  try {
    const u = await get('SELECT * FROM users WHERE id=?',[req.params.id]);
    if (!u) return res.status(404).json({ message:'کاربر یافت نشد' });
    if (u.role==='admin') return res.status(400).json({ message:'نمی‌توان ادمین را غیرفعال کرد' });
    await run('UPDATE users SET is_active=? WHERE id=?',[u.is_active?0:1, req.params.id]);
    res.json({ message: u.is_active?'کاربر غیرفعال شد':'کاربر فعال شد' });
  } catch(e) { res.status(500).json({ message:'خطای سرور' }); }
});

router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user','admin'].includes(role)) return res.status(400).json({ message:'نقش نامعتبر' });
  try {
    await run('UPDATE users SET role=? WHERE id=?',[role, req.params.id]);
    res.json({ message:'نقش کاربر تغییر کرد' });
  } catch(e) { res.status(500).json({ message:'خطای سرور' }); }
});

module.exports = router;
