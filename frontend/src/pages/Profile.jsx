import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form,    setForm]    = useState({});
  const [pwForm,  setPwForm]  = useState({ current_password:'', new_password:'', confirm:'' });
  const [msg,     setMsg]     = useState({ type:'', text:'' });
  const [pwMsg,   setPwMsg]   = useState({ type:'', text:'' });
  const [saving,  setSaving]  = useState(false);
  const [pwSaving,setPwSaving]= useState(false);
  const [tab,     setTab]     = useState('info');

  useEffect(() => {
    authAPI.profile().then(res => {
      setProfile(res.data.user);
      setForm({ name: res.data.user.name, phone: res.data.user.phone || '', national_id: res.data.user.national_id || '' });
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type:'', text:'' });
    try {
      await authAPI.updateProfile(form);
      await refreshUser?.();
      setMsg({ type:'success', text:'پروفایل با موفقیت بروزرسانی شد' });
    } catch (err) {
      setMsg({ type:'danger', text: err.response?.data?.message || 'خطا' });
    } finally { setSaving(false); }
  };

  const handlePw = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { setPwMsg({ type:'danger', text:'رمزهای جدید یکسان نیستند' }); return; }
    setPwSaving(true); setPwMsg({ type:'', text:'' });
    try {
      await authAPI.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwMsg({ type:'success', text:'رمز عبور تغییر کرد' });
      setPwForm({ current_password:'', new_password:'', confirm:'' });
    } catch (err) {
      setPwMsg({ type:'danger', text: err.response?.data?.message || 'خطا' });
    } finally { setPwSaving(false); }
  };

  if (!profile) return <div className="page-loader"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4" style={{maxWidth:680}}>
      <h2 className="fw-bold mb-4"><i className="bi bi-person-circle me-2"></i>پروفایل من</h2>

      {/* سربرگ */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4 d-flex align-items-center gap-3">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
               style={{width:64,height:64,fontSize:28}}>
            {profile.name?.charAt(0)}
          </div>
          <div>
            <h5 className="fw-bold mb-0">{profile.name}</h5>
            <p className="text-muted small mb-0">{profile.email}</p>
            <span className={`badge ${profile.role === 'admin' ? 'bg-danger' : 'bg-primary'} mt-1`}>
              {profile.role === 'admin' ? 'مدیر سیستم' : 'کاربر'}
            </span>
          </div>
          <div className="ms-auto text-muted small text-end">
            <div>عضو از: {new Date(profile.created_at).toLocaleDateString('fa-IR')}</div>
            {profile.last_login && <div>آخرین ورود: {new Date(profile.last_login).toLocaleDateString('fa-IR')}</div>}
          </div>
        </div>
      </div>

      {/* تبز */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${tab==='info'?'active':''}`} onClick={()=>setTab('info')}>اطلاعات</button></li>
        <li className="nav-item"><button className={`nav-link ${tab==='pw'?'active':''}`}   onClick={()=>setTab('pw')}>رمز عبور</button></li>
      </ul>

      {tab === 'info' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {msg.text && <div className={`alert alert-${msg.type} py-2 small`}>{msg.text}</div>}
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">نام کامل</label>
                <input type="text" className="form-control" required value={form.name || ''}
                  onChange={e=>setForm({...form,name:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">ایمیل</label>
                <input type="email" className="form-control" value={profile.email} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">شماره موبایل</label>
                <input type="tel" className="form-control" value={form.phone || ''}
                  onChange={e=>setForm({...form,phone:e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-semibold">کد ملی</label>
                <input type="text" className="form-control" maxLength={10} value={form.national_id || ''}
                  onChange={e=>setForm({...form,national_id:e.target.value.replace(/\D/,'')})} />
              </div>
              <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                {saving && <span className="spinner-border spinner-border-sm me-2"></span>}
                ذخیره تغییرات
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'pw' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {pwMsg.text && <div className={`alert alert-${pwMsg.type} py-2 small`}>{pwMsg.text}</div>}
            <form onSubmit={handlePw}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">رمز عبور فعلی</label>
                <input type="password" className="form-control" required value={pwForm.current_password}
                  onChange={e=>setPwForm({...pwForm,current_password:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">رمز عبور جدید</label>
                <input type="password" className="form-control" required minLength={6} value={pwForm.new_password}
                  onChange={e=>setPwForm({...pwForm,new_password:e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-semibold">تکرار رمز جدید</label>
                <input type="password" className="form-control" required value={pwForm.confirm}
                  onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary px-4" disabled={pwSaving}>
                {pwSaving && <span className="spinner-border spinner-border-sm me-2"></span>}
                تغییر رمز عبور
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
