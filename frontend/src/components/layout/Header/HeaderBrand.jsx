import React from 'react';
import { Link } from 'react-router-dom';

export default function HeaderBrand() {
  return (
    <Link
      to="/"
      className="padra-header-brand"
      aria-label="پادرا - صفحه اصلی"
    >
      <span className="padra-header-brand-icon">
        <i className="bi bi-airplane-fill" aria-hidden="true"></i>
      </span>

      <span className="padra-header-brand-text">
        پادرا
      </span>
    </Link>
  );
}
