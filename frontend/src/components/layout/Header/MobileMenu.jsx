import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import HeaderNavigation from './HeaderNavigation.jsx';

export default function MobileMenu({
  open,
  onClose,
}) {
  const {
    user,
    isAdmin,
  } = useAuth();

  if (!open) return null;

  return (
    <div className="padra-header-mobile-panel">
      <HeaderNavigation
        user={user}
        isAdmin={isAdmin}
        mobile
        onNavigate={onClose}
      />

      <div className="padra-header-mobile-actions">
        {user ? (
          <>
            <Link
              to="/profile"
              className="padra-header-mobile-profile"
              onClick={onClose}
            >
              <i className="bi bi-person-circle"></i>
              <span>
                {user.name || 'پروفایل'}
              </span>
            </Link>

            <Link
              to="/my-bookings"
              className="padra-header-mobile-profile"
              onClick={onClose}
            >
              <i className="bi bi-ticket-perforated"></i>
              <span>رزروهای من</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="padra-header-mobile-profile"
                onClick={onClose}
              >
                <i className="bi bi-speedometer2"></i>
                <span>پنل مدیریت</span>
              </Link>
            )}
          </>
        ) : (
          <div className="padra-header-mobile-auth">
            <Link
              to="/login"
              className="padra-header-login"
              onClick={onClose}
            >
              ورود
            </Link>

            <Link
              to="/register"
              className="padra-header-register"
              onClick={onClose}
            >
              ثبت‌نام
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
