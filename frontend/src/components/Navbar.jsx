import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="padra-navbar"
      style={{
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div className="container" style={{ position: 'relative' }}>
        {/* Brand */}
        <Link className="padra-brand" to="/">
          <div className="padra-brand-icon">
            <i className="bi bi-airplane-fill"></i>
          </div>
          <span className="padra-brand-name">پادرا</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="padra-nav d-none d-lg-flex">
          <li>
            <Link className={`padra-nav-link ${isActive('/') ? 'active' : ''}`} to="/">
              خانه
            </Link>
          </li>
          <li>
            <Link className={`padra-nav-link ${isActive('/search') ? 'active' : ''}`} to="/search">
              <i className="bi bi-search"></i> جستجو
            </Link>
          </li>
          {user && (
            <li>
              <Link className={`padra-nav-link ${isActive('/my-bookings') ? 'active' : ''}`} to="/my-bookings">
                <i className="bi bi-ticket-perforated"></i> رزروهای من
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link className={`padra-nav-link ${isActive('/admin') ? 'active' : ''}`} to="/admin">
                <i className="bi bi-speedometer2"></i> مدیریت
              </Link>
            </li>
          )}
        </ul>

        {/* Desktop Actions */}
        <ul className="padra-nav-actions d-none d-lg-flex">
          {/* Theme Toggle */}
          <li>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
              aria-label="تغییر حالت نمایش"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
                </svg>
              )}
            </button>
          </li>

          {user ? (
            <li className="nav-item dropdown padra-dropdown">
              <a
                className="d-flex align-items-center gap-2 text-decoration-none"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ color: 'var(--text-secondary)' }}
              >
                <div className="padra-user-avatar">{user.name?.charAt(0)}</div>
                <span className="fw-semibold" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {user.name}
                </span>
                <i className="bi bi-chevron-down" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}></i>
              </a>
              <ul className="dropdown-menu dropdown-menu-start shadow">
                <li>
                  <span className="dropdown-item-text small py-2 d-flex align-items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <i className="bi bi-envelope"></i>{user.email}
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="bi bi-person-circle"></i>پروفایل
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/my-bookings">
                    <i className="bi bi-ticket-perforated"></i>رزروهای من
                  </Link>
                </li>
                {isAdmin && (
                  <>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/admin" style={{ color: 'var(--brand-primary)' }}>
                        <i className="bi bi-gear-fill"></i>پنل مدیریت
                      </Link>
                    </li>
                  </>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>خروج
                  </button>
                </li>
              </ul>
            </li>
          ) : (
            <li className="d-flex gap-2 align-items-center">
              <Link
                className="btn-brand-outline"
                to="/login"
                style={{ padding: '8px 18px', fontSize: '0.87rem' }}
              >
                ورود
              </Link>
              <Link className="btn-brand" to="/register" style={{ padding: '8px 18px', fontSize: '0.87rem' }}>
                ثبت‌نام رایگان
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Toggler */}
        <div className="d-flex align-items-center gap-2 d-lg-none" style={{ marginRight: 'auto' }}>
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="تغییر تم">
            {theme === 'dark' ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
          </button>
          <button
            className="padra-toggler"
            onClick={() => setOpen(!open)}
            aria-label="منو"
          >
            <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`padra-nav-collapse ${open ? 'open' : ''}`}>
        <ul className="padra-nav">
          <li>
            <Link className={`padra-nav-link ${isActive('/') ? 'active' : ''}`} to="/">
              <i className="bi bi-house"></i> خانه
            </Link>
          </li>
          <li>
            <Link className={`padra-nav-link ${isActive('/search') ? 'active' : ''}`} to="/search">
              <i className="bi bi-search"></i> جستجوی بلیط
            </Link>
          </li>
          {user && (
            <li>
              <Link className={`padra-nav-link ${isActive('/my-bookings') ? 'active' : ''}`} to="/my-bookings">
                <i className="bi bi-ticket-perforated"></i> رزروهای من
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link className={`padra-nav-link ${isActive('/admin') ? 'active' : ''}`} to="/admin">
                <i className="bi bi-speedometer2"></i> پنل مدیریت
              </Link>
            </li>
          )}
        </ul>
        <ul className="padra-nav-actions">
          {user ? (
            <>
              <li>
                <Link className="padra-nav-link" to="/profile">
                  <div className="padra-user-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{user.name?.charAt(0)}</div>
                  {user.name}
                </Link>
              </li>
              <li>
                <button
                  className="btn-brand-outline"
                  onClick={handleLogout}
                  style={{ padding: '7px 16px', fontSize: '0.85rem' }}
                >
                  <i className="bi bi-box-arrow-right"></i> خروج
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link className="btn-brand-outline" to="/login" style={{ padding: '8px 18px' }}>ورود</Link>
              </li>
              <li>
                <Link className="btn-brand" to="/register" style={{ padding: '8px 18px' }}>ثبت‌نام</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
