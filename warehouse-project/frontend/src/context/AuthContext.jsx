import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);
const TOKEN_KEY = "token";
const USER_KEY = "user";

function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY);
  if (!token || !storedUser) {
    clearStoredSession();
    return null;
  }

  try {
    const user = JSON.parse(storedUser);
    if (!user || typeof user !== "object" || Array.isArray(user)) {
      clearStoredSession();
      return null;
    }
    return { token, user };
  } catch {
    clearStoredSession();
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);

  const saveSession = useCallback(({ token, user }) => {
    if (typeof token !== "string" || !token || !user || typeof user !== "object") {
      throw new Error("The authentication response did not include a token and user.");
    }
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setSession({ token, user });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (session?.token) await api.post("/auth/logout");
    } finally {
      clearStoredSession();
      setSession(null);
    }
  }, [session?.token]);

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token && session?.user),
      saveSession,
      logout,
    }),
    [session, saveSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}