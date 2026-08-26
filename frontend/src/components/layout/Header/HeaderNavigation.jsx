import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getVisibleNavigation } from '../../../config/navigation.js';

export default function HeaderNavigation({
  user,
  isAdmin,
  mobile = false,
  onNavigate,
}) {
  const location = useLocation();

  const items = getVisibleNavigation({
    user,
    isAdmin,
  });

  return (
    <nav
      className={
        mobile
          ? 'padra-header-mobile-nav'
          : 'padra-header-navigation'
      }
      aria-label="ناوبری اصلی"
    >
      {items.map((item) => {
        const active =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={onNavigate}
            className={`padra-header-nav-link ${
              active ? 'active' : ''
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <i
              className={`bi ${item.icon}`}
              aria-hidden="true"
            ></i>

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
