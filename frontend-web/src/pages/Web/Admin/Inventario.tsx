// src/pages/Web/Admin/Inventario.tsx
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { fetchProductos, updateProducto } from "../../../services/apiWeb"; // ✅ usar fetchProductos
import "./Admin.css";

// Tipado del inventario
interface InventarioItem {
  id: number;
  nombre: string;
  cantidad: number;
}

const Inventario: React.FC = () => {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{ cantidad: number }>({ cantidad: 0 });

  // ================= CARGAR INVENTARIO =================
  const loadInventario = useCallback(async () => {
    try {
      const response = await fetchProductos(); // devuelve TODOS los productos activos
      console.log("Response inventario raw:", response);

      if (!response || !Array.isArray(response)) {
        throw new Error("No se recibió data del inventario");
      }

      const data: InventarioItem[] = response.map((item: { id: number; nombre: string; stock: number }) => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.stock,
      }));

      setInventario(data);
    } catch (error) {
      console.error("Error cargando inventario:", error);
      alert("No se pudo cargar el inventario.");
    }
  }, []);

  useEffect(() => {
    loadInventario();
  }, [loadInventario]);

  // ================= EDITAR =================
  const handleEdit = (item: InventarioItem) => {
    setEditingId(item.id);
    setEditingData({ cantidad: item.cantidad });
  };

  const handleUpdate = async () => {
    if (editingId === null) return;

    try {
      await updateProducto(editingId, { stock: editingData.cantidad });
      setEditingId(null);
      setEditingData({ cantidad: 0 });
      await loadInventario(); // recarga inventario
    } catch (error) {
      console.error("Error actualizando cantidad:", error);
      alert("No se pudo actualizar la cantidad.");
    }
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Navbar />

        {/* Header */}
        <div className="header-container">
          <h1>Inventario</h1>
          <p className="intro">
            Visualiza y edita las cantidades de los productos en inventario.
            Mantén actualizado el stock de cada artículo registrado.
          </p>
        </div>

        {/* Tabla */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventario.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={4}>No hay productos en inventario</td>
                </tr>
              ) : (
                inventario.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.nombre}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          aria-label={`Stock de ${item.nombre}`}
                          value={editingData.cantidad}
                          onChange={(e) =>
                            setEditingData({ cantidad: parseInt(e.target.value) || 0 })
                          }
                          className="admin-input-small"
                        />
                      ) : (
                        item.cantidad
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingId === item.id ? (
                        <>
                          <button
                            className="admin-button"
                            onClick={handleUpdate}
                            aria-label="Guardar cambios"
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
                        <button
                          className="admin-button"
                          onClick={() => handleEdit(item)}
                          aria-label={`Editar stock de ${item.nombre}`}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventario;
