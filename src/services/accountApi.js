import { apiRequest } from './api';

const accountPath = (username) => `/accounts/${encodeURIComponent(username)}`;

export const accountApi = {
  list: () => apiRequest('/accounts'),
  detail: (username) => apiRequest(accountPath(username)),
  create: (body) => apiRequest('/accounts', { method: 'POST', body: JSON.stringify(body) }),
  changeStatus: (username, status) => apiRequest(`${accountPath(username)}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  }),
};
