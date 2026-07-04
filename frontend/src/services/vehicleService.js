import api from './api';

export const vehicleService = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  getCategories: () => api.get('/vehicles/categories'),
};
