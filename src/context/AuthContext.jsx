import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../services/authApi";
import { setAccessToken } from "../services/api";

const SESSION_KEY = "iig_auth_session";
const AuthContext = createContext(null);

function readSession() {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    function handleUnauthorized() {
      setSession(null);
      localStorage.removeItem(SESSION_KEY);
    }

    window.addEventListener("iig:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("iig:unauthorized", handleUnauthorized);
  }, []);

  async function login(username, password) {
    const response = await loginRequest(username.trim(), password);
    const next = {
      token: response.token,
      tokenType: response.tokenType ?? "Bearer",
      username: response.username,
      role: response.role,
    };
    setAccessToken(next.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    return next;
  }

  function logout() {
    setAccessToken(null);
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
