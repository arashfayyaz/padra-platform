import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CITIES = ['تهران','مشهد','اصفهان','شیراز','تبریز','اهواز','کرمان','رشت','کیش','بندرعباس'];

const FEATURES = [
  {
    icon: 'bi-shield-check-fill',
    title: 'پرداخت ۱۰۰٪ امن',
    desc: 'درگاه پرداخت مستقیم بانکی با رمزگذاری SSL 256 بیتی برای حفاظت از اطلاعات شما.',
  },
  {
    icon: 'bi-lightning-charge-fill',
    title: 'رزرو آنی',
    desc: 'در کمتر از ۲ دقیقه بلیطت را رزرو کن و بلافاصله کد رزرو دریافت کن.',
  },
  {
    icon: 'bi-headset',
    title: 'پشتیبانی ۲۴/۷',
    desc: 'تیم پشتیبانی ما ۷ روز هفته و ۲۴ ساعته آماده کمک به توست.',
  },
  {
    icon: 'bi-tag-fill',
    title: 'بهترین قیمت',
    desc: 'تضمین ارزان‌ترین نرخ. اگر جایی ارزان‌تر پیدا کردی قیمت را می‌زنیم.',
  },
];

const DESTINATIONS = [
  { city: 'مشهد',       icon: '🕌', trips: '۱۲۴ سفر',  price: 'از ۲۸۰,۰۰۰', color: 'linear-gradient(145deg,#1B263B,#415A77)', type: 'flight' },
  { city: 'اصفهان',     icon: '🏛️', trips: '۸۶ سفر',   price: 'از ۱۵۰,۰۰۰', color: 'linear-gradient(145deg,#1B4332,#2D6A4F)', type: 'train'  },
  { city: 'شیراز',      icon: '🌹', trips: '۹۲ سفر',   price: 'از ۱۹۰,۰۰۰', color: 'linear-gradient(145deg,#4A1942,#7B2D8B)', type: 'flight' },
  { city: 'کیش',        icon: '🏖️', trips: '۵۴ سفر',   price: 'از ۳۵۰,۰۰۰', color: 'linear-gradient(145deg,#003D3E,#006769)', type: 'flight' },
  { city: 'تبریز',      icon: '🏔️', trips: '۶۸ سفر',   price: 'از ۱۲۰,۰۰۰', color: 'linear-gradient(145deg,#7A2E0E,#B45309)', type: 'bus'    },
  { city: 'رشت',        icon: '🌿', trips: '۴۸ سفر',   price: 'از ۹۵,۰۰۰',  color: 'linear-gradient(145deg,#14532D,#166534)', type: 'bus'    },
];

const TESTIMONIALS = [
  {
    text: 'رابط کاربری سایت خیلی روان و سریعه. در کمتر از ۳ دقیقه بلیط تهران-مشهدم رو رزرو کردم و کد تایید بلافاصله اومد.',
    name: 'آرمین کریمی',
    role: 'مدیر محصول',
    rating: 5,
  },
  {
    text: 'قیمت‌ها واقعاً رقابتی هستند. چند سایت رو چک کردم و پادرا ارزان‌ترین بلیط قطار رو داشت. خوشحالم که پیداش کردم.',
    name: 'ملیکا احمدی',
    role: 'مهندس نرم‌افزار',
    rating: 5,
  },
  {
    text: 'پشتیبانی عالی داره. موقعی که پروازم کنسل شد، خیلی سریع مشکلم حل شد و استرداد وجه انجام شد.',
    name: 'رضا محمدی',
    role: 'پزشک',
    rating: 5,
  },
];

