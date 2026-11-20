import { apiRequest } from "./api";

export function loginRequest(username, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logoutRequest() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

export function registerRequest(body) {
  return apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export function currentAccountRequest() {
  return apiRequest('/auth/me');
}
