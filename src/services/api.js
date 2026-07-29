import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1) Attach Token to Request Headers automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2) Handle Global Errors & 401 Expiration
api.interceptors.response.use(
  (response) => response.data, // Unwrap backend envelope: returns { message, data, pagination }
  (error) => {
    const status = error.response?.status;
    const errMsg = error.response?.data?.message || 'An error occurred. Please try again.';

    if (status === 401) {
      message.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      message.error('Forbidden: You do not have permission.');
    } else {
      message.error(errMsg);
    }

    return Promise.reject(error);
  }
);

export default api;