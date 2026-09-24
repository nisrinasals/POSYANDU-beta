import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');
const baseURL = normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;

const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let Axios set the multipart boundary automatically.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject({
      status: error.response?.status || 0,
      message:
        error.response?.data?.message ||
        error.message ||
        'Terjadi kesalahan pada server.',
      errors: error.response?.data?.errors || null,
      data: error.response?.data || null,
    });
  }
);

export default api;
