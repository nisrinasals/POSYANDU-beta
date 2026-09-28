import axios from 'axios';

// Base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Menambahkan Bearer Token ke Authorization Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Menangani error global & format response
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Tangani token expired atau unauthorized (401)
    if (error.response && error.response.status === 401) {
      console.warn('Sesi telah berakhir atau token tidak valid.');
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Terjadi kesalahan pada server.',
      errors: error.response?.data?.errors || null,
      data: error.response?.data || null,
    };

    return Promise.reject(customError);
  }
);

export default api;
