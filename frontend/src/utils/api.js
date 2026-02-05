import axios from 'axios';

const api = axios.create({
  // Use absolute root URL for production
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://amara-skincare-backend.onrender.com'
});

api.interceptors.request.use((config) => {
  // Ensure all request URLs start with /api
  if (config.url && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;