// ============================================
// PG SERVICES - API Calls
// ============================================

// frontend/src/services/pgService.js

import api from './api';

export const pgService = {
  // Get all approved PGs
  async getAllPGs(filters = {}) {
    return api.get('/pg', { params: filters });
  },

  // Get single PG
  async getPGById(id) {
    return api.get(`/pg/${id}`);
  },

  // Create PG (Owner)
  async createPG(formData) {
    // formData should be FormData object with images
    return api.post('/pg', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update PG
  async updatePG(id, formData) {
    return api.put(`/pg/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete PG
  async deletePG(id) {
    return api.delete(`/pg/${id}`);
  },

  // Get owner's PGs
  async getMyPGs() {
    return api.get('/pg/owner/my');
  },

  // Search PGs by city
  async searchByCity(city) {
    return api.get('/pg', { params: { city } });
  },

  // Search PGs by keyword
  async searchPGs(keyword) {
    return api.get('/pg', { params: { search: keyword } });
  }
};

export default pgService;
