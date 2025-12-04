// src/pages/Web/Admin/ProductosAdmin.tsx
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import {
  fetchProductos,
  createProducto,
  deleteProducto,
  updateProducto,
  fetchCategorias,
} from "../../../services/apiWeb";
import { FaTrash, FaTimes, FaCheck, FaEdit, FaPlus } from "react-icons/fa";
import { AxiosError } from "axios";
import "./Admin.css";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: number;
  categoriaNombre?: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface ErrorResponse {
  message?: string;
}

const ProductosAdmin: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  const [nuevo, setNuevo] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoriaId: 0,
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoriaId: 0,
  });

  // ================= CARGAR PRODUCTOS =================
  const loadProductos = useCallback(async () => {
    setLoading(true);
    try {
      const prods: Producto[] = await fetchProductos();
      const cats: Categoria[] = await fetchCategorias();
      setCategorias(cats);

      const prodsConCategoria = prods.map((p) => ({
        ...p,
        categoriaNombre:
          cats.find((c) => c.id === p.categoriaId)?.nombre || "Sin categoría",
      }));
      setProductos(prodsConCategoria);
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  // ================= CREAR PRODUCTO =================
  const handleCreate = async () => {
    if (
      !nuevo.nombre.trim() ||
      !nuevo.descripcion.trim() ||
      nuevo.precio <= 0 ||
      nuevo.stock < 0 ||
      nuevo.categoriaId === 0 // categoría obligatoria
    ) {
      alert("Completa todos los campos correctamente y selecciona una categoría.");
      return;
    }

    try {
      const dataToSend = {
        nombre: nuevo.nombre.trim(),
        descripcion: nuevo.descripcion.trim(),
        precio: Number(nuevo.precio),
        stock: Number(nuevo.stock),
        categoriaId: nuevo.categoriaId, // obligatorio
      };

      await createProducto(dataToSend);

      // limpiar formulario
      setNuevo({ nombre: "", descripcion: "", precio: 0, stock: 0, categoriaId: 0 });
      await loadProductos(); // refrescar productos desde backend
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      console.error("Error al crear producto:", axiosError.response?.data || axiosError);
      alert(
        "No se pudo crear el producto: " +
          (axiosError.response?.data?.message || "Error desconocido")
      );
    }
  };

  // ================= EDICIÓN =================
  const handleEditStart = (p: Producto) => {
    setEditId(p.id);
    setEditData({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      stock: p.stock,
      categoriaId: p.categoriaId, // obligatorio
    });
  };

  const handleUpdate = async () => {
    if (editId === null) return;

    if (
      !editData.nombre.trim() ||
      !editData.descripcion.trim() ||
      editData.precio <= 0 ||
      editData.stock < 0 ||
      editData.categoriaId === 0
    ) {
      alert("Completa todos los campos correctamente y selecciona una categoría.");
      return;
    }

    try {
      const dataToSend = {
        nombre: editData.nombre.trim(),
        descripcion: editData.descripcion.trim(),
        precio: Number(editData.precio),
        stock: Number(editData.stock),
        categoriaId: editData.categoriaId,
      };

      await updateProducto(editId.toString(), dataToSend);

      await loadProductos(); // refresca productos con categoría actualizada
      setEditId(null);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      console.error("Error al actualizar producto:", axiosError.response?.data || axiosError);
      alert(
        "No se pudo actualizar: " +
          (axiosError.response?.data?.message || "Error desconocido")
      );
    }
  };

  // ================= ELIMINAR =================
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await deleteProducto(id.toString());
      await loadProductos();
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      console.error("Error al eliminar producto:", axiosError.response?.data || axiosError);
      alert(
        "No se pudo eliminar: " +
          (axiosError.response?.data?.message || "Error desconocido")
      );
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Navbar />

        <div className="header-container">
          <h1>Productos</h1>
          <p className="intro">Administra productos y categorías.</p>
        </div>

        {loading && <p>Cargando...</p>}

        {/* FORMULARIO NUEVO PRODUCTO */}
        <div className="admin-form">
          <h3>Nuevo producto</h3>

          <label htmlFor="nuevo-nombre">Nombre</label>
          <input
            id="nuevo-nombre"
            type="text"
            placeholder="Nombre del producto"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          />

          <label htmlFor="nuevo-descripcion">Descripción</label>
          <input
            id="nuevo-descripcion"
            type="text"
            placeholder="Descripción del producto"
            value={nuevo.descripcion}
            onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
          />

          <label htmlFor="nuevo-precio">Precio</label>
          <input
            id="nuevo-precio"
            type="number"
            placeholder="Precio"
            value={nuevo.precio}
            onChange={(e) => setNuevo({ ...nuevo, precio: Number(e.target.value) })}
          />

          <label htmlFor="nuevo-stock">Stock</label>
          <input
            id="nuevo-stock"
            type="number"
            placeholder="Stock"
            value={nuevo.stock}
            onChange={(e) => setNuevo({ ...nuevo, stock: Number(e.target.value) })}
          />

          <label htmlFor="nuevo-categoria">Categoría</label>
          <select
            id="nuevo-categoria"
            value={nuevo.categoriaId}
            onChange={(e) => setNuevo({ ...nuevo, categoriaId: Number(e.target.value) })}
          >
            <option value={0}>Seleccionar categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <button
            className="admin-button"
            onClick={handleCreate}
            aria-label="Crear producto"
            title="Crear producto"
          >
            <FaPlus />
          </button>
        </div>

        {/* TABLA PRODUCTOS */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length ? (
                productos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>

                    <td>
                      {editId === p.id ? (
                        <input
                          type="text"
                          value={editData.nombre}
                          aria-label="Nombre del producto"
                          onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                        />
                      ) : (
                        p.nombre
                      )}
                    </td>

                    <td>
                      {editId === p.id ? (
                        <input
                          type="text"
                          value={editData.descripcion}
                          aria-label="Descripción del producto"
                          onChange={(e) =>
                            setEditData({ ...editData, descripcion: e.target.value })
                          }
                        />
                      ) : (
                        p.descripcion
                      )}
                    </td>

                    <td>
                      {editId === p.id ? (
                        <input
                          type="number"
                          value={editData.precio}
                          aria-label="Precio del producto"
                          onChange={(e) =>
                            setEditData({ ...editData, precio: Number(e.target.value) })
                          }
                        />
                      ) : (
                        `$${p.precio}`
                      )}
                    </td>

                    <td>
                      {editId === p.id ? (
                        <input
                          type="number"
                          value={editData.stock}
                          aria-label="Stock del producto"
                          onChange={(e) =>
                            setEditData({ ...editData, stock: Number(e.target.value) })
                          }
                        />
                      ) : (
                        p.stock
                      )}
                    </td>

                    <td>
                      {editId === p.id ? (
                        <select
                          value={editData.categoriaId}
                          aria-label="Categoría del producto"
                          onChange={(e) =>
                            setEditData({ ...editData, categoriaId: Number(e.target.value) })
                          }
                        >
                          <option value={0}>Seleccionar categoría</option>
                          {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        p.categoriaNombre
                      )}
                    </td>

                    <td className="actions-cell">
                      {editId === p.id ? (
                        <>
                          <button
                            className="admin-button"
                            onClick={handleUpdate}
                            aria-label="Guardar cambios"
                            title="Guardar cambios"
                          >
                            <FaCheck />
                          </button>
                          <button
                            className="admin-button red"
                            onClick={() => setEditId(null)}
                            aria-label="Cancelar edición"
                            title="Cancelar edición"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="admin-button"
                            onClick={() => handleEditStart(p)}
                            aria-label="Editar producto"
                            title="Editar producto"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="admin-button red"
                            onClick={() => handleDelete(p.id)}
                            aria-label="Eliminar producto"
                            title="Eliminar producto"
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
                  <td colSpan={7}>No hay productos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductosAdmin;
