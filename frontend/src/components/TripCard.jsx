import React from 'react';
import { useNavigate } from 'react-router-dom';

const TYPE = {
  flight: { label:'هواپیما', icon:'bi-airplane',          cls:'badge-flight' },
  train:  { label:'قطار',    icon:'bi-train-front-fill',   cls:'badge-train'  },
  bus:    { label:'اتوبوس',  icon:'bi-bus-front-fill',     cls:'badge-bus'    },
};

const fmt  = (dt) => new Date(dt).toLocaleTimeString('fa-IR', { hour:'2-digit', minute:'2-digit' });
const fmtD = (dt) => new Date(dt).toLocaleDateString('fa-IR');
const dur  = (a,b) => { const m=Math.round((new Date(b)-new Date(a))/60000); return `${Math.floor(m/60)}h ${m%60}m`; };
const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5-Math.round(n));

export default function TripCard({ trip }) {
  const navigate = useNavigate();
  const info = TYPE[trip.type] || TYPE.flight;
  const amenities = (() => { try { return JSON.parse(trip.amenities||'[]'); } catch { return []; } })();

  return (
    <div className="card trip-card mb-3 p-0 overflow-hidden">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className={`badge ${info.cls} px-3 py-2 rounded-pill`}>
              <i className={`bi ${info.icon} me-1`}></i>{info.label}
            </span>
            <span className="text-muted small">{trip.company} · {trip.class}</span>
          </div>
          {trip.avg_rating > 0 && (
            <span className="stars small" title={`امتیاز: ${Number(trip.avg_rating).toFixed(1)}`}>
              {stars(trip.avg_rating)}
              <span className="text-muted ms-1">{Number(trip.avg_rating).toFixed(1)}</span>
            </span>
          )}
        </div>

        <div className="row align-items-center text-center mb-3">
          <div className="col">
            <div className="fw-bold fs-4">{fmt(trip.departure_time)}</div>
            <div className="fw-semibold text-primary">{trip.from_city}</div>
            <div className="text-muted small">{fmtD(trip.departure_time)}</div>
          </div>
          <div className="col-3">
            <div className="text-muted small mb-1">{dur(trip.departure_time, trip.arrival_time)}</div>
            <div className="d-flex align-items-center">
              <div style={{flex:1,height:1,background:'var(--border-color)'}}></div>
              <i className={`bi ${info.icon} mx-2 text-secondary`}></i>
              <div style={{flex:1,height:1,background:'var(--border-color)'}}></div>
            </div>
            <div className="text-muted" style={{fontSize:'.72rem'}}>مستقیم</div>
          </div>
          <div className="col">
            <div className="fw-bold fs-4">{fmt(trip.arrival_time)}</div>
            <div className="fw-semibold text-primary">{trip.to_city}</div>
            <div className="text-muted small">{fmtD(trip.arrival_time)}</div>
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="mb-3">
            {amenities.map(a => <span key={a} className="amenity-chip"><i className="bi bi-check-circle-fill"></i>{a}</span>)}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="price-tag">{trip.price.toLocaleString('fa-IR')}</span>
            <span className="text-muted small"> تومان</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className={`small ${trip.available_seats < 5 ? 'text-danger fw-semibold' : 'text-muted'}`}>
              <i className="bi bi-people me-1"></i>{trip.available_seats} صندلی
            </span>
            <button className="btn btn-primary btn-sm px-4" onClick={() => navigate(`/trip/${trip.id}`)}>
              رزرو
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
