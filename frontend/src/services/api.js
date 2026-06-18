// ============================================
// API SERVICE - AXIOS Configuration
// ============================================

// frontend/src/services/api.js

import axios from 'axios';

// Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
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

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific errors
    if (error.response?.status === 401) {
      // Token expired - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('md_session');
      // DEBUG: suppress automatic redirect to /auth while debugging auth flow
      // window.location.href = '/auth';
      console.warn('DEBUG: api would redirect to /auth (suppressed)');
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

// ============================================
// EXPORT API INSTANCE
// ============================================

export default api;
