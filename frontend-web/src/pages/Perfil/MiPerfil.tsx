// src/pages/Web/Admin/MiPerfil.tsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { fetchPerfil } from "../../services/apiWeb";
import { AuthContext } from "../../context/AuthContext";
import "./Perfil.css"; // Importamos los estilos

interface Perfil {
  nombre: string;
  email: string;
}

const MiPerfil: React.FC = () => {
  const [perfil, setPerfil] = useState<Perfil>({ nombre: "", email: "" });
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Cargamos perfil al inicio
  useEffect(() => {
    const loadPerfil = async () => {
      const data: Perfil = await fetchPerfil();
      setPerfil(data);
    };
    loadPerfil();
  }, []);

  return (
    <div className="perfil-container">
      <Sidebar />
      <div className="perfil-main">
        <Navbar />
        <h1>Mi Perfil</h1>

        <div className="perfil-section">
          <p className="perfil-info">
            <strong>Nombre:</strong> {perfil.nombre}
          </p>
          <p className="perfil-info">
            <strong>Email:</strong> {perfil.email}
          </p>
        </div>

        <div className="perfil-buttons">
          <button
            onClick={() => navigate("/perfil/editar")}
            className="perfil-button"
          >
            Editar Perfil
          </button>
         <button
  onClick={logout}
  className="perfil-button perfil-button-logout"
>
  Cerrar Sesión
</button>

        </div>
      </div>
    </div>
  );
};

export default MiPerfil;
