// src/components/SidebarSupervisor.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaWarehouse, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const menuItems = [
  { name: "Dashboard", path: "/supervisor/dashboard", icon: <FaTachometerAlt /> },
  { name: "Inventario", path: "/supervisor/inventario", icon: <FaWarehouse /> },
  { name: "Ventas", path: "/supervisor/ventas", icon: <FaChartLine /> },
];

const SidebarSupervisor: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Supervisor</h2>
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

export default SidebarSupervisor;
