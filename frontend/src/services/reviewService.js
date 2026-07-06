import api from './api';

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getByVehicle: (vehicleId) => api.get('/vehicles/' + vehicleId + '/reviews'),
};
