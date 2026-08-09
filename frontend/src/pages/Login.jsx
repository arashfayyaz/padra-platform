import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const redirect = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ورود');
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-airplane-fill text-primary" style={{fontSize:'3rem'}}></i>
                <h4 className="fw-bold mt-2">ورود به حساب</h4>
                <p className="text-muted small">ادمین: admin@bilityab.ir / admin1234</p>
              </div>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">ایمیل</label>
                  <input type="email" className="form-control" required autoComplete="email"
                    value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">رمز عبور</label>
                  <input type="password" className="form-control" required autoComplete="current-password"
                    value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                  {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
                  ورود
                </button>
              </form>
              <hr />
              <p className="text-center mb-0 small">حساب ندارید؟ <Link to="/register" className="fw-semibold">ثبت‌نام</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
