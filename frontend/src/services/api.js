import axios from 'axios';

// Use environment variable in production or fallback to /api proxy in local dev
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Inject Bearer token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('websitescout_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error messaging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const searchLeads = (payload) => api.post('/search', payload);
export const getBusinesses = (params) => api.get('/businesses', { params });
export const getBusinessById = (id) => api.get(`/businesses/${id}`);
export const updateBusinessStatus = (id, status) => api.patch(`/businesses/${id}/status`, { status });
export const updateBusinessNotes = (id, notes) => api.patch(`/businesses/${id}/notes`, { notes });
export const updateFollowUpDate = (id, followUpDate) => api.patch(`/businesses/${id}/follow-up`, { followUpDate });
export const deleteBusiness = (id) => api.delete(`/businesses/${id}`);
export const bulkAction = (payload) => api.post('/businesses/bulk', payload);
export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getApiSettingsStatus = () => api.get('/settings/status');
export const testGoogleApiKey = (apiKey) => api.post('/settings/test-key', { apiKey });

// Auth endpoints
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');

export default api;

