import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext.jsx';

import HeaderBrand from './HeaderBrand.jsx';
import HeaderNavigation from './HeaderNavigation.jsx';
import HeaderActions from './HeaderActions.jsx';
import MobileMenu from './MobileMenu.jsx';

export default function Header() {
  const {
    user,
    isAdmin,
  } = useAuth();

  const location = useLocation();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 8
      );
    };

    handleScroll();

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle(
      'padra-mobile-menu-open',
      mobileOpen
    );

    return () => {
      document.body.classList.remove(
        'padra-mobile-menu-open'
      );
    };
  }, [mobileOpen]);

  return (
    <header
      className={`padra-header ${
        scrolled ? 'scrolled' : ''
      }`}
    >
      <div className="padra-header-container">

        <HeaderBrand />

        <HeaderNavigation
          user={user}
          isAdmin={isAdmin}
        />

        <HeaderActions />

        <button
          type="button"
          className="padra-header-mobile-toggle"
          onClick={() =>
            setMobileOpen(
              (current) => !current
            )
          }
          aria-label={
            mobileOpen
              ? 'بستن منو'
              : 'باز کردن منو'
          }
          aria-expanded={mobileOpen}
        >
          <i
            className={`bi ${
              mobileOpen
                ? 'bi-x-lg'
                : 'bi-list'
            }`}
            aria-hidden="true"
          ></i>
        </button>
      </div>

      <MobileMenu
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />
    </header>
  );
}
