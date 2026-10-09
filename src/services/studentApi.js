import { apiRequest } from "./api";

export const studentApi = {
  list: () => apiRequest("/students"),
  detail: (studentId) => apiRequest(`/students/${studentId}`),
  create: (payload) =>
    apiRequest("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (studentId, payload) =>
    apiRequest(`/students/${studentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  changeStatus: (studentId, status) =>
    apiRequest(`/students/${studentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  remove: (studentId) =>
    apiRequest(`/students/${studentId}`, { method: "DELETE" }),
};
