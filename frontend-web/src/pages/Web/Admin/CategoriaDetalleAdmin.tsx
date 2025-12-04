// src/pages/Web/Admin/CategoriaDetalleAdmin.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import { fetchCategoriaById, updateCategoria } from "../../../services/apiWeb";
import "./Admin.css";

interface Categoria {
  nombre: string;
  descripcion: string;
}

const CategoriaDetalleAdmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<Categoria>({ nombre: "", descripcion: "" });

  // Cargar categoría al iniciar
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const data: Categoria = await fetchCategoriaById(id);
      setCategoria(data);
    };
    fetchData();
  }, [id]); // solo depende de `id`

  const handleUpdateCategoria = async () => {
    if (!id) return;
    await updateCategoria(id, categoria);
    alert("Categoría actualizada correctamente");
    navigate("/admin/categorias");
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Navbar />
        <h1>Editar Categoría</h1>

        <div className="admin-form">
          <label htmlFor="nombre" className="admin-label">Nombre:</label>
          <input
            id="nombre"
            type="text"
            placeholder="Nombre de la categoría"
            value={categoria.nombre}
            onChange={(e) => setCategoria({ ...categoria, nombre: e.target.value })}
            className="admin-input"
          />

          <label htmlFor="descripcion" className="admin-label">Descripción:</label>
          <textarea
            id="descripcion"
            placeholder="Descripción de la categoría"
            value={categoria.descripcion}
            onChange={(e) => setCategoria({ ...categoria, descripcion: e.target.value })}
            className="admin-textarea"
          />

          <button onClick={handleUpdateCategoria} className="admin-button">
            Guardar Categoría
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriaDetalleAdmin;
