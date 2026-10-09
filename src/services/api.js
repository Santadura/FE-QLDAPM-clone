const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const TOKEN_KEY = "iig_access_token";

export class ApiError extends Error {
  constructor(message, status, body = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body != null) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const body =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json()
        : await response.text();

  if (!response.ok) {
    const message =
      body && typeof body === "object" && body.message
        ? body.message
        : typeof body === "string" && body
          ? body
          : `API error: ${response.status}`;

    if (response.status === 401) {
      setAccessToken(null);
      window.dispatchEvent(new Event("iig:unauthorized"));
    }

    throw new ApiError(message, response.status, body);
  }

  return body;
}
