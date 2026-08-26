import React from 'react';
import { useTheme } from '../../../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="padra-header-icon-button"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? 'فعال کردن حالت روشن'
          : 'فعال کردن حالت تاریک'
      }
      title={
        isDark
          ? 'حالت روشن'
          : 'حالت تاریک'
      }
    >
      <i
        className={`bi ${
          isDark
            ? 'bi-sun-fill'
            : 'bi-moon-fill'
        }`}
        aria-hidden="true"
      ></i>
    </button>
  );
}
