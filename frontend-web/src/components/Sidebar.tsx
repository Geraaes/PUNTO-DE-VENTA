import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaBox, FaListAlt, FaUserShield, FaWarehouse, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
  { name: "Usuarios", path: "/admin/usuarios", icon: <FaUsers /> },
  { name: "Productos", path: "/admin/productos", icon: <FaBox /> },
  { name: "Categorías", path: "/admin/categorias", icon: <FaListAlt /> },
  { name: "Roles", path: "/admin/roles", icon: <FaUserShield /> },
  { name: "Inventario", path: "/admin/inventario", icon: <FaWarehouse /> },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes limpiar el token o estado de autenticación
    localStorage.removeItem("token"); 
    navigate("/login"); // redirige a login
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Admin</h2>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} title={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="icon">{item.icon}</span>
              </NavLink>
            </li>
          ))}
          {/* Botón de logout */}
          <li title="Cerrar sesión">
            <button
  className="logout-button"
  onClick={handleLogout}
  aria-label="Cerrar sesión"
>
  <FaSignOutAlt className="icon" />
</button>

          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
