import React, { ReactNode, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "supervisor" | "cajero"; // Roles posibles
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  // Verifica si el usuario tiene token y rol permitido
  const allowed = token && (!requiredRole || user?.rol === requiredRole);

  if (!token) {
    // Usuario no autenticado → redirige a login y guarda la ubicación actual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowed) {
    // Usuario autenticado pero sin permisos → redirige a unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Usuario permitido → renderiza children
  return <>{children}</>;
};

export default PrivateRoute;
