import { apiRequest } from './api'

const query = (values) => { const params = new URLSearchParams(); Object.entries(values).forEach(([key, value]) => { if (value != null && value !== '') params.set(key, value) }); return params.toString() ? `?${params}` : '' }
export const payrollApi = {
  list: ({ period, employeeId } = {}) => apiRequest(`/payroll${query({ period, employeeId })}`),
  calculate: ({ period, employeeId } = {}) => apiRequest(`/payroll/calculate${query({ period, employeeId })}`, { method: 'POST' }),
  detail: (employeeId, period) => apiRequest(`/payroll/${encodeURIComponent(employeeId)}/${encodeURIComponent(period)}`),
  history: (employeeId) => apiRequest(`/payroll/${encodeURIComponent(employeeId)}/history`),
  salaryProfile: (employeeId) => apiRequest(`/payroll/employees/${encodeURIComponent(employeeId)}/salary-profile`),
  ranks: (roleId) => apiRequest(`/payroll/ranks${query({ roleId })}`),
  createRank: (payload) => apiRequest('/payroll/ranks', { method: 'POST', body: JSON.stringify(payload) }),
  updateRank: (id, payload) => apiRequest(`/payroll/ranks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  assignRank: (employeeId, payload) => apiRequest(`/payroll/rank-assignments/${encodeURIComponent(employeeId)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  createReview: (payload) => apiRequest('/payroll/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  reviews: (status) => apiRequest(`/payroll/reviews${query({ status })}`),
  decideReview: (id, payload) => apiRequest(`/payroll/reviews/${encodeURIComponent(id)}/decision`, { method: 'POST', body: JSON.stringify(payload) }),
}
