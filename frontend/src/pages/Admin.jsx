import React, { useState, useEffect } from 'react';
import { tripsAPI, bookingsAPI, adminAPI, seoAPI } from '../services/api';
import Sidebar from '../components/admin/Sidebar';
import StatCard from '../components/admin/StatCard';
import DataTable from '../components/admin/DataTable';
import Modal from '../components/admin/Modal';
import TripFormModal from '../components/admin/TripFormModal';
import ConfirmModal from '../components/admin/ConfirmModal';

const TABS = [
  { id: 'dashboard', label: 'داشبورد',      icon: 'bi-speedometer2' },
  { id: 'trips',     label: 'مدیریت سفرها', icon: 'bi-airplane'     },
  { id: 'bookings',  label: 'رزروها',        icon: 'bi-ticket'       },
  { id: 'users',     label: 'کاربران',       icon: 'bi-people'       },
  { id: 'seo',       label: 'سئو',           icon: 'bi-graph-up-arrow' },
];

const EMPTY_TRIP = { type:'flight', from_city:'', to_city:'', departure_time:'', arrival_time:'', price:'', capacity:'', company:'', class:'economy' };

const TYPE_LABEL = { flight: 'هواپیما', train: 'قطار', bus: 'اتوبوس' };
const TYPE_ICON  = { flight: 'bi-airplane', train: 'bi-train-front', bus: 'bi-bus-front' };

const fmt = (dt) => dt ? new Date(dt).toLocaleString('fa-IR') : '—';
const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('fa-IR') : '—';
const money = (n) => Number(n ?? 0).toLocaleString('fa-IR');

