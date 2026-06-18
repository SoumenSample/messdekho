import api from './api';

export const homepageCityService = {
  async getHomepageCities({ all = false } = {}) {
    return api.get('/homepage-cities', {
      params: all ? { all: 'true' } : {}
    });
  },

  async createHomepageCity(payload) {
    return api.post('/homepage-cities', payload);
  },

  async updateHomepageCity(id, payload) {
    return api.put(`/homepage-cities/${id}`, payload);
  },

  async deleteHomepageCity(id) {
    return api.delete(`/homepage-cities/${id}`);
  }
};

export default homepageCityService;
