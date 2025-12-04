// src/pages/Web/Admin/Categorias.tsx
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";

import {
  fetchCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../../../services/apiWeb";

import { FaTrash, FaTimes, FaCheck, FaEdit, FaPlus } from "react-icons/fa";
import "./Admin.css";

interface Categoria {
  id: number;
  nombre: string;
}

const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState<{ nombre: string }>({ nombre: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{ nombre: string }>({ nombre: "" });

  // ================= CARGAR CATEGORIAS =================
  const loadCategorias = useCallback(async () => {
    try {
      const data: Categoria[] = await fetchCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías", error);
    }
  }, []);

  useEffect(() => {
    // Evitar setState directo en useEffect
    const fetchData = async () => {
      await loadCategorias();
    };
    fetchData();
  }, [loadCategorias]);

  // ================= CREAR CATEGORIA =================
  const handleCreate = async () => {
    if (!nuevaCategoria.nombre.trim()) return;

    try {
      await createCategoria(nuevaCategoria);
      setNuevaCategoria({ nombre: "" });
      await loadCategorias();
    } catch (error) {
      console.error("Error creando categoría", error);
      alert("No se pudo crear la categoría.");
    }
  };

  // ================= EDITAR =================
  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.id);
    setEditingData({ nombre: categoria.nombre });
  };

  const handleUpdate = async () => {
    if (editingId === null || !editingData.nombre.trim()) return;

    try {
      await updateCategoria(editingId, editingData);
      setEditingId(null);
      setEditingData({ nombre: "" });
      await loadCategorias();
    } catch (error) {
      console.error("Error actualizando categoría", error);
      alert("No se pudo actualizar la categoría.");
    }
  };

  // ================= ELIMINAR =================
  const handleDelete = async (id: number) => {
    if (!confirm("¿Deseas eliminar esta categoría?")) return;

    try {
      await deleteCategoria(id);
      await loadCategorias();
    } catch (error) {
      console.error("Error eliminando categoría", error);
      alert("No se pudo eliminar la categoría.");
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Navbar />

        {/* Header */}
        <div className="header-container">
          <h1>Categorías</h1>
          <p className="intro">
            Gestiona las categorías de tus productos: crear, editar y eliminar.
          </p>
        </div>

        {/* Formulario nueva categoría */}
        <div className="admin-form">
          <label htmlFor="nuevaCategoria" className="admin-label">
            Agregar categoría:
          </label>
          <input
            id="nuevaCategoria"
            type="text"
            placeholder="Nombre"
            aria-label="Nombre de la nueva categoría"
            value={nuevaCategoria.nombre}
            onChange={(e) => setNuevaCategoria({ nombre: e.target.value })}
            className="admin-input"
          />
          <button
            onClick={handleCreate}
            className="admin-button"
            title="Crear categoría"
            aria-label="Crear categoría"
          >
            <FaPlus />
          </button>
        </div>

        {/* Tabla de categorías */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    {editingId === c.id ? (
                      <input
                        id={`edit-${c.id}`}
                        value={editingData.nombre}
                        placeholder="Nombre de categoría"
                        aria-label="Editar nombre de categoría"
                        className="admin-input"
                        onChange={(e) =>
                          setEditingData({ nombre: e.target.value })
                        }
                      />
                    ) : (
                      c.nombre
                    )}
                  </td>
                  <td className="actions-cell">
                    {editingId === c.id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          className="admin-button"
                          title="Confirmar edición"
                          aria-label="Confirmar edición"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="admin-button red"
                          title="Cancelar edición"
                          aria-label="Cancelar edición"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(c)}
                          className="admin-button"
                          title="Editar categoría"
                          aria-label="Editar categoría"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="admin-button red"
                          title="Eliminar categoría"
                          aria-label="Eliminar categoría"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categorias;
