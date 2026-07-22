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

// ===================== Job Service =====================
export const jobService = {
  getPublishedJobs: async () => (await api.get('/jobs')).data,
  searchJobs: async (query, location, jobType) => {
    const params = {};
    if (query) params.query = query;
    if (location && location !== 'All Locations') params.location = location;
    if (jobType && jobType !== 'All Types') params.jobType = jobType;
    return (await api.get('/jobs/search', { params })).data;
  },
  getJobDetails: async (id) => (await api.get(`/jobs/${id}`)).data,

  // Employer CRUD
  getMyJobs: async () => (await api.get('/jobs/my')).data,
  createJob: async (data) => (await api.post('/jobs', data)).data,
  updateJob: async (id, data) => (await api.put(`/jobs/${id}`, data)).data,
  deleteJob: async (id) => (await api.delete(`/jobs/${id}`)).data,
  changeJobStatus: async (id, status) => (await api.patch(`/jobs/${id}/status`, { status })).data,
};

// ===================== Application Service =====================
export const applicationService = {
  applyJob: async (formData) => {
    return (await api.post('/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data;
  },
  getMyApplications: async () => (await api.get('/applications/my')).data,
  getEmployerApplications: async () => (await api.get('/applications/employer')).data,
};

// ===================== Admin Service =====================
export const adminService = {
  // UC_21 – User Management
  getAllUsers: async (role, status) => {
    const params = {};
    if (role) params.role = role;
    if (status) params.status = status;
    return (await api.get('/admin/users', { params })).data;
  },
  updateUserStatus: async (id, accountStatus) =>
    (await api.patch(`/admin/users/${id}/status`, { accountStatus })).data,
  adminResetPassword: async (id, newPassword) =>
    (await api.put(`/admin/users/${id}/password`, { newPassword })).data,
  deleteUser: async (id) => (await api.delete(`/admin/users/${id}`)).data,

  // UC_20 – Content Moderation
  getAllJobs: async (status) => {
    const params = {};
    if (status) params.status = status;
    return (await api.get('/admin/jobs', { params })).data;
  },
  reviewJob: async (id, status, reason) =>
    (await api.patch(`/admin/jobs/${id}/review`, { status, reason })).data,
  getAllCompanies: async (status) => {
    const params = {};
    if (status) params.status = status;
    return (await api.get('/admin/companies', { params })).data;
  },
  reviewCompany: async (id, status, reason) =>
    (await api.patch(`/admin/companies/${id}/review`, { status, reason })).data,

  // UC_22 – Dashboard
  getDashboardStats: async () => (await api.get('/admin/dashboard/stats')).data,

  // UC_19 – System Config
  getAllPackages: async () => (await api.get('/admin/packages')).data,
  createPackage: async (data) => (await api.post('/admin/packages', data)).data,
  updatePackage: async (id, data) => (await api.put(`/admin/packages/${id}`, data)).data,
  deletePackage: async (id) => (await api.delete(`/admin/packages/${id}`)).data,
  getAllConfigs: async () => (await api.get('/admin/config')).data,
  upsertConfig: async (configName, configValue) =>
    (await api.put(`/admin/config/${configName}`, { configValue })).data,

  // UC_23 – Report Export (opens download directly)
  exportUsersReport: () => {
    const token = localStorage.getItem('token');
    const BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:9999/api/v1';
    window.open(`${BASE}/admin/reports/users?token=${token}`, '_blank');
  },
  exportJobsReport: () => {
    const token = localStorage.getItem('token');
    const BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:9999/api/v1';
    window.open(`${BASE}/admin/reports/jobs?token=${token}`, '_blank');
  },
  exportRevenueReport: () => {
    const token = localStorage.getItem('token');
    const BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:9999/api/v1';
    window.open(`${BASE}/admin/reports/revenue?token=${token}`, '_blank');
  },
};

export default api;

