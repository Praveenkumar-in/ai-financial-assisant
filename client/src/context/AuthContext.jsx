import { createContext, useContext, useEffect, useState } from "react";
import { api, unwrap } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try { setUser((await unwrap(await api.get("/auth/me"))).user); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  async function login(email, password) {
    const data = await unwrap(await api.post("/auth/login", { email, password }));
    setUser(data.user);
  }
  async function register(payload) {
    const data = await unwrap(await api.post("/auth/register", payload));
    setUser(data.user);
  }
  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
