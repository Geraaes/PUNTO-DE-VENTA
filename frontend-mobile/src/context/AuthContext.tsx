// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../api/api";

// ---------------- TIPOS ----------------
export interface User {
  id: number;
  nombre?: string;
  email?: string;
  rol?: string;
  rol_id?: number;
  rol_nombre?: string; // importante para validar acceso a la caja
}

interface AuthContextProps {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

// ---------------- CONTEXTO ----------------
export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  login: async () => {},
  logout: async () => {},
  setUser: () => {},
  setToken: () => {},
});

// ---------------- PROVIDER ----------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Cargar token y usuario del AsyncStorage al iniciar
  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadAuth();
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    const usuario: User = data.data.user;
    const token = data.data.token;

    if (!usuario || !token) throw new Error("Email o contraseña incorrectos");

    // Guardar en AsyncStorage
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(usuario));

    // Guardar en contexto
    setUser(usuario);
    setToken(token);
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
