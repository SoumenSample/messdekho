// ============================================
// AUTH SERVICES - API Calls
// ============================================

// frontend/src/services/authService.js

import api from './api';

const clearAuthStorage = () => {
  ['token', 'user', 'role', 'md_session'].forEach((key) => localStorage.removeItem(key));
};

const normalizeAuthResponse = (response) => {
  const payload = response?.data || {};
  return {
    token: payload.token || payload.data?.token || null,
    user: payload.user || payload.data?.user || null,
  };
};

export const authService = {
  // Register user
  async register(userData) {
    return api.post('/auth/register', userData);
  },

  // Login user
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    
    // Store token and user
    const { token, user } = normalizeAuthResponse(response);

    if (token && user) {
      clearAuthStorage();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response;
  },

  // Get current user
  async getCurrentUser() {
    return api.get('/auth/me');
  },

  // Update profile
  async updateProfile(userData) {
    return api.put('/auth/profile', userData);
  },

  // Logout
  async logout() {
    clearAuthStorage();
    return api.post('/auth/logout');
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  },

  // Get stored user
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
