require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const { init }  = require('./config/database');
const { settingsRouter: seoSettingsRouter, robotsTxt, sitemapXml } = require('./routes/seo');

const app = express();

app.use(cors({ origin:['http://localhost:5173','http://localhost:3000'], credentials:true }));
app.use(express.json({ limit:'5mb' }));
app.use(express.urlencoded({ extended:true }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs:15*60*1000, max:300 }));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/trips',    require('./routes/trips'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/seo',      seoSettingsRouter);

// robots.txt و sitemap.xml باید در ریشه سایت باشند تا موتورهای جست‌وجو پیدایشان کنند
app.get('/robots.txt',  robotsTxt);
app.get('/sitemap.xml', sitemapXml);

app.get('/api/health', (req, res) => res.json({ status:'ok', node:process.version }));
app.use((req, res) => res.status(404).json({ message:'مسیر یافت نشد' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message:err.message }); });

const PORT = process.env.PORT || 5000;

// اول دیتابیس رو init کن، بعد listen
init().then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ════════════════════════════════');
    console.log(`   بلیط یاب | پورت: ${PORT}`);
    console.log(`   Node: ${process.version}`);
    console.log(`   http://localhost:${PORT}/api/health`);
    console.log('🚀 ════════════════════════════════');
  });
}).catch(err => { console.error('❌ خطا در راه‌اندازی دیتابیس:', err); process.exit(1); });
