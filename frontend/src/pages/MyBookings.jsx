import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api';

const STATUS = {
  confirmed: { label:'تایید شده', cls:'success' },
  pending:   { label:'در انتظار', cls:'warning'  },
  cancelled: { label:'لغو شده',   cls:'danger'   },
  used:      { label:'استفاده شده',cls:'secondary'},
};
const TYPE = {
  flight: { icon:'bi-airplane',         label:'هواپیما' },
  train:  { icon:'bi-train-front-fill', label:'قطار'    },
  bus:    { icon:'bi-bus-front-fill',   label:'اتوبوس'  },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingsAPI.getMy();
      setBookings(res.data.bookings);
    } catch { setBookings([]); }
    finally  { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('آیا از لغو رزرو مطمئنید؟')) return;
    try {
      await bookingsAPI.cancel(id);
      fetchBookings();
    } catch (err) { alert(err.response?.data?.message || 'خطا در لغو'); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="page-loader"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><i className="bi bi-ticket-perforated me-2"></i>رزروهای من</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/search')}>
          <i className="bi bi-plus me-1"></i>رزرو جدید
        </button>
      </div>

      {/* فیلتر */}
      <div className="btn-group mb-4" role="group">
        {[['all','همه'],['confirmed','تایید شده'],['cancelled','لغو شده']].map(([v,l])=>(
          <button key={v} type="button" className={`btn btn-sm ${filter===v?'btn-primary':'btn-outline-secondary'}`} onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-ticket" style={{fontSize:'4rem'}}></i>
          <h4 className="mt-3">رزروی وجود ندارد</h4>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/search')}>جستجوی بلیط</button>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(b => {
            const st   = STATUS[b.status] || STATUS.confirmed;
            const type = TYPE[b.type]     || TYPE.flight;
            const dep  = new Date(b.departure_time);
            const canCancel = b.status === 'confirmed' && dep > new Date();
            return (
              <div key={b.id} className="col-12">
                <div className="card booking-card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className={`bi ${type.icon} text-primary fs-5`}></i>
                          <span className="fw-bold fs-5">{b.from_city} → {b.to_city}</span>
                          <span className={`badge bg-${st.cls}`}>{st.label}</span>
                        </div>
                        <div className="text-muted small">
                          <i className="bi bi-clock me-1"></i>
                          {dep.toLocaleString('fa-IR')}
                          <span className="mx-2">·</span>
                          {b.company}
                        </div>
                        <div className="mt-1 small">
                          <span className="text-muted">مسافر:</span> <strong>{b.passenger_name}</strong>
                          <span className="mx-2">·</span>
                          <span className="text-muted">تعداد:</span> <strong>{b.passengers} نفر</strong>
                        </div>
                      </div>
                      <div className="col-md-3 text-center">
                        <div className="text-muted small">کد رزرو</div>
                        <div className="booking-code fw-bold text-primary">{b.booking_code}</div>
                        <div className="text-danger fw-semibold">{b.total_price.toLocaleString('fa-IR')} تومان</div>
                      </div>
                      <div className="col-md-3 text-end">
                        {canCancel && (
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(b.id)}>
                            <i className="bi bi-x-circle me-1"></i>لغو رزرو
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
