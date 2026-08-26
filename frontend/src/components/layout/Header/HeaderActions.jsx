import React from 'react';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import UserMenu from './UserMenu.jsx';

export default function HeaderActions() {
  return (
    <div className="padra-header-actions">
      <LanguageSwitcher />
      <ThemeToggle />
      <UserMenu />
    </div>
  );
}
