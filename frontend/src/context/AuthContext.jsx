import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { initializeAuthToken, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuthToken();
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user || null))
      .catch(() => {
        setUser(null);
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (name, password) => {
    const { data } = await api.post("/auth/login", { name, password });
    if (data?.token) setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    if (data?.token) setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      isAuthenticated: Boolean(user),
      isManager: (user?.type || user?.role) === "Manager",
      isStaff: (user?.type || user?.role) === "Staff",
      login,
      register,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
