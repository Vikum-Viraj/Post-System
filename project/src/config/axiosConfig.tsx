// src/utils/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
//   baseURL: '/api/v1',
  baseURL: 'http://localhost:8092/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for adding authorization token if needed
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming you store JWT token in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized access - please login again');
      // You might want to redirect to login here
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;