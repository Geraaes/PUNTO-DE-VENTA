import React, { useState, useEffect, ReactNode, useMemo } from "react";
import { AuthContext, User } from "./AuthContext";

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed: User = JSON.parse(storedUser);
        setUser(parsed);
        setToken(parsed.token || null);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setToken(userData.token || null);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
  };

  // ✅ Memorizar el valor del contexto
  const authValue = useMemo(() => ({ user, token, login, logout }), [user, token]);

  if (loading) {
    return <p>Cargando sesión...</p>;
  }

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};
