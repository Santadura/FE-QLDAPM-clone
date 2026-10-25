import { apiRequest } from './api';

const path = (id) => `/employee-management/${encodeURIComponent(id)}`;
const weekQuery = (weekStart) => `?weekStart=${encodeURIComponent(weekStart)}`;

export const employeeApi = {
  list: (weekStart, { search = '', role = '', status = '' } = {}) => {
    const query = new URLSearchParams({ weekStart });
    if (search.trim()) query.set('search', search.trim());
    if (role) query.set('role', role);
    if (status) query.set('status', status);
    return apiRequest(`/employee-management?${query}`);
  },
  detail: (id) => apiRequest(path(id)),
  ranks: () => apiRequest('/employee-management/salary-ranks'),
  update: (id, body) => apiRequest(path(id), { method: 'PATCH', body: JSON.stringify(body) }),
  changeStatus: (id, status) => apiRequest(`${path(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  schedules: (id, weekStart) => apiRequest(`${path(id)}/schedules${weekQuery(weekStart)}`),
  availabilities: (id, weekStart) => apiRequest(`${path(id)}/availabilities${weekQuery(weekStart)}`),
  salaries: (id) => apiRequest(`${path(id)}/salaries`),
  history: (id) => apiRequest(`${path(id)}/history`),
  certificates: (id) => apiRequest(`${path(id)}/certificates`),
  saveCertificate: (id, certificateId, body) => apiRequest(
    `${path(id)}/certificates${certificateId ? `/${encodeURIComponent(certificateId)}` : ''}`,
    { method: certificateId ? 'PUT' : 'POST', body: JSON.stringify(body) },
  ),
};
