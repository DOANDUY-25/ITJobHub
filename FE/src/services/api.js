import axios from 'axios';

const BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:9999/api/v1';

// Instance dành cho /api/v1/auth/**
const authApi = axios.create({
  baseURL: `${BASE}/auth`,
  headers: { 'Content-Type': 'application/json' },
});

// Instance dành cho /api/v1/** (users/profile, ...)
const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Gắn JWT Bearer token vào cả 2 instances
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
};
authApi.interceptors.request.use(attachToken, (e) => Promise.reject(e));
api.interceptors.request.use(attachToken, (e) => Promise.reject(e));

// 401 = token hết hạn → hiển thị thông báo rồi redirect sau 1.5s
// 403 = không đủ quyền → để component tự xử lý, KHÔNG logout
const handleAuthError = (error) => {
  if (error.response?.status === 401 && localStorage.getItem('token')) {
    console.warn('[API] Phiên đăng nhập hết hạn.');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Delay nhỏ để các toast error kịp hiển thị trước khi redirect
    setTimeout(() => { window.location.href = '/auth'; }, 1500);
  }
  return Promise.reject(error);
};
authApi.interceptors.response.use((r) => r, handleAuthError);
api.interceptors.response.use((r) => r, handleAuthError);

// ===================== Auth Service =====================
export const authService = {
  register: async (data) => (await authApi.post('/register', data)).data,
  verifyOtp: async (data) => (await authApi.post('/verify-otp', data)).data,
  resendOtp: async (email) => (await authApi.post('/resend-otp', { email })).data,
  login: async (data) => (await authApi.post('/login', data)).data,
  loginWithGoogle: async (idToken) => (await authApi.post('/login/google', { idToken })).data,
  forgotPassword: async (email) => (await authApi.post('/forgot-password', { email })).data,
  resetPassword: async (data) => (await authApi.post('/reset-password', data)).data,
};

// ===================== Profile Service =====================
export const profileService = {
  // GET  /api/v1/users/profile
  getProfile: async () => (await api.get('/users/profile')).data,

  // PUT  /api/v1/users/profile
  updateProfile: async (data) => (await api.put('/users/profile', data)).data,

  // PUT  /api/v1/auth/change-password
  changePassword: async (data) => (await authApi.put('/change-password', data)).data,
};

export default api;
