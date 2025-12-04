import axios from "axios";

// ================= CONFIGURACIÓN BASE =================
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_WEB_URL || "https://backend-web-dtwv.onrender.com",
});

// Interceptor para añadir JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
});

// ================= LOGIN =================
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  const token = response.data?.data?.token;
  if (token) localStorage.setItem("token", token);
  return response.data;
};

// ================= USUARIOS =================
export const fetchUsuarios = async () => (await api.get("/usuarios")).data.data;

export const createUsuario = async (data) =>
  (await api.post("/usuarios", data)).data.data;

export const updateUsuario = async (id, data) =>
  (await api.put(`/usuarios/${id}`, data)).data.data;

export const deleteUsuario = async (id) =>
  (await api.delete(`/usuarios/${id}`)).data.data;

// ================= PERFIL =================
export const fetchPerfil = async () => (await api.get("/perfil")).data.data;

export const updatePerfil = async (data) =>
  (await api.put("/perfil", data)).data.data;

export const changePassword = async (data) =>
  (await api.put("/perfil/password", data)).data.data;

// ================= PRODUCTOS =================
export const fetchProductos = async () =>
  (await api.get("/productos")).data.data;

export const fetchProductoById = async (id) =>
  (await api.get(`/productos/${id}`)).data.data;

export const createProducto = async (data) =>
  (await api.post("/productos", data)).data.data;

export const updateProducto = async (id, data) =>
  (await api.put(`/productos/${id}`, data)).data.data;

export const deleteProducto = async (id) =>
  (await api.delete(`/productos/${id}`)).data.data;

// ================= IMÁGENES DE PRODUCTO =================
export const fetchImagenesProducto = async (productoId) =>
  (await api.get(`/productos/${productoId}/imagenes`)).data.data;

export const addImagenProducto = async (productoId, data) =>
  (await api.post(`/productos/${productoId}/imagenes`, data)).data.data;

export const deleteImagenProducto = async (productoId, imagenId) =>
  (await api.delete(`/productos/${productoId}/imagenes/${imagenId}`)).data.data;

// ================= VENTAS =================
// ================= VENTAS =================
export const registrarVenta = async (venta) => {
  try {
    const res = await api.post("/ventas", venta);
    return res.data;
  } catch (error) {
    console.error("Error al registrar venta:", error.response?.data || error);
    return { success: false, message: "Error en la API" };
  }
};

export const fetchVentas = async (fecha_inicio, fecha_fin) => {
  const params = {};
  if (fecha_inicio) params.fecha_inicio = fecha_inicio;
  if (fecha_fin) params.fecha_fin = fecha_fin;

  const res = await api.get("/ventas", { params });

  // ✔ SOLO ARRAY
  return res.data.data;
};

// ================= CATEGORÍAS =================
export const fetchCategorias = async () =>
  (await api.get("/categorias")).data.data;

export const fetchCategoriaById = async (id) =>
  (await api.get(`/categorias/${id}`)).data.data;

export const createCategoria = async (data) =>
  (await api.post("/categorias", data)).data.data;

export const updateCategoria = async (id, data) =>
  (await api.put(`/categorias/${id}`, data)).data.data;

export const deleteCategoria = async (id) =>
  (await api.delete(`/categorias/${id}`)).data.data;

// ================= ROLES =================
export const fetchRoles = async () => (await api.get("/roles")).data.data;

export const createRol = async (data) =>
  (await api.post("/roles", data)).data.data;

export const updateRol = async (id, data) =>
  (await api.put(`/roles/${id}`, data)).data.data;

export const deleteRol = async (id) =>
  (await api.delete(`/roles/${id}`)).data.data;

// ================= INVENTARIO =================
export const fetchInventarioHistorial = async () =>
  (await api.get("/inventario/historial")).data.data;

export const fetchStockBajo = async () =>
  (await api.get("/inventario/stock-bajo")).data.data;

export const fetchEstadisticasInventario = async () =>
  (await api.get("/inventario/estadisticas")).data.data;

export const registrarMovimientoInventario = async (data) =>
  (await api.post("/inventario/movimiento", data)).data;

// ================= HISTORIAL =================
export const fetchHistorialMovimientos = async () => {
  try {
    const response = await api.get("/inventario/historial");
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener historial de movimientos:", error);
    throw error;
  }
};

// ================= LOGOUT =================
export const logout = () => localStorage.removeItem("token");

export default api;
