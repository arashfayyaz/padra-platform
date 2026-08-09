import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tripsAPI } from '../services/api';
import TripCard from '../components/TripCard.jsx';
import { useSeo } from '../context/SeoContext.jsx';

const CITIES = ['تهران','مشهد','اصفهان','شیراز','تبریز','اهواز','کرمان','رشت','کیش','بندرعباس'];

export default function Search() {
  const [searchParams] = useSearchParams();
  const { setPageMeta } = useSeo();
  const [trips,   setTrips]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [filters, setFilters] = useState({
    from:      searchParams.get('from')  || '',
    to:        searchParams.get('to')    || '',
    date:      searchParams.get('date')  || '',
    type:      searchParams.get('type')  || '',
    min_price: '',
    max_price: '',
    sort:      'price_asc',
  });

  useEffect(() => {
    if (searchParams.toString()) doSearch();
  }, []);

  useEffect(() => {
    const { from, to } = filters;
    let title = 'جستجوی بلیط هواپیما، قطار و اتوبوس';
    let description = 'جستجو و مقایسه بلیط هواپیما، قطار و اتوبوس بین شهرهای ایران و رزرو آنلاین در بلیط یاب.';
    if (from && to) {
      title = `بلیط ${from} به ${to}`;
      description = `مقایسه و خرید بلیط ${from} به ${to}. ${done && !loading ? `${trips.length} سفر یافت شد. ` : ''}رزرو آنلاین و آنی در بلیط یاب.`;
    } else if (from || to) {
      const city = from || to;
      title = `بلیط‌های ${from ? 'از' : 'به'} ${city}`;
      description = `جستجوی بلیط هواپیما، قطار و اتوبوس ${from ? 'از' : 'به'} ${city} در بلیط یاب.`;
    }
    return setPageMeta({ title, description });
  }, [filters.from, filters.to, done, loading, trips.length, setPageMeta]);

  const doSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true); setDone(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([,v])=>v));
      const res = await tripsAPI.search(clean);
      setTrips(res.data.trips);
    } catch { setTrips([]); }
    finally { setLoading(false); }
  };

  const set = (k, v) => setFilters(f => ({...f, [k]: v}));

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4"><i className="bi bi-search me-2"></i>جستجوی بلیط</h2>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <form onSubmit={doSearch}>
            <div className="row g-3 align-items-end">
              <div className="col-md-2">
                <label className="form-label small">مبدا</label>
                <select className="form-select" value={filters.from} onChange={e=>set('from',e.target.value)}>
                  <option value="">همه</option>
                  {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">مقصد</label>
                <select className="form-select" value={filters.to} onChange={e=>set('to',e.target.value)}>
                  <option value="">همه</option>
                  {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">تاریخ</label>
                <input type="date" className="form-control" value={filters.date} onChange={e=>set('date',e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label small">نوع</label>
                <select className="form-select" value={filters.type} onChange={e=>set('type',e.target.value)}>
                  <option value="">همه</option>
                  <option value="flight">هواپیما</option>
                  <option value="train">قطار</option>
                  <option value="bus">اتوبوس</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">مرتب‌سازی</label>
                <select className="form-select" value={filters.sort} onChange={e=>set('sort',e.target.value)}>
                  <option value="price_asc">ارزان‌ترین</option>
                  <option value="price_desc">گران‌ترین</option>
                  <option value="time_asc">زودترین</option>
                  <option value="rating">بهترین امتیاز</option>
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">
                  <i className="bi bi-search me-1"></i>جستجو
                </button>
              </div>
            </div>
            {/* فیلتر قیمت */}
            <div className="row g-3 mt-1">
              <div className="col-md-3">
                <label className="form-label small">حداقل قیمت (تومان)</label>
                <input type="number" className="form-control" placeholder="مثال: 500000" value={filters.min_price} onChange={e=>set('min_price',e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label small">حداکثر قیمت (تومان)</label>
                <input type="number" className="form-control" placeholder="مثال: 2000000" value={filters.max_price} onChange={e=>set('max_price',e.target.value)} />
              </div>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div className="page-loader"><div className="spinner-border text-primary" style={{width:'3rem',height:'3rem'}}></div></div>
      )}

      {!loading && done && trips.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-search" style={{fontSize:'4rem'}}></i>
          <h4 className="mt-3">نتیجه‌ای یافت نشد</h4>
          <p>فیلترها را تغییر دهید</p>
        </div>
      )}

      {!loading && trips.length > 0 && (
        <>
          <p className="text-muted mb-3 small"><i className="bi bi-check2-circle me-1 text-success"></i>{trips.length} سفر یافت شد</p>
          {trips.map(t => <TripCard key={t.id} trip={t} />)}
        </>
      )}

      {!done && !loading && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-airplane-engines" style={{fontSize:'4rem'}}></i>
          <h5 className="mt-3">مبدا و مقصد را انتخاب کنید</h5>
        </div>
      )}
    </div>
  );
}
