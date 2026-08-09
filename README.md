# 🛫 بلیط یاب — v2.0

سامانه خرید آنلاین بلیط هواپیما، قطار و اتوبوس

---

## 📦 تکنولوژی‌ها

| Backend                  | Frontend               |
|--------------------------|------------------------|
| Node.js v24 ✅           | React 18               |
| Express 4                | Vite 5 (سازگار Node v24) |
| SQLite (better-sqlite3)  | Bootstrap 5 RTL        |
| JWT Auth                 | React Router v6        |
| bcryptjs                 | Axios                  |
| express-validator        | Context API            |
| morgan + rate-limit      | —                      |

---

## 📁 ساختار پروژه

```
ticket-app/
├── backend/
│   ├── config/
│   │   └── database.js       ← SQLite + seed data
│   ├── middleware/
│   │   └── auth.js           ← JWT middleware
│   ├── routes/
│   │   ├── auth.js           ← ثبت‌نام / ورود / پروفایل
│   │   ├── trips.js          ← CRUD سفرها + جستجو
│   │   ├── bookings.js       ← رزرو + لغو
│   │   └── admin.js          ← مدیریت کاربران
│   ├── data/                 ← tickets.db (خودکار ساخته میشه)
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   └── TripCard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Search.jsx        ← جستجو + فیلتر قیمت + مرتب‌سازی
    │   │   ├── TripDetail.jsx    ← جزئیات + رزرو + نظرات
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── MyBookings.jsx    ← رزروها + لغو
    │   │   ├── Profile.jsx       ← ویرایش پروفایل + تغییر رمز
    │   │   └── Admin.jsx         ← پنل مدیریت کامل
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 راه‌اندازی

### مرحله ۱ — PowerShell را درست کن (یک بار)

**PowerShell را به عنوان Administrator باز کن:**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

**یا از cmd معمولی استفاده کن** (بدون نیاز به تنظیم)

---

### مرحله ۲ — Backend

```bash
cd ticket-app\backend
npm install
node server.js
```

سرور روی `http://localhost:5000` بالا میاد.

---

### مرحله ۳ — Frontend (ترمینال جدید)

```bash
cd ticket-app\frontend
npm install
npm run dev
```

سایت روی `http://localhost:5173` بالا میاد.

---

## 👤 حساب‌های پیش‌فرض

| نقش   | ایمیل               | رمز عبور   |
|-------|---------------------|------------|
| ادمین | admin@bilityab.ir   | admin1234  |

برای ساخت کاربر عادی، از صفحه ثبت‌نام استفاده کن.

---

## 🔗 API Endpoints

### Auth
```
POST /api/auth/register        ← ثبت‌نام
POST /api/auth/login           ← ورود
GET  /api/auth/profile         ← پروفایل (نیاز به توکن)
PUT  /api/auth/profile         ← ویرایش پروفایل
PUT  /api/auth/change-password ← تغییر رمز
```

### Trips
```
GET    /api/trips                    ← همه سفرها
GET    /api/trips/search?from=&to=&date=&type=&min_price=&max_price=&sort=
GET    /api/trips/stats              ← آمار (ادمین)
GET    /api/trips/:id                ← جزئیات + نظرات
POST   /api/trips                    ← افزودن (ادمین)
PUT    /api/trips/:id                ← ویرایش (ادمین)
DELETE /api/trips/:id                ← حذف (ادمین)
POST   /api/trips/:id/reviews        ← ثبت نظر
```

### Bookings
```
POST /api/bookings             ← رزرو جدید
GET  /api/bookings/my          ← رزروهای من
GET  /api/bookings/:id         ← جزئیات رزرو
PUT  /api/bookings/:id/cancel  ← لغو رزرو
GET  /api/bookings             ← همه رزروها (ادمین)
```

### Admin
```
GET /api/admin/users              ← لیست کاربران
PUT /api/admin/users/:id/toggle   ← فعال/غیرفعال
PUT /api/admin/users/:id/role     ← تغییر نقش
```

---

## 🗃️ دیتابیس

SQLite — فایل `backend/data/tickets.db` خودکار ساخته میشه.

جداول:
- `users` — کاربران
- `trips` — سفرها (۱۸ سفر نمونه)
- `bookings` — رزروها
- `reviews` — نظرات

---

## ✨ ویژگی‌ها

- ✅ سازگار با Node.js v24
- ✅ Vite به جای react-scripts (بدون مشکل OpenSSL)
- ✅ احراز هویت JWT با refresh
- ✅ جستجوی پیشرفته با فیلتر قیمت و مرتب‌سازی
- ✅ رزرو با کد اختصاصی
- ✅ لغو رزرو (تا ۲ ساعت قبل از سفر)
- ✅ پنل ادمین کامل (داشبورد + سفرها + رزروها + کاربران)
- ✅ پروفایل کاربری + تغییر رمز
- ✅ Rate limiting ضد حملات
- ✅ RTL فارسی با فونت Vazirmatn
- ✅ Responsive کامل
