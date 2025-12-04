import React, { useEffect, useState } from "react";
import SidebarSupervisor from "../../../components/SidebarSupervisor";
import { fetchVentas } from "../../../services/apiWeb";
import "./Supervisor.css";

interface Venta {
  id: number;
  producto: string;
  cantidad: number;
  total: number;
  fecha: string;
}

const Ventas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getVentas = async () => {
      try {
        const data = await fetchVentas();
        // Asegurarnos de que siempre sea un arreglo
        setVentas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las ventas");
      } finally {
        setLoading(false);
      }
    };

    getVentas();
  }, []);

  if (loading) return <p>Cargando ventas...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="supervisor-main">
      <SidebarSupervisor />

      <div className="ventas-container">
        {/* HEADER CON TEXTO */}
        <div className="header-container">
          <h1>Ventas Supervisor</h1>
          <p className="intro">
            En esta sección podrás consultar las ventas realizadas, revisar estadísticas y analizar el desempeño por producto o por periodo.
          </p>
        </div>

        {/* TABLA DE VENTAS */}
        <div className="table-container">
          <table className="inventario-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id}>
                  <td>{venta.id}</td>
                  <td>{venta.producto}</td>
                  <td>{venta.cantidad}</td>
                  <td>${venta.total}</td>
                  <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                </tr>
              ))}
              {ventas.length === 0 && (
  <tr>
    <td colSpan={5} className="text-center">
      No hay ventas registradas
    </td>
  </tr>
)}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ventas;
