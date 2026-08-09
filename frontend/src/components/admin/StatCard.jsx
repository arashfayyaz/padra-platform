import React from 'react';

export default function StatCard({ label, value, icon, color }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="stat-card-body">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
      </div>
    </div>
  );
}
