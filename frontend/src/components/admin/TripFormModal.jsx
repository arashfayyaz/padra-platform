import React from 'react';

const CLASS_OPTIONS = ['economy', 'business', 'درجه ۱', 'درجه ۲', 'VIP', 'معمولی'];

export default function TripFormModal({ form, setForm, editId, onSubmit, onCancel, submitting }) {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={onSubmit}>
      <div className="modal-body">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold">نوع سفر</label>
            <select className="form-select" value={form.type} onChange={set('type')}>
              <option value="flight">هواپیما</option>
              <option value="train">قطار</option>
              <option value="bus">اتوبوس</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">مبدأ</label>
            <input className="form-control" required value={form.from_city} onChange={set('from_city')} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">مقصد</label>
            <input className="form-control" required value={form.to_city} onChange={set('to_city')} />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-semibold">زمان حرکت</label>
            <input type="datetime-local" className="form-control" required value={form.departure_time} onChange={set('departure_time')} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold">زمان رسیدن</label>
            <input type="datetime-local" className="form-control" required value={form.arrival_time} onChange={set('arrival_time')} />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-semibold">قیمت (تومان)</label>
            <input type="number" className="form-control" required min="1000" value={form.price} onChange={set('price')} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">ظرفیت</label>
            <input type="number" className="form-control" required min="1" value={form.capacity} onChange={set('capacity')} />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">کلاس</label>
            <select className="form-select" value={form.class} onChange={set('class')}>
              {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label small fw-semibold">شرکت مسافربری</label>
            <input className="form-control" required value={form.company} onChange={set('company')} />
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>انصراف</button>
        <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
          {submitting ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            editId ? 'ذخیره تغییرات' : 'افزودن سفر'
          )}
        </button>
      </div>
    </form>
  );
}
