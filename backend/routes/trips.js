const express = require('express');
const { body, validationResult } = require('express-validator');
const { run, get, all } = require('../config/database');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── جستجو ─────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  const { from, to, date, type, min_price, max_price, sort='price_asc' } = req.query;

  let sql = `SELECT t.*, COALESCE(AVG(r.rating),0) as avg_rating, COUNT(r.id) as review_count
             FROM trips t LEFT JOIN reviews r ON r.trip_id=t.id
             WHERE t.is_active=1 AND t.available_seats>0`;
  const p = [];

  if (from)      { sql += ' AND t.from_city LIKE ?'; p.push(`%${from}%`); }
  if (to)        { sql += ' AND t.to_city LIKE ?';   p.push(`%${to}%`); }
  if (type)      { sql += ' AND t.type=?';            p.push(type); }
  if (min_price) { sql += ' AND t.price>=?';          p.push(Number(min_price)); }
  if (max_price) { sql += ' AND t.price<=?';          p.push(Number(max_price)); }
  if (date)      { sql += ' AND DATE(t.departure_time)=?'; p.push(date); }

  sql += ' GROUP BY t.id';
  const sortMap = { price_asc:' ORDER BY t.price ASC', price_desc:' ORDER BY t.price DESC', time_asc:' ORDER BY t.departure_time ASC', rating:' ORDER BY avg_rating DESC' };
  sql += sortMap[sort] || sortMap.price_asc;

  try { res.json({ trips: await all(sql, p) }); }
  catch(e) { res.status(500).json({ message:'خطا در جستجو', error:e.message }); }
});

// ── آمار (ادمین) ──────────────────────────────────────────
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [total_trips, total_bookings, total_users, rev, by_type, recent_bookings] = await Promise.all([
      get("SELECT COUNT(*) as c FROM trips WHERE is_active=1"),
      get("SELECT COUNT(*) as c FROM bookings WHERE status='confirmed'"),
      get("SELECT COUNT(*) as c FROM users WHERE role='user'"),
      get("SELECT COALESCE(SUM(total_price),0) as s FROM bookings WHERE status='confirmed'"),
      all("SELECT type, COUNT(*) as c FROM trips GROUP BY type"),
      all(`SELECT b.id,b.booking_code,b.total_price,b.created_at,u.name as user_name,t.from_city,t.to_city,t.type
           FROM bookings b JOIN users u ON u.id=b.user_id JOIN trips t ON t.id=b.trip_id
           WHERE b.status='confirmed' ORDER BY b.created_at DESC LIMIT 10`),
    ]);
    res.json({ stats:{ total_trips:total_trips.c, total_bookings:total_bookings.c, total_users:total_users.c, total_revenue:rev.s, by_type, recent_bookings } });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── همه سفرها ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const trips = await all(`SELECT t.*, COALESCE(AVG(r.rating),0) as avg_rating, COUNT(r.id) as review_count
      FROM trips t LEFT JOIN reviews r ON r.trip_id=t.id
      WHERE t.is_active=1 GROUP BY t.id ORDER BY t.departure_time ASC LIMIT 50`);
    res.json({ trips });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── جزئیات یک سفر ─────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const trip = await get(`SELECT t.*, COALESCE(AVG(r.rating),0) as avg_rating, COUNT(r.id) as review_count
      FROM trips t LEFT JOIN reviews r ON r.trip_id=t.id WHERE t.id=? GROUP BY t.id`, [req.params.id]);
    if (!trip) return res.status(404).json({ message:'سفر یافت نشد' });

    const reviews = await all(`SELECT r.*,u.name as user_name FROM reviews r
      JOIN users u ON u.id=r.user_id WHERE r.trip_id=? ORDER BY r.created_at DESC LIMIT 20`, [req.params.id]);

    res.json({ trip, reviews });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── افزودن سفر (ادمین) ───────────────────────────────────
router.post('/', authMiddleware, adminMiddleware, [
  body('type').isIn(['flight','train','bus']),
  body('from_city').trim().notEmpty(),
  body('to_city').trim().notEmpty(),
  body('price').isInt({min:1000}),
  body('capacity').isInt({min:1}),
  body('company').trim().notEmpty(),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message:err.array()[0].msg });

  const { type,from_city,to_city,departure_time,arrival_time,price,capacity,company,class:cls,amenities } = req.body;
  try {
    const r = await run(
      'INSERT INTO trips(type,from_city,to_city,departure_time,arrival_time,price,capacity,available_seats,company,class,amenities) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
      [type,from_city,to_city,departure_time,arrival_time,price,capacity,capacity,company,cls||'economy',JSON.stringify(amenities||[])]
    );
    res.status(201).json({ message:'سفر افزوده شد', id:r.lastID });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── ویرایش سفر (ادمین) ───────────────────────────────────
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { type,from_city,to_city,departure_time,arrival_time,price,capacity,company,class:cls,amenities,is_active } = req.body;
  try {
    const t = await get('SELECT * FROM trips WHERE id=?',[req.params.id]);
    if (!t) return res.status(404).json({ message:'سفر یافت نشد' });

    await run(`UPDATE trips SET type=?,from_city=?,to_city=?,departure_time=?,arrival_time=?,price=?,capacity=?,company=?,class=?,amenities=?,is_active=? WHERE id=?`,
      [type||t.type, from_city||t.from_city, to_city||t.to_city,
       departure_time||t.departure_time, arrival_time||t.arrival_time,
       price||t.price, capacity||t.capacity, company||t.company,
       cls||t.class, JSON.stringify(amenities||JSON.parse(t.amenities||'[]')),
       is_active!==undefined?(is_active?1:0):t.is_active, req.params.id]);
    res.json({ message:'سفر ویرایش شد' });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── حذف سفر (ادمین) ──────────────────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bc = await get("SELECT COUNT(*) as c FROM bookings WHERE trip_id=? AND status='confirmed'",[req.params.id]);
    if (bc.c > 0) return res.status(400).json({ message:`${bc.c} رزرو فعال دارد` });
    await run('UPDATE trips SET is_active=0 WHERE id=?',[req.params.id]);
    res.json({ message:'سفر غیرفعال شد' });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── ثبت نظر ──────────────────────────────────────────────
router.post('/:id/reviews', authMiddleware, [body('rating').isInt({min:1,max:5})], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message:err.array()[0].msg });
  const { rating, comment, booking_id } = req.body;
  try {
    const booking = await get("SELECT * FROM bookings WHERE id=? AND user_id=? AND trip_id=? AND status IN ('confirmed','used')",
      [booking_id, req.user.id, req.params.id]);
    if (!booking) return res.status(403).json({ message:'فقط خریداران می‌توانند نظر دهند' });
    await run('INSERT OR IGNORE INTO reviews(user_id,trip_id,booking_id,rating,comment) VALUES(?,?,?,?,?)',
      [req.user.id, req.params.id, booking_id, rating, comment||null]);
    res.status(201).json({ message:'نظر ثبت شد' });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

module.exports = router;
