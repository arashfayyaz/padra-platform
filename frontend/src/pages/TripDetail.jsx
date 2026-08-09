import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useSeo } from '../context/SeoContext.jsx';

const TYPE = {
  flight: { label:'هواپیما', icon:'bi-airplane-fill' },
  train:  { label:'قطار',    icon:'bi-train-front-fill' },
  bus:    { label:'اتوبوس',  icon:'bi-bus-front-fill' },
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPageMeta } = useSeo();
  const [trip,     setTrip]     = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [booking,  setBooking]  = useState({ passenger_name: user?.name||'', passenger_national_id:'', passengers:1, passenger_phone:'' });
  const [submitting, setSubmitting] = useState(false);
  const [success,  setSuccess]  = useState(null);
  const [error,    setError]    = useState('');

  useEffect(() => {
    tripsAPI.getById(id)
      .then(res => { setTrip(res.data.trip); setReviews(res.data.reviews); })
      .catch(() => navigate('/search'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!trip) return;
    const typeLabel = TYPE[trip.type]?.label || trip.type;
    const title = `بلیط ${typeLabel} ${trip.from_city} به ${trip.to_city}`;
    const description = `خرید بلیط ${typeLabel} از ${trip.from_city} به ${trip.to_city} با ${trip.company}، قیمت از ${Number(trip.price).toLocaleString('fa-IR')} تومان. رزرو آنلاین و آنی در بلیط یاب.`;
    return setPageMeta({ title, description, type: 'product' });
  }, [trip, setPageMeta]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await bookingsAPI.book({ trip_id: id, ...booking });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در رزرو');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-loader"><div className="spinner-border text-primary"></div></div>;
  if (!trip) return null;

  const info = TYPE[trip.type] || TYPE.flight;
  const fmt  = (dt) => new Date(dt).toLocaleTimeString('fa-IR', {hour:'2-digit',minute:'2-digit'});
  const fmtD = (dt) => new Date(dt).toLocaleDateString('fa-IR');
  const amenities = (() => { try { return JSON.parse(trip.amenities||'[]'); } catch { return []; } })();

  if (success) return (
    <div className="container py-5 text-center">
      <div className="card border-0 shadow mx-auto" style={{maxWidth:480}}>
        <div className="card-body p-5">
          <i className="bi bi-check-circle-fill text-success" style={{fontSize:'4rem'}}></i>
          <h3 className="fw-bold mt-3">رزرو موفق!</h3>
          <div className="alert alert-light mt-3 text-start">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">کد رزرو:</span>
              <strong className="booking-code text-primary">{success.booking_code}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">مبلغ پرداختی:</span>
              <strong className="text-danger">{success.total_price?.toLocaleString('fa-IR')} تومان</strong>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>مشاهده رزروها</button>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>صفحه اصلی</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <button className="btn btn-link text-decoration-none mb-3 ps-0" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-right me-1"></i>بازگشت
      </button>

      <div className="row g-4">
        {/* اطلاعات سفر */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0"><i className={`bi ${info.icon} me-2`}></i>{info.label}</h5>
                <span className="text-muted">{trip.company} · {trip.class}</span>
              </div>

              <div className="row text-center mb-4">
                <div className="col">
                  <div className="fs-2 fw-bold">{fmt(trip.departure_time)}</div>
                  <div className="fs-5 fw-semibold text-primary">{trip.from_city}</div>
                  <div className="text-muted small">{fmtD(trip.departure_time)}</div>
                </div>
                <div className="col-3 d-flex flex-column align-items-center justify-content-center">
                  <div className="text-muted small mb-1">مستقیم</div>
                  <i className={`bi ${info.icon} fs-4 text-secondary`}></i>
                </div>
                <div className="col">
                  <div className="fs-2 fw-bold">{fmt(trip.arrival_time)}</div>
                  <div className="fs-5 fw-semibold text-primary">{trip.to_city}</div>
                  <div className="text-muted small">{fmtD(trip.arrival_time)}</div>
                </div>
              </div>

              {amenities.length > 0 && (
                <div className="border-top pt-3">
                  <p className="text-muted small mb-2 fw-semibold">امکانات:</p>
                  {amenities.map(a => <span key={a} className="amenity-chip"><i className="bi bi-check2 text-success"></i>{a}</span>)}
                </div>
              )}

              <div className="row g-3 text-center border-top pt-3 mt-2">
                <div className="col-4"><div className="text-muted small">ظرفیت باقی</div><strong className={trip.available_seats < 5 ? 'text-danger' : ''}>{trip.available_seats} صندلی</strong></div>
                <div className="col-4"><div className="text-muted small">امتیاز</div><strong>{trip.avg_rating > 0 ? Number(trip.avg_rating).toFixed(1) + ' / 5' : 'بدون نظر'}</strong></div>
                <div className="col-4"><div className="text-muted small">قیمت هر نفر</div><strong className="text-danger">{trip.price.toLocaleString('fa-IR')} ت</strong></div>
              </div>
            </div>
          </div>

          {/* نظرات */}
          {reviews.length > 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3"><i className="bi bi-chat-dots me-2"></i>نظرات مسافران</h6>
                {reviews.map(r => (
                  <div key={r.id} className="border-bottom pb-3 mb-3 last:border-0">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="small">{r.user_name}</strong>
                      <span className="stars small">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                    </div>
                    {r.comment && <p className="text-muted small mb-0">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* فرم رزرو */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm sticky-top" style={{top:80}}>
            <div className="card-header bg-primary text-white p-4 border-0">
              <h5 className="mb-0"><i className="bi bi-ticket-perforated me-2"></i>رزرو بلیط</h5>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <form onSubmit={handleBook}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">نام مسافر <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" required
                    value={booking.passenger_name}
                    onChange={e=>setBooking({...booking,passenger_name:e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">کد ملی <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" required maxLength={10} placeholder="۱۰ رقم"
                    value={booking.passenger_national_id}
                    onChange={e=>setBooking({...booking,passenger_national_id:e.target.value.replace(/\D/,'')})} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">شماره تماس</label>
                  <input type="tel" className="form-control" placeholder="اختیاری"
                    value={booking.passenger_phone}
                    onChange={e=>setBooking({...booking,passenger_phone:e.target.value})} />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">تعداد مسافر</label>
                  <select className="form-select" value={booking.passengers} onChange={e=>setBooking({...booking,passengers:Number(e.target.value)})}>
                    {[1,2,3,4,5,6].filter(n=>n<=trip.available_seats).map(n=><option key={n} value={n}>{n} نفر</option>)}
                  </select>
                </div>
                <div className="alert alert-primary d-flex justify-content-between align-items-center py-2">
                  <span className="small">مبلغ کل:</span>
                  <strong>{(trip.price * booking.passengers).toLocaleString('fa-IR')} تومان</strong>
                </div>
                <button type="submit" className="btn btn-danger w-100 py-2 fw-semibold" disabled={submitting}>
                  {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-credit-card me-2"></i>}
                  {user ? 'پرداخت و رزرو' : 'برای رزرو وارد شوید'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
