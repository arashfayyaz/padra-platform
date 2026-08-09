import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="padra-footer">
      <div className="container">
        <div className="row g-5">
          {/* Brand column */}
          <div className="col-lg-4 col-md-6">
            <div className="padra-footer-brand">
              <div className="padra-footer-brand-icon">
                <i className="bi bi-airplane-fill"></i>
              </div>
              <span className="padra-footer-brand-name">پادرا</span>
            </div>
            <p className="padra-footer-desc">
              پلتفرم رزرو آنلاین بلیط هواپیما، قطار و اتوبوس با بهترین قیمت و ساده‌ترین تجربه سفر در ایران.
            </p>
            <div className="padra-footer-social">
              <a href="#" className="padra-footer-social-btn" aria-label="اینستاگرام"><i className="bi bi-instagram"></i></a>
              <a href="#" className="padra-footer-social-btn" aria-label="تلگرام"><i className="bi bi-telegram"></i></a>
              <a href="#" className="padra-footer-social-btn" aria-label="توییتر"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="padra-footer-social-btn" aria-label="لینکدین"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          {/* Links columns */}
          <div className="col-lg-2 col-md-6 col-6">
            <div className="padra-footer-heading">پادرا</div>
            <ul className="padra-footer-links">
              <li><Link to="/"><i className="bi bi-chevron-left"></i>درباره ما</Link></li>
              <li><Link to="/"><i className="bi bi-chevron-left"></i>فرصت‌های شغلی</Link></li>
              <li><Link to="/"><i className="bi bi-chevron-left"></i>وبلاگ</Link></li>
              <li><Link to="/"><i className="bi bi-chevron-left"></i>تماس با ما</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <div className="padra-footer-heading">خدمات</div>
            <ul className="padra-footer-links">
              <li><Link to="/search?type=flight"><i className="bi bi-chevron-left"></i>بلیط هواپیما</Link></li>
              <li><Link to="/search?type=train"><i className="bi bi-chevron-left"></i>بلیط قطار</Link></li>
              <li><Link to="/search?type=bus"><i className="bi bi-chevron-left"></i>بلیط اتوبوس</Link></li>
              <li><Link to="/my-bookings"><i className="bi bi-chevron-left"></i>رزروهای من</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <div className="padra-footer-heading">پشتیبانی</div>
            <ul className="padra-footer-links">
              <li><Link to="/"><i className="bi bi-chevron-left"></i>مرکز راهنمایی</Link></li>
              <li><Link to="/"><i className="bi bi-chevron-left"></i>قوانین استرداد</Link></li>
              <li><Link to="/"><i className="bi bi-chevron-left"></i>حریم خصوصی</Link></li>
              <li><Link to="/"><i className="bi bi-chevron-left"></i>شرایط استفاده</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <div className="padra-footer-heading">تماس</div>
            <ul className="padra-footer-links">
              <li><a href="tel:02191234567"><i className="bi bi-telephone"></i>۰۲۱-۹۱۲۳۴۵۶۷</a></li>
              <li><a href="mailto:support@padra.ir"><i className="bi bi-envelope"></i>support@padra.ir</a></li>
              <li><span><i className="bi bi-geo-alt"></i>تهران، ایران</span></li>
            </ul>
          </div>
        </div>

        <hr className="padra-footer-divider" />

        <div className="padra-footer-bottom">
          <div className="padra-footer-copy">
            © {year} پادرا پلتفرم. تمامی حقوق محفوظ است.
          </div>
          <div className="padra-footer-badges">
            <span className="padra-footer-badge"><i className="bi bi-patch-check-fill"></i>نماد اعتماد الکترونیکی</span>
            <span className="padra-footer-badge"><i className="bi bi-shield-lock-fill"></i>پرداخت امن SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
