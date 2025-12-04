// src/api/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { InternalAxiosRequestConfig } from "axios";

// ================= CONFIGURACIÓN BASE =================
const api = axios.create({
  baseURL: "https://backend-web-dtwv.onrender.com/api", // misma que la web
  timeout: 10000, // opcional: evita que se quede colgado
});

// ================= INTERCEPTOR =================
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem("token");

  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= LOGIN =================
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const token = response.data?.data?.token;
    const user = response.data?.data?.user;

    if (token && user) {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  } catch (error: any) {
    console.error("Error en login:", error.response?.data || error.message);
    throw error;
  }
};

// ================= USUARIOS =================
export const fetchUsuarios = async () => (await api.get("/usuarios")).data.data;
export const createUsuario = async (data: any) => (await api.post("/usuarios", data)).data.data;
export const updateUsuario = async (id: number, data: any) => (await api.put(`/usuarios/${id}`, data)).data.data;
export const deleteUsuario = async (id: number) => (await api.delete(`/usuarios/${id}`)).data.data;

// ================= PERFIL =================
export const fetchPerfil = async () => (await api.get("/perfil")).data.data;
export const updatePerfil = async (data: any) => (await api.put("/perfil", data)).data.data;
export const changePassword = async (data: any) => (await api.put("/perfil/password", data)).data.data;

// ================= PRODUCTOS =================
export const fetchProductos = async () => (await api.get("/productos")).data.data;
export const fetchProductoById = async (id: number) => (await api.get(`/productos/${id}`)).data.data;
export const createProducto = async (data: any) => (await api.post("/productos", data)).data.data;
export const updateProducto = async (id: number, data: any) => (await api.put(`/productos/${id}`, data)).data.data;
export const deleteProducto = async (id: number) => (await api.delete(`/productos/${id}`)).data.data;

// ================= VENTAS =================
export const registrarVenta = async (venta: any) => {
  try {
    const res = await api.post("/ventas", venta);
    return res.data;
  } catch (error: any) {
    console.error("Error al registrar venta:", error.response?.data || error.message);
    return { success: false, message: "Error en la API" };
  }
};

export const fetchVentas = async (fecha_inicio?: string, fecha_fin?: string) => {
  const params: any = {};
  if (fecha_inicio) params.fecha_inicio = fecha_inicio;
  if (fecha_fin) params.fecha_fin = fecha_fin;

  try {
    const res = await api.get("/ventas", { params });
    return res.data.data;
  } catch (error: any) {
    console.error("Error al traer ventas:", error.response?.data || error.message);
    return [];
  }
};

// ================= INVENTARIO =================
export const registrarMovimientoInventario = async (data: any) => {
  try {
    const res = await api.post("/inventario/movimiento", data);
    return res.data;
  } catch (error: any) {
    console.error("Error al registrar movimiento de inventario:", error.response?.data || error.message);
    return { success: false, message: "Error en la API" };
  }
};

export const fetchInventario = async () => {
  try {
    return (await api.get("/inventario/historial")).data.data;
  } catch (error: any) {
    console.error("Error al traer inventario:", error.response?.data || error.message);
    return [];
  }
};

// ================= LOGOUT =================
export const logout = async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
};

export default api;