const FAQS = [
  {
    q: 'آیا می‌توانم بلیط را پس از خرید کنسل کنم؟',
    a: 'بله، بسته به نوع بلیط و زمان کنسلی، استرداد وجه انجام می‌شود. بلیط‌هایی که بیشتر از ۲۴ ساعت مانده به سفر کنسل شوند، معمولاً مشمول بازپرداخت کامل یا جزئی می‌شوند.',
  },
  {
    q: 'چه روش‌های پرداختی پشتیبانی می‌شود؟',
    a: 'تمام کارت‌های بانکی عضو شبکه شتاب، درگاه‌های پرداخت اینترنتی و کیف پول پادرا پذیرفته می‌شوند.',
  },
  {
    q: 'بلیط خریداری شده چطور تحویل داده می‌شود؟',
    a: 'بلافاصله پس از تایید پرداخت، بلیط الکترونیکی و کد رزرو به ایمیل و شماره موبایل شما ارسال می‌شود. می‌توانید از بخش «رزروهای من» نیز دسترسی داشته باشید.',
  },
  {
    q: 'آیا امکان خرید برای دیگران وجود دارد؟',
    a: 'بله، می‌توانید هنگام رزرو، اطلاعات مسافر دیگری را وارد کنید. کد رزرو به نام مسافر خواهد بود.',
  },
  {
    q: 'چطور می‌توانم از وضعیت سفرم مطمئن شوم؟',
    a: 'از بخش «رزروهای من» وارد پنل کاربری‌تان شوید. وضعیت تمام سفرهای رزرو شده به‌صورت لحظه‌ای نمایش داده می‌شود.',
  },
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ from: '', to: '', date: '', type: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(Object.entries(form).filter(([, v]) => v)).toString();
    navigate(`/search${p ? '?' + p : ''}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* ─────────────────── HERO ─────────────────── */}
      <section className="padra-hero">
        <div className="padra-hero-deco padra-hero-deco-1"></div>
        <div className="padra-hero-deco padra-hero-deco-2"></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="padra-hero-eyebrow">
              <i className="bi bi-stars"></i>
              پلتفرم شماره ۱ سفر در ایران
            </div>

            <h1 className="padra-hero-title">
              سفرت رو
              <br />
              <span>با پادرا</span> شروع کن
            </h1>

            <p className="padra-hero-subtitle mx-auto">
              هواپیما، قطار و اتوبوس — همه در یک جا با بهترین قیمت‌ها و آسان‌ترین تجربه رزرو
            </p>
          </motion.div>

          {/* SEARCH BOX */}
          <motion.div
            className="row justify-content-center"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="col-xl-10">
              <div className="padra-search-box">
                <form onSubmit={handleSearch}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label className="padra-search-label">
                        <i className="bi bi-geo-alt-fill"></i> مبدا
                      </label>
                      <select
                        className="padra-search-input form-select"
                        value={form.from}
                        onChange={(e) => setForm({ ...form, from: e.target.value })}
                      >
                        <option value="">انتخاب شهر مبدا</option>
                        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="padra-search-label">
                        <i className="bi bi-geo-fill"></i> مقصد
                      </label>
                      <select
                        className="padra-search-input form-select"
                        value={form.to}
                        onChange={(e) => setForm({ ...form, to: e.target.value })}
                      >
                        <option value="">انتخاب شهر مقصد</option>
                        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="col-md-2">
                      <label className="padra-search-label">
                        <i className="bi bi-calendar-event"></i> تاریخ رفت
                      </label>
                      <input
                        type="date"
                        className="padra-search-input form-control"
                        min={today}
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="padra-search-label">
                        <i className="bi bi-airplane"></i> نوع سفر
                      </label>
                      <select
                        className="padra-search-input form-select"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                      >
                        <option value="">همه وسایل</option>
                        <option value="flight">✈ هواپیما</option>
                        <option value="train">🚆 قطار</option>
                        <option value="bus">🚌 اتوبوس</option>
                      </select>
                    </div>

                    <div className="col-md-2">
                      <button type="submit" className="padra-search-btn">
                        <i className="bi bi-search"></i>
                        جستجو
                      </button>
                    </div>
                  </div>
                </form>

                {/* Quick links */}
                <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>جستجوی سریع:</span>
                  {[
                    { label: 'تهران → مشهد', from: 'تهران', to: 'مشهد' },
                    { label: 'تهران → اصفهان', from: 'تهران', to: 'اصفهان' },
                    { label: 'تهران → شیراز', from: 'تهران', to: 'شیراز' },
                  ].map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, from: q.from, to: q.to });
                        navigate(`/search?from=${q.from}&to=${q.to}`);
                      }}
                      style={{
                        background: 'var(--brand-light)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '100px',
                        padding: '4px 12px',
                        fontSize: '0.78rem',
                        color: 'var(--brand-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: '500',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--brand-primary)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--brand-light)';
                        e.currentTarget.style.color = 'var(--brand-primary)';
                      }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── FEATURES ─────────────────── */}
      <section className="padra-section">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="padra-section-eyebrow">چرا پادرا؟</span>
            <h2 className="padra-section-title">سفر رو ساده‌تر از همیشه کن</h2>
            <p className="padra-section-desc">
              بیشتر از ۵۰۰ هزار مسافر به پادرا اعتماد کرده‌اند. این است که ما را متفاوت می‌کند.
            </p>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} className="col-sm-6 col-lg-3" variants={fadeUp}>
                <div className="padra-feature-card">
                  <div className="padra-feature-icon">
                    <i className={`bi ${f.icon}`}></i>
                  </div>
                  <h3 className="padra-feature-title">{f.title}</h3>
                  <p className="padra-feature-desc">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── SERVICES ─────────────────── */}
      <section className="padra-section padra-section-alt">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="padra-section-eyebrow">وسیله سفر</span>
            <h2 className="padra-section-title">سفر به سبک خودت</h2>
            <p className="padra-section-desc">
              هر وسیله سفری که انتخاب کنی، بهترین قیمت و راحت‌ترین رزرو رو پیدا می‌کنی.
            </p>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                type: 'flight',
                cls: 'padra-service-card-flight',
                icon: 'bi-airplane-fill',
                badge: 'سریع‌ترین',
                title: 'هواپیما',
                desc: 'پروازهای داخلی با بهترین قیمت',
                trips: '۲۴۰+ پرواز روزانه',
              },
              {
                type: 'train',
                cls: 'padra-service-card-train',
                icon: 'bi-train-front-fill',
                badge: 'راحت‌ترین',
                title: 'قطار',
                desc: 'سفر با آرامش و قیمت مناسب',
                trips: '۸۰+ مسیر فعال',
              },
              {
                type: 'bus',
                cls: 'padra-service-card-bus',
                icon: 'bi-bus-front-fill',
                badge: 'اقتصادی‌ترین',
                title: 'اتوبوس',
                desc: 'مقرون‌به‌صرفه‌ترین گزینه سفر',
                trips: '۱۵۰+ مسیر فعال',
              },
            ].map((t) => (
              <motion.div key={t.type} className="col-md-4" variants={fadeUp}>
                <div
                  className={`padra-service-card ${t.cls}`}
                  onClick={() => navigate(`/search?type=${t.type}`)}
                >
                  <div className="padra-service-card-inner">
                    <i className={`bi ${t.icon} padra-service-card-icon`}></i>
                    <span className="padra-service-card-badge">{t.badge}</span>
                    <h4>{t.title}</h4>
                    <p>{t.desc}</p>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 0 }}>
                      <i className="bi bi-check2-circle me-1"></i>{t.trips}
                    </p>
                  </div>
                  <div className="padra-service-card-arrow">
                    <i className="bi bi-arrow-left"></i>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── DESTINATIONS ─────────────────── */}
      <section className="padra-section">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="padra-section-eyebrow">مقاصد محبوب</span>
            <h2 className="padra-section-title">کجا می‌خوای بری؟</h2>
            <p className="padra-section-desc">محبوب‌ترین مقاصد سفر با بهترین قیمت‌های این هفته</p>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {DESTINATIONS.map((d) => (
              <motion.div key={d.city} className="col-sm-6 col-lg-4" variants={fadeUp}>
                <div
                  className="padra-destination-card"
                  onClick={() => navigate(`/search?to=${d.city}&type=${d.type}`)}
                >
                  <div className="padra-destination-img" style={{ background: d.color }}>
                    <span style={{ fontSize: '4rem', position: 'relative', zIndex: 1 }}>{d.icon}</span>
                    <div className="padra-destination-img-overlay"></div>
                  </div>
                  <div className="padra-destination-body">
                    <div className="padra-destination-city">{d.city}</div>
                    <div className="padra-destination-meta">
                      <i className="bi bi-ticket-perforated"></i>
                      {d.trips}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="padra-destination-price">{d.price} تومان</div>
                      <span style={{
                        background: 'var(--brand-light)',
                        color: 'var(--brand-primary)',
                        borderRadius: '100px',
                        padding: '3px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}>
                        رزرو کن
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── STATS ─────────────────── */}
      <motion.section
        className="padra-stats"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row justify-content-center align-items-center g-0">
            {[
              { number: '+۵۰۰K',  label: 'مسافر راضی' },
              { number: '+۸۵۰',   label: 'مسیر فعال' },
              { number: '۹۸.۵٪', label: 'رضایت مشتریان' },
              { number: '۲۴/۷',   label: 'پشتیبانی آنلاین' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <div className="col-6 col-md-3">
                  <motion.div
                    className="padra-stat-item"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="padra-stat-number">{s.number}</div>
                    <div className="padra-stat-label">{s.label}</div>
                  </motion.div>
                </div>
                {i < arr.length - 1 && (
                  <div className="d-none d-md-block col-md-auto">
                    <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.15)' }}></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─────────────────── APP CTA ─────────────────── */}
      <section className="padra-app-section">
        <div className="container">
          <motion.div
            className="padra-app-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Phone Mockup */}
            <div className="padra-app-phone-mockup animate-float" style={{ flexShrink: 0 }}>
              <div className="padra-app-phone-screen">
                <i className="bi bi-airplane-fill" style={{ fontSize: '2.5rem', color: 'rgba(255,255,255,0.9)' }}></i>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>پادرا</div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  width: '80%',
                  marginTop: 8,
                }}>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.4)', borderRadius: 4, marginBottom: 6 }}></div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.25)', borderRadius: 4, width: '70%' }}></div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 10, padding: '8px 16px', marginTop: 8 }}>
                  <div style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.8rem' }}>رزرو بلیط</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="padra-section-eyebrow">اپلیکیشن موبایل</span>
              <h2 className="padra-section-title" style={{ marginBottom: 16 }}>
                پادرا در جیبت
                <br />همیشه همراهته
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8, marginBottom: 32 }}>
                با اپلیکیشن پادرا هر جا بودی بلیطت رو رزرو کن. اعلان‌های آنی، مدیریت سفر و پشتیبانی ۲۴ ساعته — همه در یک اپ.
              </p>

              <div className="d-flex gap-3 flex-wrap">
                <a href="#" className="padra-app-store-btn">
                  <i className="bi bi-apple"></i>
                  <div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, lineHeight: 1 }}>دانلود از</div>
                    <div style={{ fontWeight: 700 }}>App Store</div>
                  </div>
                </a>
                <a href="#" className="padra-app-store-btn">
                  <i className="bi bi-google-play"></i>
                  <div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, lineHeight: 1 }}>دانلود از</div>
                    <div style={{ fontWeight: 700 }}>Google Play</div>
                  </div>
                </a>
              </div>

              <div className="d-flex gap-4 mt-4 flex-wrap">
                {[
                  { icon: 'bi-star-fill', text: '۴.۸ امتیاز', sub: 'در App Store' },
                  { icon: 'bi-download', text: '+۲۰۰K', sub: 'بار دانلود' },
                  { icon: 'bi-person-check-fill', text: '۹۸٪', sub: 'رضایت کاربران' },
                ].map((item) => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 36, height: 36,
                      background: 'var(--brand-light)',
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--brand-primary)',
                      fontSize: '0.9rem',
                    }}>
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.text}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── TESTIMONIALS ─────────────────── */}
      <section className="padra-section">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="padra-section-eyebrow">نظر مسافران</span>
            <h2 className="padra-section-title">مسافرانی که به ما اعتماد کردند</h2>
            <p className="padra-section-desc">
              صدها هزار نفر تجربه سفر خوبشون رو با پادرا به اشتراک گذاشتند
            </p>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} className="col-md-4" variants={fadeUp}>
                <div className="padra-testimonial-card">
                  <span className="padra-testimonial-quote">"</span>
                  <div className="padra-stars mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <i key={i} className="bi bi-star-fill" style={{ color: '#F59E0B', fontSize: '0.85rem' }}></i>
                    ))}
                  </div>
                  <p className="padra-testimonial-text">{t.text}</p>
                  <div className="padra-testimonial-author">
                    <div className="padra-testimonial-avatar">{t.name.charAt(0)}</div>
                    <div>
                      <div className="padra-testimonial-name">{t.name}</div>
                      <div className="padra-testimonial-meta">{t.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── FAQ ─────────────────── */}
      <section className="padra-section padra-section-alt">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <motion.div
                className="text-center mb-5"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
              >
                <span className="padra-section-eyebrow">سوالات متداول</span>
                <h2 className="padra-section-title">چیزی که دنبالشی اینجاست</h2>
                <p className="padra-section-desc">
                  پاسخ سوالات رایج مسافران را اینجا پیدا کن
                </p>
              </motion.div>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
              >
                {FAQS.map((faq, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <div className={`padra-faq-item ${openFaq === i ? 'open' : ''}`}>
                      <button
                        className="padra-faq-question"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <span>{faq.q}</span>
                        <span className="padra-faq-icon">
                          <i className="bi bi-plus-lg"></i>
                        </span>
                      </button>
                      <div className="padra-faq-answer">
                        <div className="padra-faq-answer-inner">{faq.a}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