export default function Admin() {
  const [tab,       setTab]       = useState('dashboard');
  const [stats,     setStats]     = useState(null);
  const [trips,     setTrips]     = useState([]);
  const [bookings,  setBookings]  = useState([]);
  const [users,     setUsers]     = useState([]);
  const [seo,       setSeo]       = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [toast,     setToast]     = useState(null); // { type, text }

  // فرم افزودن/ویرایش سفر
  const [formOpen,  setFormOpen]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_TRIP);
  const [editId,    setEditId]    = useState(null);
  const [submitting,setSubmitting]= useState(false);

  // تأیید حذف سفر
  const [deleteTarget, setDeleteTarget] = useState(null);

  // تأیید تغییر وضعیت کاربر
  const [toggleTarget, setToggleTarget] = useState(null);

  useEffect(() => { loadTab(tab); }, [tab]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const loadTab = async (t) => {
    setLoading(true);
    try {
      if (t === 'dashboard') { const r = await tripsAPI.getStats(); setStats(r.data.stats); }
      if (t === 'trips')     { const r = await tripsAPI.getAll();   setTrips(r.data.trips); }
      if (t === 'bookings')  { const r = await bookingsAPI.getAll(); setBookings(r.data.bookings); }
      if (t === 'users')     { const r = await adminAPI.getUsers();  setUsers(r.data.users); }
      if (t === 'seo')       { const r = await seoAPI.get();         setSeo(r.data.seo); }
    } catch (e) { console.error(e); showToast('danger', 'خطا در دریافت اطلاعات'); }
    finally { setLoading(false); }
  };

  // ── سفرها ──────────────────────────────
  const openCreateForm = () => { setForm(EMPTY_TRIP); setEditId(null); setFormOpen(true); };

  const openEditForm = (trip) => {
    setForm({
      type: trip.type, from_city: trip.from_city, to_city: trip.to_city,
      departure_time: trip.departure_time?.slice(0,16),
      arrival_time:   trip.arrival_time?.slice(0,16),
      price: trip.price, capacity: trip.capacity, company: trip.company, class: trip.class,
    });
    setEditId(trip.id);
    setFormOpen(true);
  };

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) await tripsAPI.update(editId, form);
      else        await tripsAPI.create(form);
      showToast('success', editId ? 'سفر ویرایش شد' : 'سفر افزوده شد');
      setFormOpen(false); setEditId(null); setForm(EMPTY_TRIP);
      loadTab('trips');
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'خطا در ذخیره سفر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!deleteTarget) return;
    try {
      await tripsAPI.delete(deleteTarget.id);
      showToast('success', 'سفر غیرفعال شد');
      loadTab('trips');
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'خطا در حذف سفر');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── کاربران ────────────────────────────
  const handleToggleUser = async () => {
    if (!toggleTarget) return;
    try {
      await adminAPI.toggleUser(toggleTarget.id);
      showToast('success', 'وضعیت کاربر تغییر کرد');
      loadTab('users');
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'خطا در تغییر وضعیت');
    } finally {
      setToggleTarget(null);
    }
  };

  // ── سئو ────────────────────────────────
  const handleSeoSave = async (data) => {
    try {
      const r = await seoAPI.update(data);
      setSeo(r.data.seo);
      showToast('success', 'تنظیمات سئو ذخیره شد');
      return true;
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'خطا در ذخیره تنظیمات');
      return false;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar tabs={TABS} activeTab={tab} onChange={setTab} />

      <div className="admin-content">
        <header className="admin-topbar">
          <h4 className="fw-bold mb-0">
            {TABS.find(t => t.id === tab)?.label}
          </h4>
        </header>

        <div className="admin-page">
          {toast && (
            <div className={`alert alert-${toast.type} py-2 small admin-toast`} role="alert">
              {toast.text}
            </div>
          )}

          {loading && (
            <div className="page-loader"><div className="spinner-border text-primary"></div></div>
          )}

          {!loading && tab === 'dashboard' && stats && (
            <DashboardTab stats={stats} />
          )}

          {!loading && tab === 'trips' && (
            <TripsTab
              trips={trips}
              onCreate={openCreateForm}
              onEdit={openEditForm}
              onDelete={(trip) => setDeleteTarget(trip)}
            />
          )}

          {!loading && tab === 'bookings' && (
            <BookingsTab bookings={bookings} />
          )}

          {!loading && tab === 'users' && (
            <UsersTab users={users} onToggle={(u) => setToggleTarget(u)} />
          )}

          {!loading && tab === 'seo' && seo && (
            <SeoTab initial={seo} onSave={handleSeoSave} />
          )}
        </div>
      </div>

      <Modal open={formOpen} title={editId ? 'ویرایش سفر' : 'افزودن سفر جدید'} onClose={() => setFormOpen(false)} size="modal-lg">
        <TripFormModal
          form={form}
          setForm={setForm}
          editId={editId}
          submitting={submitting}
          onSubmit={handleTripSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="غیرفعال‌سازی سفر"
        message={deleteTarget ? `آیا از غیرفعال‌سازی سفر ${deleteTarget.from_city} ← ${deleteTarget.to_city} مطمئن هستید؟` : ''}
        confirmLabel="غیرفعال‌سازی"
        onConfirm={handleDeleteTrip}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={!!toggleTarget}
        title={toggleTarget?.is_active ? 'غیرفعال‌سازی کاربر' : 'فعال‌سازی کاربر'}
        message={toggleTarget ? `آیا از تغییر وضعیت کاربر «${toggleTarget.name}» مطمئن هستید؟` : ''}
        confirmLabel={toggleTarget?.is_active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
        danger={!!toggleTarget?.is_active}
        onConfirm={handleToggleUser}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────
// داشبورد
// ────────────────────────────────────────────────────────
function DashboardTab({ stats }) {
  return (
    <div>
      <div className="row g-4 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard label="کل سفرها" value={stats.total_trips} icon="bi-airplane" color="primary" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="رزروهای فعال" value={stats.total_bookings} icon="bi-ticket-perforated" color="success" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="کاربران" value={stats.total_users} icon="bi-people" color="info" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="درآمد (تومان)" value={money(stats.total_revenue)} icon="bi-cash-stack" color="warning" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="admin-panel h-100">
            <div className="admin-panel-header">آمار نوع سفر</div>
            <div className="admin-panel-body">
              {stats.by_type?.map(b => (
                <div key={b.type} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span><i className={`bi ${TYPE_ICON[b.type] ?? 'bi-ticket'} me-2`}></i>{TYPE_LABEL[b.type] ?? b.type}</span>
                  <span className="badge bg-primary rounded-pill">{b.c} سفر</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="admin-panel h-100">
            <div className="admin-panel-header">آخرین رزروها</div>
            <div className="admin-panel-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0 admin-table">
                  <thead><tr><th>کاربر</th><th>مسیر</th><th>نوع</th><th>مبلغ</th><th>تاریخ</th></tr></thead>
                  <tbody>
                    {stats.recent_bookings?.map(b => (
                      <tr key={b.id}>
                        <td>{b.user_name}</td>
                        <td>{b.from_city} ← {b.to_city}</td>
                        <td><span className="badge bg-secondary">{TYPE_LABEL[b.type] ?? b.type}</span></td>
                        <td className="text-danger small">{money(b.total_price)}</td>
                        <td className="text-muted small">{fmt(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// مدیریت سفرها
// ────────────────────────────────────────────────────────
function TripsTab({ trips, onCreate, onEdit, onDelete }) {
  const columns = [
    { key: 'type', label: 'نوع', sortable: true, render: t => <span className="badge bg-secondary">{TYPE_LABEL[t.type] ?? t.type}</span> },
    { key: 'from_city', label: 'مسیر', sortable: true, render: t => <span className="fw-semibold">{t.from_city} ← {t.to_city}</span> },
    { key: 'departure_time', label: 'حرکت', sortable: true, render: t => <span className="small text-muted">{fmt(t.departure_time)}</span> },
    { key: 'company', label: 'شرکت', sortable: true, render: t => <span className="small">{t.company}</span> },
    { key: 'price', label: 'قیمت', sortable: true, render: t => <span className="small text-danger">{money(t.price)}</span> },
    { key: 'available_seats', label: 'ظرفیت', sortable: false, render: t => <span className="small">{t.available_seats}/{t.capacity}</span> },
    { key: 'is_active', label: 'وضعیت', sortable: true, render: t => (
      <span className={`badge ${t.is_active ? 'bg-success' : 'bg-secondary'}`}>{t.is_active ? 'فعال' : 'غیرفعال'}</span>
    ) },
    { key: 'actions', label: 'عملیات', sortable: false, render: t => (
      <div className="d-flex gap-1">
        <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(t)}>
          <i className="bi bi-pencil"></i>
        </button>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(t)}>
          <i className="bi bi-trash"></i>
        </button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={onCreate}>
          <i className="bi bi-plus-circle me-1"></i>افزودن سفر جدید
        </button>
      </div>
      <div className="admin-panel">
        <DataTable
          columns={columns}
          rows={trips}
          searchKeys={['from_city', 'to_city', 'company']}
          searchPlaceholder="جست‌وجو در مبدأ، مقصد یا شرکت..."
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// رزروها
// ────────────────────────────────────────────────────────
function BookingsTab({ bookings }) {
  const statusMap = {
    confirmed: { label: 'تایید', color: 'success' },
    cancelled: { label: 'لغو', color: 'danger' },
    used:      { label: 'استفاده‌شده', color: 'secondary' },
  };

  const columns = [
    { key: 'booking_code', label: 'کد رزرو', sortable: true, render: b => <span className="booking-code text-primary small">{b.booking_code}</span> },
    { key: 'user_name', label: 'کاربر', sortable: true, render: b => (
      <div className="small">{b.user_name}<br/><span className="text-muted">{b.user_email}</span></div>
    ) },
    { key: 'from_city', label: 'مسیر', sortable: true, render: b => <span className="fw-semibold small">{b.from_city} ← {b.to_city}</span> },
    { key: 'type', label: 'نوع', sortable: true, render: b => <span className="badge bg-secondary">{TYPE_LABEL[b.type] ?? b.type}</span> },
    { key: 'passengers', label: 'مسافران', sortable: true, render: b => <span className="small">{b.passengers} نفر</span> },
    { key: 'total_price', label: 'مبلغ', sortable: true, render: b => <span className="small text-danger">{money(b.total_price)}</span> },
    { key: 'status', label: 'وضعیت', sortable: true, render: b => (
      <span className={`badge bg-${statusMap[b.status]?.color ?? 'warning'}`}>{statusMap[b.status]?.label ?? b.status}</span>
    ) },
    { key: 'created_at', label: 'تاریخ', sortable: true, render: b => <span className="text-muted small">{fmt(b.created_at)}</span> },
  ];

  return (
    <div className="admin-panel">
      <DataTable
        columns={columns}
        rows={bookings}
        searchKeys={['booking_code', 'user_name', 'user_email', 'from_city', 'to_city']}
        searchPlaceholder="جست‌وجو در کد رزرو، کاربر یا مسیر..."
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────
// کاربران
// ────────────────────────────────────────────────────────
function UsersTab({ users, onToggle }) {
  const columns = [
    { key: 'name', label: 'نام', sortable: true, render: u => <span className="fw-semibold">{u.name}</span> },
    { key: 'email', label: 'ایمیل', sortable: true, render: u => <span className="small text-muted">{u.email}</span> },
    { key: 'phone', label: 'تلفن', sortable: false, render: u => <span className="small">{u.phone || '—'}</span> },
    { key: 'role', label: 'نقش', sortable: true, render: u => (
      <span className={`badge ${u.role==='admin'?'bg-danger':'bg-primary'}`}>{u.role==='admin'?'ادمین':'کاربر'}</span>
    ) },
    { key: 'is_active', label: 'وضعیت', sortable: true, render: u => (
      <span className={`badge ${u.is_active?'bg-success':'bg-secondary'}`}>{u.is_active?'فعال':'غیرفعال'}</span>
    ) },
    { key: 'created_at', label: 'عضویت', sortable: true, render: u => <span className="small text-muted">{fmtDate(u.created_at)}</span> },
    { key: 'actions', label: 'عملیات', sortable: false, render: u => (
      u.role !== 'admin' ? (
        <button className={`btn btn-sm ${u.is_active?'btn-outline-danger':'btn-outline-success'}`} onClick={() => onToggle(u)}>
          {u.is_active ? 'غیرفعال' : 'فعال'}
        </button>
      ) : <span className="text-muted small">—</span>
    ) },
  ];

  return (
    <div className="admin-panel">
      <DataTable
        columns={columns}
        rows={users}
        searchKeys={['name', 'email', 'phone']}
        searchPlaceholder="جست‌وجو در نام یا ایمیل..."
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────
// سئو
// ────────────────────────────────────────────────────────
function SeoTab({ initial, onSave }) {
  const [form,      setForm]      = useState(initial);
  const [saving,    setSaving]    = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

  useEffect(() => { setForm(initial); }, [initial]);

  const set  = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setBool = (key) => (e) => setForm({ ...form, [key]: e.target.checked });

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const titleTemplateValid = (form.title_template || '').includes('%s');
  const gaIdValid = !form.google_analytics_id || /^(G|UA|GTM)-[A-Za-z0-9-]+$/.test(form.google_analytics_id);
  const canSubmit = dirty && titleTemplateValid && gaIdValid && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) setSavedOnce(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-4">
        {/* عمومی */}
        <div className="col-lg-7">
          <div className="admin-panel mb-4">
            <div className="admin-panel-header">تنظیمات عمومی</div>
            <div className="admin-panel-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold">عنوان پیش‌فرض سایت</label>
                  <input className="form-control" required maxLength={200}
                    value={form.site_title} onChange={set('site_title')} />
                  <div className="form-text small">عنوانی که در صفحه اصلی و در نتایج گوگل نمایش داده می‌شود.</div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">قالب عنوان صفحات داخلی</label>
                  <input className={`form-control ${!titleTemplateValid ? 'is-invalid' : ''}`}
                    value={form.title_template} onChange={set('title_template')} />
                  {!titleTemplateValid
                    ? <div className="invalid-feedback">قالب باید شامل %s باشد (جای عنوان صفحه).</div>
                    : <div className="form-text small">مثال: «%s | بلیط یاب» → در صفحه یک سفر می‌شود «بلیط تهران به مشهد | بلیط یاب»</div>}
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">توضیحات متا (Meta Description)</label>
                  <textarea className="form-control" rows={3} maxLength={320}
                    value={form.meta_description} onChange={set('meta_description')} />
                  <div className="form-text small">{(form.meta_description || '').length}/320 کاراکتر</div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">کلمات کلیدی</label>
                  <input className="form-control" maxLength={500}
                    placeholder="بلیط هواپیما, بلیط قطار, ..."
                    value={form.meta_keywords} onChange={set('meta_keywords')} />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">آدرس اصلی سایت (Canonical URL)</label>
                  <input type="url" className="form-control" placeholder="https://example.com"
                    value={form.canonical_url} onChange={set('canonical_url')} />
                  <div className="form-text small">بدون / در انتها — برای ساخت لینک canonical و نقشه سایت استفاده می‌شود.</div>
                </div>
              </div>
            </div>
          </div>

          {/* شبکه‌های اجتماعی */}
          <div className="admin-panel mb-4">
            <div className="admin-panel-header">اشتراک‌گذاری در شبکه‌های اجتماعی</div>
            <div className="admin-panel-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold">تصویر پیش‌نمایش (OG Image)</label>
                  <input type="url" className="form-control" placeholder="https://example.com/preview.jpg"
                    value={form.og_image} onChange={set('og_image')} />
                  <div className="form-text small">پیشنهاد: حداقل ۱۲۰۰×۶۳۰ پیکسل</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">نام سایت (OG Site Name)</label>
                  <input className="form-control" maxLength={100}
                    value={form.og_site_name} onChange={set('og_site_name')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">نام کاربری توییتر/X</label>
                  <input className="form-control" placeholder="@bilityab"
                    value={form.twitter_handle} onChange={set('twitter_handle')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* موتورهای جست‌وجو + آنالیتیکس */}
        <div className="col-lg-5">
          <div className="admin-panel mb-4">
            <div className="admin-panel-header">موتورهای جست‌وجو</div>
            <div className="admin-panel-body">
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" role="switch" id="robotsIndex"
                  checked={!!form.robots_index} onChange={setBool('robots_index')} />
                <label className="form-check-label small" htmlFor="robotsIndex">
                  اجازه ایندکس‌شدن توسط گوگل (index)
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" role="switch" id="robotsFollow"
                  checked={!!form.robots_follow} onChange={setBool('robots_follow')} />
                <label className="form-check-label small" htmlFor="robotsFollow">
                  اجازه دنبال‌کردن لینک‌ها (follow)
                </label>
              </div>

              <label className="form-label small fw-semibold">قوانین دلخواه robots.txt</label>
              <textarea className="form-control font-monospace" rows={5} style={{fontSize:'.8rem'}}
                placeholder={'User-agent: *\nDisallow: /admin'}
                value={form.robots_extra_rules} onChange={set('robots_extra_rules')} />
              <div className="form-text small mb-3">در صورت خالی‌بودن، از تنظیمات index/follow بالا استفاده می‌شود.</div>

              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" role="switch" id="sitemapEnabled"
                  checked={!!form.sitemap_enabled} onChange={setBool('sitemap_enabled')} />
                <label className="form-check-label small" htmlFor="sitemapEnabled">
                  تولید خودکار نقشه سایت (sitemap.xml)
                </label>
              </div>

              <div className="d-flex gap-2 mt-3">
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary flex-fill">
                  <i className="bi bi-box-arrow-up-left me-1"></i>robots.txt
                </a>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary flex-fill">
                  <i className="bi bi-box-arrow-up-left me-1"></i>sitemap.xml
                </a>
              </div>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-header">ابزارهای تحلیل و مالکیت سایت</div>
            <div className="admin-panel-body">
              <div className="mb-3">
                <label className="form-label small fw-semibold">کد تایید Google Search Console</label>
                <input className="form-control" maxLength={200} placeholder="google-site-verification content"
                  value={form.google_site_verification} onChange={set('google_site_verification')} />
              </div>
              <div>
                <label className="form-label small fw-semibold">شناسه Google Analytics</label>
                <input className={`form-control ${!gaIdValid ? 'is-invalid' : ''}`} placeholder="G-XXXXXXXXXX"
                  value={form.google_analytics_id} onChange={set('google_analytics_id')} />
                {!gaIdValid && <div className="invalid-feedback">فرمت باید شبیه G-XXXXXXXXXX یا GTM-XXXXXXX باشد.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-end gap-3 mt-2 mb-4">
        {!form.canonical_url && (
          <span className="text-warning small">
            <i className="bi bi-exclamation-triangle-fill me-1"></i>
            بدون تنظیم آدرس اصلی، لینک‌های canonical و نقشه سایت از دامنه درخواست‌دهنده ساخته می‌شوند.
          </span>
        )}
        {savedOnce && !dirty && (
          <span className="text-success small"><i className="bi bi-check-circle-fill me-1"></i>ذخیره شد</span>
        )}
        <button type="submit" className="btn btn-primary px-4" disabled={!canSubmit}>
          {saving ? <span className="spinner-border spinner-border-sm"></span> : 'ذخیره تنظیمات سئو'}
        </button>
      </div>
    </form>
  );
}
