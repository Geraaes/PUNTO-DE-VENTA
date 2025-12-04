import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Auth Pages
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

// Admin Pages
import Dashboard from "../pages/Web/Admin/Dashboard";
import Usuarios from "../pages/Web/Admin/Usuarios";
import ProductosAdmin from "../pages/Web/Admin/Productos"; // renombrado para evitar duplicado
import Categorias from "../pages/Web/Admin/Categorias";
import Roles from "../pages/Web/Admin/Roles";
import InventarioAdmin from "../pages/Web/Admin/Inventario";

// Supervisor Pages
import DashboardSupervisor from "../pages/Web/Supervisor/Dashboard";
import InventarioSupervisor from "../pages/Web/Supervisor/Inventario";
import VentasSupervisor from "../pages/Web/Supervisor/Ventas";

// Cajero Pages
import Caja from "../pages/Web/Cajero/Caja";
import CategoriaDetalleCajero from "../pages/Web/Cajero/CategoriaDetalle";
import ProductoDetalleCajero from "../pages/Web/Cajero/ProductoDetalle";
import ProductosCajero from "../pages/Web/Cajero/Productos";
import VentasCajero from "../pages/Web/Cajero/Ventas";

// PrivateRoute
import PrivateRoute from "./PrivateRoute";

const AppRouter: React.FC = () => {
  const { token, user } = useContext(AuthContext);
  const role = user?.rol; // admin, supervisor, cajero

  return (
    <Router>
      <Routes>
        {/* Página principal → redirige según rol */}
        <Route
          path="/"
          element={
            token ? (
              role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : role === "supervisor" ? (
                <Navigate to="/supervisor/dashboard" replace />
              ) : role === "cajero" ? (
                <Navigate to="/cajero/dashboard" replace />
              ) : (
                <Navigate to="/unauthorized" replace />
              )
            ) : (
              <Login />
            )
          }
        />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute requiredRole="admin">
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <PrivateRoute requiredRole="admin">
              <Usuarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <PrivateRoute requiredRole="admin">
              <ProductosAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <PrivateRoute requiredRole="admin">
              <Categorias />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <PrivateRoute requiredRole="admin">
              <Roles />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/inventario"
          element={
            <PrivateRoute requiredRole="admin">
              <InventarioAdmin />
            </PrivateRoute>
          }
        />

        {/* Supervisor Routes */}
        <Route
          path="/supervisor/dashboard"
          element={
            <PrivateRoute requiredRole="supervisor">
              <DashboardSupervisor />
            </PrivateRoute>
          }
        />
        <Route
          path="/supervisor/inventario"
          element={
            <PrivateRoute requiredRole="supervisor">
              <InventarioSupervisor />
            </PrivateRoute>
          }
        />
        <Route
          path="/supervisor/ventas"
          element={
            <PrivateRoute requiredRole="supervisor">
              <VentasSupervisor />
            </PrivateRoute>
          }
        />

        {/* Cajero Routes */}
        <Route
          path="/cajero/dashboard"
          element={
            <PrivateRoute requiredRole="cajero">
              <Caja />
            </PrivateRoute>
          }
        />
        <Route
          path="/cajero/productos"
          element={
            <PrivateRoute requiredRole="cajero">
              <ProductosCajero />
            </PrivateRoute>
          }
        />
        <Route
          path="/cajero/producto/:id"
          element={
            <PrivateRoute requiredRole="cajero">
              <ProductoDetalleCajero />
            </PrivateRoute>
          }
        />
        <Route
          path="/cajero/categorias/:id"
          element={
            <PrivateRoute requiredRole="cajero">
              <CategoriaDetalleCajero />
            </PrivateRoute>
          }
        />
        <Route
          path="/cajero/ventas"
          element={
            <PrivateRoute requiredRole="cajero">
              <VentasCajero />
            </PrivateRoute>
          }
        />

        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={<h1>No tienes permiso para acceder a esta página</h1>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
