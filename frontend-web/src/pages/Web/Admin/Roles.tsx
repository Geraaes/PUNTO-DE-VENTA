// src/pages/Web/Admin/Roles.tsx
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import { fetchRoles, createRol, updateRol, deleteRol } from "../../../services/apiWeb";
import { FaTrash, FaTimes, FaCheck, FaEdit, FaPlus } from "react-icons/fa";
import "./Admin.css";

interface Rol {
  id: number;
  nombre: string;
}

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [nuevoRol, setNuevoRol] = useState<{ nombre: string }>({ nombre: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{ nombre: string }>({ nombre: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= CARGAR ROLES =================
  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data: Rol[] = await fetchRoles();
      setRoles(data);
      setErrorMsg("");
    } catch (error) {
      console.error(error);
      setErrorMsg("No se pudieron cargar los roles.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // ================= CREAR =================
  const handleCreate = async () => {
    if (!nuevoRol.nombre) {
      setErrorMsg("El nombre del rol es obligatorio.");
      return;
    }
    try {
      await createRol(nuevoRol);
      setNuevoRol({ nombre: "" });
      setSuccessMsg("Rol creado correctamente.");
      loadRoles();
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al crear rol.");
    }
  };

  // ================= EDITAR =================
  const handleEdit = (rol: Rol) => {
    setEditingId(rol.id);
    setEditingData({ nombre: rol.nombre });
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    if (!editingData.nombre) {
      setErrorMsg("El nombre del rol es obligatorio.");
      return;
    }
    try {
      await updateRol(editingId, editingData);
      setEditingId(null);
      setEditingData({ nombre: "" });
      setSuccessMsg("Rol actualizado correctamente.");
      loadRoles();
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al actualizar rol.");
    }
  };

  // ================= ELIMINAR =================
  const handleDelete = async (id: number) => {
    if (!confirm("¿Deseas eliminar este rol permanentemente?")) return;
    try {
      await deleteRol(id);
      setSuccessMsg("Rol eliminado correctamente.");
      loadRoles();
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al eliminar rol.");
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Navbar />

        {/* Contenedor de header fijo */}
        <div className="header-container">
          <h1>Roles</h1>
          <p className="intro">
            En esta sección puedes crear, editar y eliminar roles. Mantén tu sistema organizado gestionando los distintos niveles de acceso de los usuarios.
          </p>
        </div>

        {/* Mensajes de estado */}
        {loading && <p>Cargando roles...</p>}
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        {successMsg && <p className="success-msg">{successMsg}</p>}

        {/* FORMULARIO CREACIÓN */}
        <div className="admin-form">
          <label htmlFor="nuevoRol">Nombre del rol:</label>
          <input
            className="admin-input"
            id="nuevoRol"
            type="text"
            value={nuevoRol.nombre}
            onChange={(e) => setNuevoRol({ nombre: e.target.value })}
            placeholder="Nombre del rol"
            title="Nombre del rol"
          />
          <button
            className="admin-button"
            onClick={handleCreate}
            aria-label="Agregar rol"
            title="Agregar rol"
          >
            <FaPlus />
          </button>
        </div>

        {/* TABLA DE ROLES */}
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
              {roles.length ? (
                roles.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      {editingId === r.id ? (
                        <input
                          value={editingData.nombre}
                          onChange={(e) =>
                            setEditingData({ nombre: e.target.value })
                          }
                          placeholder="Editar nombre"
                          title="Editar nombre"
                          className="admin-input"
                        />
                      ) : (
                        r.nombre
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingId === r.id ? (
                        <>
                          <button className="admin-button" onClick={handleUpdate} title="Guardar">
                            <FaCheck />
                          </button>
                          <button
                            className="admin-button red"
                            onClick={() => setEditingId(null)}
                            title="Cancelar"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="admin-button" onClick={() => handleEdit(r)} title="Editar">
                            <FaEdit />
                          </button>
                          <button className="admin-button red" onClick={() => handleDelete(r.id)} title="Eliminar">
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No hay roles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Roles;
