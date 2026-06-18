// ============================================
// BOOKING SERVICES - API Calls
// ============================================

// frontend/src/services/bookingService.js

import api from './api';

export const bookingService = {
  // Create booking
  async createBooking(bookingData) {
    return api.post('/bookings', bookingData);
  },

  // Get user's bookings
  async getMyBookings(filters = {}) {
    return api.get('/bookings', { params: filters });
  },

  // Get booking details
  async getBookingById(id) {
    return api.get(`/bookings/${id}`);
  },

  // Cancel booking
  async cancelBooking(id, reason) {
    return api.put(`/bookings/${id}/cancel`, { reason });
  },

  // Add review
  async addReview(id, rating, review) {
    return api.post(`/bookings/${id}/review`, { rating, review });
  },

  // Get owner's bookings
  async getMyBookingsAsOwner(filters = {}) {
    return api.get('/bookings/owner/my', { params: filters });
  },

  // Confirm booking (Owner)
  async confirmBooking(id) {
    return api.put(`/bookings/${id}/confirm`);
  },

  // Approve booking (Owner)
  async approveBooking(id) {
    return api.put(`/bookings/${id}/approve`);
  },

  // Reject booking (Owner)
  async rejectBooking(id, reason = '') {
    return api.put(`/bookings/${id}/reject`, { reason });
  }
};

export default bookingService;
