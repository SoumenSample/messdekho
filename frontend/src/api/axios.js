import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

// Create reusable Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor - Add token to each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - Clear token using shared utility
      removeToken();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
