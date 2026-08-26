import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'padra-language';

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'fa';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir =
      language === 'fa' ? 'rtl' : 'ltr';

    localStorage.setItem(
      STORAGE_KEY,
      language
    );
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((current) =>
      current === 'fa' ? 'en' : 'fa'
    );
  };

  return (
    <button
      type="button"
      className="padra-header-language"
      onClick={toggleLanguage}
      aria-label="تغییر زبان"
      title="تغییر زبان"
    >
      <i
        className="bi bi-translate"
        aria-hidden="true"
      ></i>

      <span>
        {language === 'fa' ? 'EN' : 'FA'}
      </span>
    </button>
  );
}
