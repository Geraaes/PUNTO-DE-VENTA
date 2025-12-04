// src/pages/Web/Admin/Usuarios.tsx
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import {
  fetchUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../../../services/apiWeb";
import { FaTrash, FaTimes, FaCheck, FaEdit, FaPlus } from "react-icons/fa";
import "./Admin.css";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "supervisor" | "cajero";
}

interface UsuarioRaw {
  id: number;
  nombre: string | { nombre: string };
  email: string | { email: string };
  rol?: string | { rol: string };
  rol_id?: number;
}

interface NuevoUsuario {
  nombre: string;
  email: string;
  rol: "admin" | "supervisor" | "cajero";
  password: string;
}

interface EditingData {
  nombre: string;
  email: string;
  rol: Usuario["rol"];
  password: string;
}

const isAxiosError = (
  error: unknown
): error is { response?: { data?: { message?: string } } } =>
  typeof error === "object" && error !== null && "response" in error;

const rolMap: Record<Usuario["rol"], number> = {
  admin: 1,
  supervisor: 3,
  cajero: 2,
};

const rolMapReverse: Record<number, Usuario["rol"]> = {
  1: "admin",
  2: "cajero",
  3: "supervisor",
};

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoUsuario, setNuevoUsuario] = useState<NuevoUsuario>({
    nombre: "",
    email: "",
    rol: "admin",
    password: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<EditingData>({
    nombre: "",
    email: "",
    rol: "admin",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= CARGAR USUARIOS =================
  const loadUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const dataRaw = await fetchUsuarios();
      const data: Usuario[] = dataRaw.map((u: UsuarioRaw) => {
        let rol: Usuario["rol"] = "admin";

        if (typeof u.rol === "string") {
          rol = u.rol as Usuario["rol"];
        } else if (typeof u.rol === "object" && u.rol !== null && "rol" in u.rol) {
          rol = u.rol.rol as Usuario["rol"];
        } else if (typeof u.rol_id === "number") {
          rol = rolMapReverse[u.rol_id] ?? "admin";
        }

        return {
          id: u.id,
          nombre: typeof u.nombre === "object" ? u.nombre.nombre : u.nombre,
          email: typeof u.email === "object" ? u.email.email : u.email,
          rol,
        };
      });
      setUsuarios(data);
      setErrorMsg("");
    } catch (error) {
      console.error(error);
      setUsuarios([]);
      setErrorMsg(
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "No se pudieron cargar los usuarios."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  // ================= CREAR =================
  const handleCreate = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password)
      return setErrorMsg("Nombre, email y contraseña son obligatorios.");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoUsuario.email))
      return setErrorMsg("Email no válido.");

    if (nuevoUsuario.password.length < 6)
      return setErrorMsg("La contraseña debe tener al menos 6 caracteres.");

    try {
      const created = await createUsuario({
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
        rol_id: rolMap[nuevoUsuario.rol],
      });

      const rolCreado: Usuario["rol"] = rolMapReverse[created.rol_id] ?? nuevoUsuario.rol;

      const newUsuario: Usuario = {
        id: created.id,
        nombre: created.nombre,
        email: created.email,
        rol: rolCreado,
      };

      setUsuarios(prev => [...prev, newUsuario]);
      setNuevoUsuario({ nombre: "", email: "", rol: "admin", password: "" });
      setSuccessMsg("Usuario creado correctamente.");
    } catch (error) {
      console.error(error);
      setErrorMsg(
        isAxiosError(error) && error.response?.data?.message
          ? `Error: ${error.response.data.message}`
          : "Error al crear usuario."
      );
    }
  };

  // ================= EDITAR =================
  const handleEdit = (u: Usuario) => {
    setEditingId(u.id);
    setEditingData({ nombre: u.nombre, email: u.email, rol: u.rol, password: "" });
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    setErrorMsg("");
    setSuccessMsg("");

    if (!editingData.nombre || !editingData.email) {
      setErrorMsg("Nombre y email son obligatorios.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingData.email)) {
      setErrorMsg("Email no válido.");
      return;
    }

    try {
      const updatedRaw = await updateUsuario(editingId, {
        nombre: editingData.nombre,
        email: editingData.email,
        rol_id: rolMap[editingData.rol],
        ...(editingData.password ? { password: editingData.password } : {}),
      });

      const updatedRol: Usuario["rol"] =
        typeof updatedRaw.rol === "string"
          ? (updatedRaw.rol as Usuario["rol"])
          : updatedRaw.rol_id
          ? rolMapReverse[updatedRaw.rol_id]
          : editingData.rol;

      const updatedUsuario: Usuario = {
        id: updatedRaw.id,
        nombre: updatedRaw.nombre,
        email: updatedRaw.email,
        rol: updatedRol,
      };

      setUsuarios(prev =>
        prev.map(u => (u.id === editingId ? updatedUsuario : u))
      );

      setEditingId(null);
      setEditingData({ nombre: "", email: "", rol: "admin", password: "" });
      setSuccessMsg("Usuario actualizado correctamente.");
    } catch (error) {
      console.error(error);
      setErrorMsg(
        isAxiosError(error) && error.response?.data?.message
          ? `Error: ${error.response.data.message}`
          : "Error al actualizar usuario."
      );
    }
  };

  // ================= ELIMINAR =================
  const handleDelete = async (id: number) => {
    if (!confirm("¿Deseas eliminar este usuario permanentemente?")) return;
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await deleteUsuario(`hard/${id}`);
      setUsuarios(prev => prev.filter(u => u.id !== id));
      setSuccessMsg("Usuario eliminado correctamente.");
    } catch (error) {
      console.error(error);
      setErrorMsg(
        isAxiosError(error) && error.response?.data?.message
          ? `Error: ${error.response.data.message}`
          : "Error al eliminar usuario."
      );
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Navbar />

        <div className="header-container">
          <h1>Usuarios</h1>
          <p className="intro">
            Aquí puedes ver todos los usuarios, crear nuevos, editar sus datos o eliminarlos.
          </p>
        </div>

        {loading && <p>Cargando usuarios...</p>}
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        {successMsg && <p className="success-msg">{successMsg}</p>}

        {/* FORMULARIO DE CREACIÓN */}
        <div className="admin-form">
          <h3>Agregar usuario</h3>
          <label htmlFor="nombre">Nombre</label>
          <input
            className="admin-input"
            id="nombre"
            type="text"
            placeholder="Nombre"
            value={nuevoUsuario.nombre}
            onChange={e =>
              setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
            }
          />
          <label htmlFor="email">Email</label>
          <input
            className="admin-input"
            id="email"
            type="email"
            placeholder="Email"
            value={nuevoUsuario.email}
            onChange={e =>
              setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
            }
          />
          <label htmlFor="password">Contraseña</label>
          <input
            className="admin-input"
            id="password"
            type="password"
            placeholder="Contraseña"
            value={nuevoUsuario.password}
            onChange={e =>
              setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
            }
          />
          <label htmlFor="rol">Rol</label>
          <select
            className="admin-input"
            id="rol"
            value={nuevoUsuario.rol}
            onChange={e =>
              setNuevoUsuario({
                ...nuevoUsuario,
                rol: e.target.value as NuevoUsuario["rol"],
              })
            }
          >
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="cajero">Cajero</option>
          </select>
          <button
            className="admin-button"
            onClick={handleCreate}
            aria-label="Agregar usuario"
            title="Agregar"
          >
            <FaPlus />
          </button>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Contraseña</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length ? (
                usuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>
                      {editingId === u.id ? (
                        <input
                          className="admin-input"
                          aria-label="Editar nombre"
                          value={editingData.nombre}
                          onChange={e =>
                            setEditingData({ ...editingData, nombre: e.target.value })
                          }
                        />
                      ) : (
                        u.nombre
                      )}
                    </td>
                    <td>
                      {editingId === u.id ? (
                        <input
                          className="admin-input"
                          aria-label="Editar email"
                          value={editingData.email}
                          onChange={e =>
                            setEditingData({ ...editingData, email: e.target.value })
                          }
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td>
                      {editingId === u.id ? (
                        <select
                          className="admin-input"
                          aria-label="Editar rol"
                          value={editingData.rol}
                          onChange={e =>
                            setEditingData({
                              ...editingData,
                              rol: e.target.value as Usuario["rol"],
                            })
                          }
                        >
                          <option value="admin">Admin</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="cajero">Cajero</option>
                        </select>
                      ) : (
                        u.rol
                      )}
                    </td>
                    <td>
                      {editingId === u.id ? (
                        <input
                          className="admin-input"
                          type="password"
                          placeholder="Nueva contraseña (opcional)"
                          value={editingData.password}
                          onChange={e =>
                            setEditingData({ ...editingData, password: e.target.value })
                          }
                        />
                      ) : (
                        "******"
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingId === u.id ? (
                        <>
                          <button
                            className="admin-button"
                            onClick={handleUpdate}
                            aria-label="Guardar usuario"
                            title="Guardar"
                          >
                            <FaCheck />
                          </button>
                          <button
                            className="admin-button red"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancelar edición"
                            title="Cancelar"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="admin-button"
                            onClick={() => handleEdit(u)}
                            aria-label="Editar usuario"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="admin-button red"
                            onClick={() => handleDelete(u.id)}
                            aria-label="Eliminar usuario"
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No hay usuarios</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;
