import React from 'react';

export default function Sidebar({ tabs, activeTab, onChange }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <i className="bi bi-speedometer2"></i>
        <span>پنل مدیریت</span>
      </div>
      <nav className="admin-sidebar-nav">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            className={`admin-sidebar-link ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            <i className={`bi ${t.icon}`}></i>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
