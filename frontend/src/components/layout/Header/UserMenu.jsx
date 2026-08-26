import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext.jsx';

export default function UserMenu() {
  const {
    user,
    logout,
    isAdmin,
  } = useAuth();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutside
    );

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutside
      );

      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, []);

  if (!user) {
    return (
      <div className="padra-header-auth">
        <Link
          to="/login"
          className="padra-header-login"
        >
          ورود
        </Link>

        <Link
          to="/register"
          className="padra-header-register"
        >
          ثبت‌نام
        </Link>
      </div>
    );
  }

  const displayName =
    user.name ||
    user.email?.split('@')[0] ||
    'کاربر';

  const initial =
    displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div
      className="padra-header-user"
      ref={wrapperRef}
    >
      <button
        type="button"
        className="padra-header-user-button"
        onClick={() =>
          setOpen((current) => !current)
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="padra-header-avatar">
          {initial}
        </span>

        <span className="padra-header-user-name">
          {displayName}
        </span>

        <i
          className={`bi ${
            open
              ? 'bi-chevron-up'
              : 'bi-chevron-down'
          }`}
          aria-hidden="true"
        ></i>
      </button>

      {open && (
        <div
          className="padra-header-user-menu"
          role="menu"
        >
          <div className="padra-header-user-info">
            <span className="padra-header-avatar large">
              {initial}
            </span>

            <div>
              <strong>
                {displayName}
              </strong>

              {user.email && (
                <small>
                  {user.email}
                </small>
              )}
            </div>
          </div>

          <div className="padra-header-menu-divider" />

          <Link
            to="/profile"
            className="padra-header-menu-item"
            onClick={() => setOpen(false)}
          >
            <i className="bi bi-person-circle"></i>
            <span>پروفایل</span>
          </Link>

          <Link
            to="/my-bookings"
            className="padra-header-menu-item"
            onClick={() => setOpen(false)}
          >
            <i className="bi bi-ticket-perforated"></i>
            <span>رزروهای من</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="padra-header-menu-item"
              onClick={() => setOpen(false)}
            >
              <i className="bi bi-speedometer2"></i>
              <span>پنل مدیریت</span>
            </Link>
          )}

          <div className="padra-header-menu-divider" />

          <button
            type="button"
            className="padra-header-menu-item danger"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>خروج</span>
          </button>
        </div>
      )}
    </div>
  );
}
