const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { run, get } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const sign = (u) => jwt.sign({ id:u.id, email:u.email, role:u.role }, process.env.JWT_SECRET, { expiresIn:process.env.JWT_EXPIRES_IN || '7d' });

// â”€â”€ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/register', [
  body('name').trim().notEmpty().isLength({min:2,max:60}),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({min:6}).withMessage('Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø­Ø¯Ø§Ù‚Ù„ Û¶ Ú©Ø§Ø±Ø§Ú©ØªØ±'),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });

  const { name, email, password, phone } = req.body;
  try {
    if (await get('SELECT id FROM users WHERE email=?',[email]))
      return res.status(409).json({ message: 'Ø§ÛŒÙ† Ø§ÛŒÙ…ÛŒÙ„ Ù‚Ø¨Ù„Ø§Ù‹ Ø«Ø¨Øª Ø´Ø¯Ù‡ Ø§Ø³Øª' });

    const hash = bcrypt.hashSync(password, 12);
    const defaultRole = await get('SELECT id FROM roles WHERE name=? LIMIT 1',['user']);
    if (!defaultRole) return res.status(500).json({ message:'??? ??????? ????? ???? ???' });

    const r = await run('INSERT INTO users(name,email,password,phone,role_id,status) VALUES(?,?,?,?,?,?)',
      [name, email, hash, phone||null, defaultRole.id, 'active']);

    const user = { id: r.lastID, name, email, role:'user' };
    res.status(201).json({ message:'Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ù…ÙˆÙÙ‚', token: sign(user), user });
  } catch(e) { res.status(500).json({ message:'Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±', error:e.message }); }
});

// â”€â”€ ÙˆØ±ÙˆØ¯ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });

  const { email, password } = req.body;
  try {
    const user = await get('SELECT u.id,u.name,u.email,u.phone,u.password,u.avatar,u.status,u.role_id,r.name AS role FROM users u LEFT JOIN roles r ON r.id=u.role_id WHERE u.email=? LIMIT 1',[email]);
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message:'Ø§ÛŒÙ…ÛŒÙ„ ÛŒØ§ Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø§Ø´ØªØ¨Ø§Ù‡ Ø§Ø³Øª' });
    if (user.status !== 'active')
      return res.status(403).json({ message:'Ø­Ø³Ø§Ø¨ ØºÛŒØ±ÙØ¹Ø§Ù„ Ø§Ø³Øª' });

    await run('UPDATE users SET last_login_at=CURRENT_TIMESTAMP WHERE id=?',[user.id]);
    const payload = { id:user.id, name:user.name, email:user.email, role:user.role };
    res.json({ message:'ÙˆØ±ÙˆØ¯ Ù…ÙˆÙÙ‚', token: sign(payload), user: payload });
  } catch(e) { res.status(500).json({ message:'Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±', error:e.message }); }
});

// â”€â”€ Ù¾Ø±ÙˆÙØ§ÛŒÙ„ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await get(`SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.avatar,
      u.status,
      u.role_id,
      r.name AS role,
      u.email_verified,
      u.phone_verified,
      u.last_login_at,
      u.created_at,
      u.updated_at
    FROM users u
    LEFT JOIN roles r ON r.id=u.role_id
    WHERE u.id=?
    LIMIT 1`, [req.user.id]);
    if (!user) return res.status(404).json({ message:'Ú©Ø§Ø±Ø¨Ø± ÛŒØ§ÙØª Ù†Ø´Ø¯' });
    res.json({ user });
  } catch(e) { res.status(500).json({ message:'Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±' }); }
});

// â”€â”€ ÙˆÛŒØ±Ø§ÛŒØ´ Ù¾Ø±ÙˆÙØ§ÛŒÙ„ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put('/profile', authMiddleware, [
  body('name').trim().notEmpty().isLength({min:2,max:60}),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });
  const { name, phone } = req.body;
  try {
    await run('UPDATE users SET name=?,phone=? WHERE id=?',
      [name, phone||null, req.user.id]);
    res.json({ message:'Ù¾Ø±ÙˆÙØ§ÛŒÙ„ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯' });
  } catch(e) { res.status(500).json({ message:'Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±' }); }
});

// â”€â”€ ØªØºÛŒÛŒØ± Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put('/change-password', authMiddleware, [
  body('new_password').isLength({min:6}).withMessage('Ø±Ù…Ø² Ø¬Ø¯ÛŒØ¯ Ø­Ø¯Ø§Ù‚Ù„ Û¶ Ú©Ø§Ø±Ø§Ú©ØªØ±'),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });
  const { current_password, new_password } = req.body;
  try {
    const user = await get('SELECT password FROM users WHERE id=?',[req.user.id]);
    if (!bcrypt.compareSync(current_password, user.password))
      return res.status(400).json({ message:'Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± ÙØ¹Ù„ÛŒ Ø§Ø´ØªØ¨Ø§Ù‡ Ø§Ø³Øª' });
    await run('UPDATE users SET password=? WHERE id=?',[bcrypt.hashSync(new_password,12), req.user.id]);
    res.json({ message:'Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± ØªØºÛŒÛŒØ± Ú©Ø±Ø¯' });
  } catch(e) { res.status(500).json({ message:'Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±' }); }
});

module.exports = router;



