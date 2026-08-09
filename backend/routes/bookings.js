const express = require('express');
const { body, validationResult } = require('express-validator');
const { run, get, all } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const genCode = () => 'BLT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();

// ── رزرو جدید ─────────────────────────────────────────────
router.post('/', authMiddleware, [
  body('trip_id').isInt(),
  body('passenger_name').trim().notEmpty().withMessage('نام مسافر الزامی'),
  body('passenger_national_id').trim().isLength({min:10,max:10}).withMessage('کد ملی ۱۰ رقم باشد'),
  body('passengers').optional().isInt({min:1,max:9}),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message:err.array()[0].msg });

  const { trip_id, passengers=1, passenger_name, passenger_national_id, passenger_phone, notes } = req.body;
  try {
    const trip = await get('SELECT * FROM trips WHERE id=? AND is_active=1',[trip_id]);
    if (!trip)                       return res.status(404).json({ message:'سفر یافت نشد' });
    if (trip.available_seats < passengers) return res.status(400).json({ message:`فقط ${trip.available_seats} صندلی موجود است` });
    if (new Date(trip.departure_time) < new Date()) return res.status(400).json({ message:'این سفر گذشته است' });

    const total_price  = trip.price * passengers;
    const booking_code = genCode();

    await run('BEGIN');
    try {
      const r = await run(
        `INSERT INTO bookings(booking_code,user_id,trip_id,passengers,total_price,status,passenger_name,passenger_national_id,passenger_phone,notes)
         VALUES(?,?,?,?,?,'confirmed',?,?,?,?)`,
        [booking_code, req.user.id, trip_id, passengers, total_price, passenger_name, passenger_national_id, passenger_phone||null, notes||null]
      );
      await run('UPDATE trips SET available_seats=available_seats-? WHERE id=?',[passengers, trip_id]);
      await run('COMMIT');
      res.status(201).json({ message:'رزرو ثبت شد', booking_id:r.lastID, booking_code, total_price });
    } catch(e) { await run('ROLLBACK'); throw e; }
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── رزروهای من ────────────────────────────────────────────
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await all(`
      SELECT b.*,t.type,t.from_city,t.to_city,t.departure_time,t.arrival_time,t.company,t.class,
             (SELECT COUNT(*) FROM reviews r WHERE r.booking_id=b.id) as has_review
      FROM bookings b JOIN trips t ON t.id=b.trip_id
      WHERE b.user_id=? ORDER BY b.created_at DESC`, [req.user.id]);
    res.json({ bookings });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── جزئیات رزرو ───────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await get(`
      SELECT b.*,t.type,t.from_city,t.to_city,t.departure_time,t.arrival_time,t.company,t.class,t.amenities
      FROM bookings b JOIN trips t ON t.id=b.trip_id
      WHERE b.id=? AND (b.user_id=? OR ?='admin')`,
      [req.params.id, req.user.id, req.user.role]);
    if (!booking) return res.status(404).json({ message:'رزرو یافت نشد' });
    res.json({ booking });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── لغو رزرو ──────────────────────────────────────────────
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await get("SELECT * FROM bookings WHERE id=? AND user_id=?",[req.params.id, req.user.id]);
    if (!booking)                        return res.status(404).json({ message:'رزرو یافت نشد' });
    if (booking.status !== 'confirmed')  return res.status(400).json({ message:'این رزرو قابل لغو نیست' });

    const trip = await get('SELECT departure_time FROM trips WHERE id=?',[booking.trip_id]);
    const hoursLeft = (new Date(trip.departure_time) - new Date()) / 3600000;
    if (hoursLeft < 2) return res.status(400).json({ message:'لغو کمتر از ۲ ساعت قبل از سفر امکان‌پذیر نیست' });

    await run('BEGIN');
    try {
      await run("UPDATE bookings SET status='cancelled',cancelled_at=CURRENT_TIMESTAMP WHERE id=?",[req.params.id]);
      await run("UPDATE trips SET available_seats=available_seats+? WHERE id=?",[booking.passengers, booking.trip_id]);
      await run('COMMIT');
      res.json({ message:'رزرو لغو شد' });
    } catch(e) { await run('ROLLBACK'); throw e; }
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

// ── همه رزروها (ادمین) ────────────────────────────────────
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { page=1, limit=20 } = req.query;
  try {
    const bookings = await all(`
      SELECT b.*,u.name as user_name,u.email as user_email,t.type,t.from_city,t.to_city,t.departure_time,t.company
      FROM bookings b JOIN users u ON u.id=b.user_id JOIN trips t ON t.id=b.trip_id
      ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      [Number(limit), (Number(page)-1)*Number(limit)]);
    const { c: total } = await get('SELECT COUNT(*) as c FROM bookings');
    res.json({ bookings, total, page:Number(page) });
  } catch(e) { res.status(500).json({ message:'خطای سرور', error:e.message }); }
});

module.exports = router;
