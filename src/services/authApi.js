import { apiRequest } from "./api";

export function loginRequest(username, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
