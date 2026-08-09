import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:       (data)  => api.post('/auth/register', data),
  login:          (data)  => api.post('/auth/login', data),
  profile:        ()      => api.get('/auth/profile'),
  updateProfile:  (data)  => api.put('/auth/profile', data),
  changePassword: (data)  => api.put('/auth/change-password', data),
};

export const tripsAPI = {
  getAll:    ()       => api.get('/trips'),
  search:    (params) => api.get('/trips/search', { params }),
  getById:   (id)     => api.get(`/trips/${id}`),
  getStats:  ()       => api.get('/trips/stats'),
  create:    (data)   => api.post('/trips', data),
  update:    (id, d)  => api.put(`/trips/${id}`, d),
  delete:    (id)     => api.delete(`/trips/${id}`),
  addReview: (id, d)  => api.post(`/trips/${id}/reviews`, d),
};

export const bookingsAPI = {
  book:    (data) => api.post('/bookings', data),
  getMy:   ()     => api.get('/bookings/my'),
  getById: (id)   => api.get(`/bookings/${id}`),
  cancel:  (id)   => api.put(`/bookings/${id}/cancel`),
  getAll:  (p)    => api.get('/bookings', { params: p }),
};

export const adminAPI = {
  getUsers:   (p)   => api.get('/admin/users', { params: p }),
  toggleUser: (id)  => api.put(`/admin/users/${id}/toggle`),
  setRole:    (id, role) => api.put(`/admin/users/${id}/role`, { role }),
};

export const seoAPI = {
  get:    ()     => api.get('/seo'),
  update: (data) => api.put('/seo', data),
};

export default api;
