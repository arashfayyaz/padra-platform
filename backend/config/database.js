const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const fs      = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(path.join(dataDir, 'tickets.db'), (err) => {
  if (err) { console.error('❌ خطا در باز کردن دیتابیس:', err.message); process.exit(1); }
});

// ── Promise helpers ───────────────────────────────────────
const run = (sql, p = []) =>
  new Promise((res, rej) => db.run(sql, p, function(e) { e ? rej(e) : res(this); }));

const get = (sql, p = []) =>
  new Promise((res, rej) => db.get(sql, p, (e, r) => e ? rej(e) : res(r)));

const all = (sql, p = []) =>
  new Promise((res, rej) => db.all(sql, p, (e, rs) => e ? rej(e) : res(rs)));

// ── init ──────────────────────────────────────────────────
const init = async () => {
  // PRAGMA ها
  await run('PRAGMA journal_mode = WAL');
  await run('PRAGMA foreign_keys = ON');

  // جداول - هر کدام جداگانه
  await run(`CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    phone       TEXT,
    national_id TEXT,
    role        TEXT DEFAULT 'user' CHECK(role IN ('user','admin')),
    avatar      TEXT,
    is_active   INTEGER DEFAULT 1,
    last_login  DATETIME,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS trips (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    type            TEXT NOT NULL CHECK(type IN ('flight','train','bus')),
    from_city       TEXT NOT NULL,
    to_city         TEXT NOT NULL,
    departure_time  DATETIME NOT NULL,
    arrival_time    DATETIME NOT NULL,
    price           INTEGER NOT NULL,
    capacity        INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    company         TEXT NOT NULL,
    class           TEXT DEFAULT 'economy',
    amenities       TEXT DEFAULT '[]',
    is_active       INTEGER DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS bookings (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code          TEXT UNIQUE NOT NULL,
    user_id               INTEGER NOT NULL,
    trip_id               INTEGER NOT NULL,
    passengers            INTEGER DEFAULT 1,
    total_price           INTEGER NOT NULL,
    status                TEXT DEFAULT 'confirmed' CHECK(status IN ('pending','confirmed','cancelled','used')),
    passenger_name        TEXT NOT NULL,
    passenger_national_id TEXT NOT NULL,
    passenger_phone       TEXT,
    notes                 TEXT,
    cancelled_at          DATETIME,
    created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE RESTRICT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    trip_id    INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id),
    FOREIGN KEY (user_id)    REFERENCES users(id),
    FOREIGN KEY (trip_id)    REFERENCES trips(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
  )`);

  // تنظیمات سئو — یک ردیف ثابت (id=1) که از پنل ادمین ویرایش می‌شود
  await run(`CREATE TABLE IF NOT EXISTS seo_settings (
    id                        INTEGER PRIMARY KEY CHECK(id=1),
    site_title                TEXT NOT NULL DEFAULT 'بلیط یاب — خرید بلیط هواپیما، قطار و اتوبوس',
    title_template            TEXT NOT NULL DEFAULT '%s | بلیط یاب',
    meta_description          TEXT NOT NULL DEFAULT 'خرید آنلاین بلیط هواپیما، قطار و اتوبوس در ایران',
    meta_keywords             TEXT NOT NULL DEFAULT 'بلیط هواپیما, بلیط قطار, بلیط اتوبوس, خرید بلیط آنلاین',
    canonical_url             TEXT NOT NULL DEFAULT 'https://bilityab.ir',
    og_image                  TEXT NOT NULL DEFAULT '',
    og_site_name              TEXT NOT NULL DEFAULT 'بلیط یاب',
    twitter_handle            TEXT NOT NULL DEFAULT '',
    robots_index              INTEGER NOT NULL DEFAULT 1,
    robots_follow             INTEGER NOT NULL DEFAULT 1,
    robots_extra_rules        TEXT NOT NULL DEFAULT '',
    sitemap_enabled           INTEGER NOT NULL DEFAULT 1,
    google_site_verification  TEXT NOT NULL DEFAULT '',
    google_analytics_id       TEXT NOT NULL DEFAULT '',
    updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ── Seed trips ────────────────────────────────────────
  const row = await get('SELECT COUNT(*) as count FROM trips');
  if (row.count === 0) {
    const af = JSON.stringify(['wifi','غذا','سرگرمی']);
    const at = JSON.stringify(['رستوران','تهویه','پریز برق']);
    const ab = JSON.stringify(['wifi','آب','پتو']);
    const av = JSON.stringify(['wifi','صندلی کمپلت','شام']);

    const trips = [
      ['flight','تهران','مشهد',   '2026-08-10 08:00','2026-08-10 09:30',1200000,180,45,'ایران ایر','economy',af],
      ['flight','تهران','مشهد',   '2026-08-10 14:00','2026-08-10 15:30',1350000,180,28,'ماهان ایر','business',af],
      ['flight','تهران','اصفهان', '2026-08-10 10:00','2026-08-10 11:00', 950000,150,30,'ماهان ایر','economy',af],
      ['flight','تهران','شیراز',  '2026-08-11 07:00','2026-08-11 08:30',1100000,180,60,'ایران ایر','economy',af],
      ['flight','تهران','تبریز',  '2026-08-11 09:00','2026-08-11 10:15', 890000,150,42,'آسمان',   'economy',af],
      ['flight','مشهد', 'تهران',  '2026-08-12 15:00','2026-08-12 16:30',1150000,180,20,'ماهان ایر','economy',af],
      ['flight','تهران','کیش',    '2026-08-13 08:00','2026-08-13 09:45',1050000,180,55,'قشم ایر', 'economy',af],
      ['train','تهران','مشهد',    '2026-08-10 22:00','2026-08-11 08:00', 450000,350,120,'راه‌آهن','درجه ۱',at],
      ['train','تهران','مشهد',    '2026-08-11 21:00','2026-08-12 07:30', 380000,350, 85,'راه‌آهن','درجه ۲',at],
      ['train','تهران','اصفهان',  '2026-08-11 06:00','2026-08-11 12:00', 320000,300, 80,'راه‌آهن','درجه ۲',at],
      ['train','تهران','تبریز',   '2026-08-10 20:00','2026-08-11 06:00', 380000,350, 95,'راه‌آهن','درجه ۱',at],
      ['train','تهران','شیراز',   '2026-08-11 19:00','2026-08-12 09:00', 420000,300, 67,'راه‌آهن','درجه ۱',at],
      ['bus','تهران','مشهد',      '2026-08-10 21:00','2026-08-11 09:00', 280000, 44, 15,'همسفر',  'VIP',   av],
      ['bus','تهران','مشهد',      '2026-08-10 22:30','2026-08-11 10:30', 195000, 44, 30,'ترمینال','معمولی',ab],
      ['bus','تهران','اصفهان',    '2026-08-11 08:00','2026-08-11 14:00', 180000, 44, 22,'ترمینال','معمولی',ab],
      ['bus','تهران','شیراز',     '2026-08-10 20:30','2026-08-11 10:00', 350000, 44,  8,'همسفر',  'VIP',   av],
      ['bus','تهران','رشت',       '2026-08-11 07:00','2026-08-11 13:00', 160000, 44, 18,'پارس',   'معمولی',ab],
    ];

    for (const t of trips) {
      await run(
        'INSERT INTO trips(type,from_city,to_city,departure_time,arrival_time,price,capacity,available_seats,company,class,amenities) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
        t
      );
    }
    console.log(`✅ ${trips.length} سفر نمونه ایجاد شد`);
  }

  // ── Seed admin ────────────────────────────────────────
  const admin = await get("SELECT id FROM users WHERE role='admin'");
  if (!admin) {
    const bcrypt = require('bcryptjs');
    await run(
      'INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)',
      ['مدیر سیستم', 'admin@bilityab.ir', bcrypt.hashSync('admin1234', 10), 'admin']
    );
    console.log('✅ ادمین پیش‌فرض: admin@bilityab.ir / admin1234');
  }

  // ── Seed seo_settings ─────────────────────────────────
  const seo = await get('SELECT id FROM seo_settings WHERE id=1');
  if (!seo) {
    await run('INSERT INTO seo_settings(id) VALUES(1)');
    console.log('✅ تنظیمات پیش‌فرض سئو ایجاد شد');
  }

  console.log('✅ دیتابیس آماده است');
};

module.exports = { init, run, get, all };
