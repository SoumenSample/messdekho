// ============================================
// ADMIN SERVICES - API Calls
// ============================================

// frontend/src/services/adminService.js

import api from './api';

export const adminService = {
  // Get all PGs (including unapproved)
  async getAllPGs(filters = {}) {
    return api.get('/admin/pgs', { params: filters });
  },

  // Approve PG
  async approvePG(id) {
    return api.put(`/admin/pg/${id}/approve`);
  },

  // Reject/Delete PG
  async rejectPG(id, reason) {
    return api.delete(`/admin/pg/${id}/reject`, { data: { reason } });
  },

  // Get all users
  async getAllUsers(filters = {}) {
    return api.get('/admin/users', { params: filters });
  },

  // Delete user
  async deleteUser(id) {
    return api.delete(`/admin/user/${id}`);
  },

  // Deactivate user
  async deactivateUser(id) {
    return api.put(`/admin/user/${id}/deactivate`);
  },

  // Get dashboard stats
  async getDashboardStats() {
    return api.get('/admin/stats');
  },

  // Get all bookings
  async getAllBookings(filters = {}) {
    return api.get('/admin/bookings', { params: filters });
  }
};

export default adminService;
