const express = require('express');
const { body, validationResult } = require('express-validator');
const { run, get, all } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const settingsRouter = express.Router();

const BOOL_FIELDS   = ['robots_index', 'robots_follow', 'sitemap_enabled'];
const EDITABLE_COLS = [
  'site_title', 'title_template', 'meta_description', 'meta_keywords',
  'canonical_url', 'og_image', 'og_site_name', 'twitter_handle',
  'robots_index', 'robots_follow', 'robots_extra_rules', 'sitemap_enabled',
  'google_site_verification', 'google_analytics_id',
];

const toResponse = (row) => ({
  ...row,
  robots_index:    !!row.robots_index,
  robots_follow:   !!row.robots_follow,
  sitemap_enabled: !!row.sitemap_enabled,
});

const trimUrl = (u) => (u || '').trim().replace(/\/+$/, '');

// ── دریافت تنظیمات (عمومی — فرانت‌اند برای ست‌کردن تگ‌ها به آن نیاز دارد) ──
settingsRouter.get('/', async (req, res) => {
  try {
    const row = await get('SELECT * FROM seo_settings WHERE id=1');
    res.json({ seo: toResponse(row) });
  } catch (e) { res.status(500).json({ message: 'خطای سرور', error: e.message }); }
});

// ── ویرایش تنظیمات (فقط ادمین) ──────────────────────────
settingsRouter.put('/', authMiddleware, adminMiddleware, [
  body('site_title').optional().trim().isLength({ min: 1, max: 200 }),
  body('title_template').optional().trim().isLength({ min: 1, max: 200 }).custom(v => v.includes('%s')).withMessage('قالب عنوان باید شامل %s باشد'),
  body('meta_description').optional().trim().isLength({ max: 320 }),
  body('meta_keywords').optional().trim().isLength({ max: 500 }),
  body('canonical_url').optional({ checkFalsy: true }).trim().isURL({ require_protocol: true }).withMessage('آدرس canonical معتبر نیست'),
  body('og_image').optional({ checkFalsy: true }).trim().isURL({ require_protocol: true }).withMessage('آدرس تصویر OG معتبر نیست'),
  body('og_site_name').optional().trim().isLength({ max: 100 }),
  body('twitter_handle').optional({ checkFalsy: true }).trim().matches(/^@?\w{1,15}$/).withMessage('نام کاربری توییتر معتبر نیست'),
  body('robots_index').optional().isBoolean(),
  body('robots_follow').optional().isBoolean(),
  body('robots_extra_rules').optional().isLength({ max: 2000 }),
  body('sitemap_enabled').optional().isBoolean(),
  body('google_site_verification').optional().trim().isLength({ max: 200 }),
  body('google_analytics_id').optional({ checkFalsy: true }).trim().matches(/^(G|UA|GTM)-[A-Za-z0-9-]+$/).withMessage('شناسه گوگل آنالیتیکس معتبر نیست'),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ message: err.array()[0].msg });

  const sets = [];
  const p = [];
  for (const col of EDITABLE_COLS) {
    if (req.body[col] === undefined) continue;
    sets.push(`${col}=?`);
    p.push(BOOL_FIELDS.includes(col) ? (req.body[col] ? 1 : 0) : String(req.body[col]).trim());
  }
  if (sets.length === 0) return res.status(400).json({ message: 'هیچ فیلدی برای ذخیره ارسال نشده' });

  sets.push('updated_at=CURRENT_TIMESTAMP');

  try {
    await run(`UPDATE seo_settings SET ${sets.join(',')} WHERE id=1`, p);
    const row = await get('SELECT * FROM seo_settings WHERE id=1');
    res.json({ message: 'تنظیمات سئو ذخیره شد', seo: toResponse(row) });
  } catch (e) { res.status(500).json({ message: 'خطای سرور', error: e.message }); }
});

// ── robots.txt (پویا، بر اساس تنظیمات پنل ادمین) — در مسیر ریشه mount می‌شود ──
const robotsTxt = async (req, res) => {
  try {
    const s = await get('SELECT * FROM seo_settings WHERE id=1');
    const base = trimUrl(s?.canonical_url) || `${req.protocol}://${req.get('host')}`;
    const lines = [];

    if (s?.robots_extra_rules && s.robots_extra_rules.trim()) {
      lines.push(s.robots_extra_rules.trim());
    } else {
      lines.push('User-agent: *');
      lines.push(`${s?.robots_index ? 'Allow' : 'Disallow'}: /`);
    }

    if (s?.sitemap_enabled) {
      lines.push('');
      lines.push(`Sitemap: ${base}/sitemap.xml`);
    }

    res.type('text/plain').send(lines.join('\n') + '\n');
  } catch (e) { res.status(500).type('text/plain').send('User-agent: *\nDisallow: /'); }
};

// ── sitemap.xml (پویا — شامل صفحات ثابت + سفرهای فعال) — در مسیر ریشه mount می‌شود ──
const sitemapXml = async (req, res) => {
  try {
    const s = await get('SELECT * FROM seo_settings WHERE id=1');
    if (s && !s.sitemap_enabled) return res.status(404).type('text/plain').send('نقشه سایت غیرفعال است');

    const base = trimUrl(s?.canonical_url) || `${req.protocol}://${req.get('host')}`;
    const staticUrls = [
      { loc: '/',         priority: '1.0', changefreq: 'daily' },
      { loc: '/search',   priority: '0.9', changefreq: 'daily' },
      { loc: '/login',    priority: '0.3', changefreq: 'monthly' },
      { loc: '/register', priority: '0.3', changefreq: 'monthly' },
    ];

    const trips = await all(`SELECT id, created_at FROM trips WHERE is_active=1 ORDER BY id DESC LIMIT 5000`);

    const esc = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const isoDate = (d) => {
      try { return new Date(d).toISOString().split('T')[0]; }
      catch { return new Date().toISOString().split('T')[0]; }
    };

    const urlXml = ({ loc, lastmod, priority, changefreq }) => `  <url>
    <loc>${esc(base + loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

    const today = new Date().toISOString().split('T')[0];
    const body = [
      ...staticUrls.map(u => urlXml({ ...u, lastmod: today })),
      ...trips.map(t => urlXml({
        loc: `/trip/${t.id}`,
        lastmod: isoDate(t.created_at),
        priority: '0.7',
        changefreq: 'daily',
      })),
    ].join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
    res.type('application/xml').send(xml);
  } catch (e) { res.status(500).type('text/plain').send('خطا در ساخت نقشه سایت'); }
};

module.exports = { settingsRouter, robotsTxt, sitemapXml };
