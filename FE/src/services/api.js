import axios from 'axios';

// The Spring Boot backend runs on localhost:9999 with context path /api.
// Adjust base URL if needed.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999/api/v1/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (registerData) => {
    // registerData: { email, password, fullName, role }
    const response = await api.post('/register', registerData);
    return response.data;
  },

  verifyOtp: async (verifyData) => {
    // Backend expects: { email, otpCode }
    const response = await api.post('/verify-otp', verifyData);
    return response.data; // Returns AuthResponse: { accessToken, refreshToken, tokenType, userId, email, fullName, role }
  },

  resendOtp: async (email) => {
    const response = await api.post('/resend-otp', { email });
    return response.data;
  },

  login: async (loginData) => {
    // loginData: { email, password }
    const response = await api.post('/login', loginData);
    return response.data; // Returns AuthResponse: { accessToken, refreshToken, tokenType, userId, email, fullName, role }
  },

  loginWithGoogle: async (idToken) => {
    // Backend expects: { idToken }
    const response = await api.post('/login/google', { idToken });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (resetData) => {
    // Backend expects: { email, otpCode, newPassword }
    const response = await api.post('/reset-password', resetData);
    return response.data;
  },
};

export default api;
