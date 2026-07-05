import api from './api';

export const bookingService = {
  create: (userId, data) => api.post(`/booking?userId=${userId}`, data),
  getMyBookings: (userId) => api.get(`/booking/my?userId=${userId}`),
  cancel: (bookingId, userId) => api.delete(`/booking/${bookingId}?userId=${userId}`),
  payWallet: (bookingId, userId) => api.post(`/booking/${bookingId}/pay-wallet?userId=${userId}`),
  getAllAdmin: () => api.get('/admin/booking'),
};
