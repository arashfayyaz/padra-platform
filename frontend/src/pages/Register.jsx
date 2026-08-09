import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [form,    setForm]    = useState({ name:'', email:'', password:'', phone:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('رمز عبور حداقل ۶ کاراکتر باشد'); return; }
    setLoading(true); setError('');
    try {
      const res = await authAPI.register(form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ثبت‌نام');
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-person-plus-fill text-primary" style={{fontSize:'3rem'}}></i>
                <h4 className="fw-bold mt-2">ایجاد حساب کاربری</h4>
              </div>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">نام کامل <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" required minLength={2}
                    value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">ایمیل <span className="text-danger">*</span></label>
                  <input type="email" className="form-control" required
                    value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">شماره موبایل</label>
                  <input type="tel" className="form-control" placeholder="اختیاری"
                    value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">رمز عبور <span className="text-danger">*</span></label>
                  <input type="password" className="form-control" required minLength={6}
                    value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
                  <div className="form-text">حداقل ۶ کاراکتر</div>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                  {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
                  ثبت‌نام
                </button>
              </form>
              <hr />
              <p className="text-center mb-0 small">حساب دارید؟ <Link to="/login" className="fw-semibold">ورود</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
