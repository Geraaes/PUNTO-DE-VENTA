// src/pages/Web/Cajero/Ventas.tsx
import React, { useEffect, useState } from "react";
import { fetchVentas as apiFetchVentas } from "../../../services/apiWeb";
import SidebarCajero from "../../../components/SidebarCajero"; 
import Navbar from "../../../components/Navbar"; 
import "./Cajero.css";

// ===================== TIPOS ======================
interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

interface Detalle {
  id: number;
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

interface UsuarioVenta {
  id: number;
  nombre: string;
}

interface Venta {
  id: number;
  usuario: UsuarioVenta | null;
  fecha: string;
  total: number | string | null;
  detalles: Detalle[];
}

// ===================== COMPONENTE ======================
const Ventas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ===================== TOTAL DE VENTAS ======================
  const totalVentas = ventas.reduce(
    (acc, venta) => acc + Number(venta.total ?? 0),
    0
  );

  // ===================== CARGAR VENTAS ======================
  useEffect(() => {
    const cargarVentas = async () => {
      try {
        setError("");

        const data = await apiFetchVentas(fechaInicio, fechaFin);

        if (!data || !Array.isArray(data)) {
          setVentas([]);
          setError("La API no devolvió un arreglo.");
          return;
        }

        setVentas(data);
      } catch (err) {
        console.error("❌ Error al cargar ventas:", err);
        setError("No se pudieron cargar las ventas. Intenta de nuevo.");
        setVentas([]);
      }
    };

    cargarVentas();
  }, [fechaInicio, fechaFin]);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ===================== SIDEBAR ===================== */}
      <SidebarCajero />

      {/* ===================== CONTENIDO ===================== */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">

        {/* NAVBAR */}
        <Navbar />

        {/* CONTENIDO SCROLLEABLE */}
        <div className="p-6 overflow-y-auto h-full bg-gray-50 ventas-container">

          <h1 className="text-2xl font-bold mb-4">Reporte de Ventas</h1>

          {/* ===================== FILTROS ====================== */}
          <div className="ventas-filtros mb-4">
            <label>
              Fecha inicio:
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </label>

            <label>
              Fecha fin:
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </label>
          </div>

          {/* ===================== ERROR ====================== */}
          {error && <div className="error-message">{error}</div>}

          {/* ===================== TOTAL ====================== */}
          <div className="ventas-total mb-4">
            <strong>Total de ventas: </strong>${totalVentas.toFixed(2)}
          </div>

          {/* ===================== TABLA ====================== */}
          <div className="table-container bg-white p-4 rounded shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left font-semibold">
                  <th>ID Venta</th>
                  <th>Usuario</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Productos (cantidad)</th>
                </tr>
              </thead>

              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id} className="border-b">
                    <td>{venta.id}</td>

                    <td>{venta.usuario?.nombre ?? "Sin usuario"}</td>

                    <td>${Number(venta.total ?? 0).toFixed(2)}</td>

                    <td>
                      {venta.fecha
                        ? new Date(venta.fecha).toLocaleString()
                        : "Sin fecha"}
                    </td>

                    <td>{venta.detalles?.length ?? 0} productos</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Ventas;
