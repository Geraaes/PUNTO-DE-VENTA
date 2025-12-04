import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../../services/apiWeb";
import SidebarSupervisor from "../../../components/SidebarSupervisor";
import "./Supervisor.css";

interface Producto {
  id: number;
  nombre: string;
  stock: number;
}

const Inventario: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await api.get<Producto[]>("/inventario");
        setProductos(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Error al cargar productos");
        } else {
          setError("Error al cargar productos");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) return <p>Cargando inventario...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="supervisor-main">
      <SidebarSupervisor />
      <div className="inventario-container">
        {/* HEADER CON TEXTO */}
        <div className="header-container">
          <h1>Inventario Supervisor</h1>
          <p className="intro">
            En esta sección puedes revisar el inventario de productos, verificar el stock disponible y detectar productos con bajo inventario.
          </p>
        </div>

        <div className="table-container">
          <table className="inventario-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.id}</td>
                  <td>{producto.nombre}</td>
                  <td className={producto.stock <= 10 ? "stock-bajo" : undefined}>
                    {producto.stock}
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

export default Inventario;
