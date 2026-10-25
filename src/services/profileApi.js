import { apiRequest } from './api';

export const profileApi = {
  mine: () => apiRequest('/profile'),
  salary: () => apiRequest('/profile/salary'),
  certificates: () => apiRequest('/profile/certificates'),
  update: (body) => apiRequest('/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body) => apiRequest('/profile/password', { method: 'POST', body: JSON.stringify(body) }),
};
