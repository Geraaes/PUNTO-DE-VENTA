// src/pages/Web/Admin/EditarPerfil.tsx
import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { fetchPerfil, updatePerfil, changePassword } from "../../services/apiWeb";
import "./Perfil.css"; // Importamos los estilos

interface Perfil {
  nombre: string;
  email: string;
}

interface PasswordData {
  actual: string;
  nueva: string;
  confirmar: string;
}

const EditarPerfil: React.FC = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil>({ nombre: "", email: "" });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  // Cargamos perfil al inicio
  
useEffect(() => {
  const fetchData = async () => {
    const data: Perfil = await fetchPerfil();
    setPerfil(data);
  };
  fetchData();
}, []);

  const handleUpdatePerfil = async () => {
    await updatePerfil(perfil);
    alert("Perfil actualizado correctamente");
    navigate("/perfil");
  };

  const handleChangePassword = async () => {
    if (passwordData.nueva !== passwordData.confirmar) {
      alert("Las contraseñas nuevas no coinciden");
      return;
    }
    await changePassword({ actual: passwordData.actual, nueva: passwordData.nueva });
    alert("Contraseña actualizada correctamente");
    setPasswordData({ actual: "", nueva: "", confirmar: "" });
  };

  const handlePerfilChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="edit-perfil-container">
      <Sidebar />
      <div className="edit-perfil-main">
        <Navbar />
        <h1>Editar Perfil</h1>

        <div className="edit-perfil-section">
          <label htmlFor="nombre" className="edit-perfil-label">Nombre:</label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={perfil.nombre}
            onChange={handlePerfilChange}
            placeholder="Nombre"
            className="edit-perfil-input"
          />

          <label htmlFor="email" className="edit-perfil-label">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={perfil.email}
            onChange={handlePerfilChange}
            placeholder="Correo electrónico"
            className="edit-perfil-input"
          />

          <button onClick={handleUpdatePerfil} className="edit-perfil-button">
            Guardar Cambios
          </button>
        </div>

        <h2 className="edit-perfil-title">Cambiar Contraseña</h2>
        <div className="edit-perfil-section">
          <label htmlFor="actual" className="edit-perfil-label">Contraseña Actual:</label>
          <input
            id="actual"
            type="password"
            name="actual"
            value={passwordData.actual}
            onChange={handlePasswordChange}
            placeholder="Contraseña actual"
            className="edit-perfil-input"
          />

          <label htmlFor="nueva" className="edit-perfil-label">Nueva Contraseña:</label>
          <input
            id="nueva"
            type="password"
            name="nueva"
            value={passwordData.nueva}
            onChange={handlePasswordChange}
            placeholder="Nueva contraseña"
            className="edit-perfil-input"
          />

          <label htmlFor="confirmar" className="edit-perfil-label">Confirmar Nueva Contraseña:</label>
          <input
            id="confirmar"
            type="password"
            name="confirmar"
            value={passwordData.confirmar}
            onChange={handlePasswordChange}
            placeholder="Confirmar nueva contraseña"
            className="edit-perfil-input"
          />

          <button onClick={handleChangePassword} className="edit-perfil-button">
            Actualizar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;
