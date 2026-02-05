import axios from 'axios';

const api = axios.create();

api.interceptors.request.use((config) => {
  const backendBase = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://amara-skincare-backend.onrender.com';

  // Ensure the URL is absolute and correctly prefixed with /api
  if (config.url && !config.url.startsWith('http')) {
    const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
    const apiPath = path.startsWith('/api') ? path : `/api${path}`;
    config.url = `${backendBase}${apiPath}`;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
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