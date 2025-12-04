import React, { useEffect, useState, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaDownload } from "react-icons/fa";

import SidebarSupervisor from "../../../components/SidebarSupervisor";
import Navbar from "../../../components/Navbar";
import { fetchStockBajo, fetchVentas } from "../../../services/apiWeb";
import { AuthContext } from "../../../context/AuthContext";

import "./Supervisor.css";

interface Venta {
  id: number;
  productoNombre: string;
  cantidad: number;
  fecha: string;
}

interface VentasPorProducto {
  producto: string;
  total: number;
}

const DashboardSupervisor: React.FC = () => {
  const { token, user } = useContext(AuthContext);

  const [stockBajo, setStockBajo] = useState<number>(0);
  const [ventasHoy, setVentasHoy] = useState<number>(0);
  const [ventas, setVentas] = useState<VentasPorProducto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setError("No estás autenticado.");
      setLoading(false);
      return;
    }

    if (!user || !["supervisor", "admin"].includes(user.rol)) {
      setError("No tienes permisos para acceder a este dashboard.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        // Traemos stock bajo
        const stockData = await fetchStockBajo();

        // Traemos todas las ventas y filtramos por fecha de hoy
        const allVentas: Venta[] = await fetchVentas();
        const today = new Date().toISOString().split("T")[0];

        const ventasHoyData = allVentas.filter(
          (v) => v.fecha.split("T")[0] === today
        );

        // Agrupar ventas por producto
        const ventasGrouped: VentasPorProducto[] = [];
        ventasHoyData.forEach((v) => {
          const index = ventasGrouped.findIndex(
            (item) => item.producto === v.productoNombre
          );
          if (index === -1) {
            ventasGrouped.push({
              producto: v.productoNombre || "Producto sin nombre",
              total: v.cantidad || 0,
            });
          } else {
            ventasGrouped[index].total += v.cantidad || 0;
          }
        });

        if (!isMounted) return;

        setStockBajo(Array.isArray(stockData) ? stockData.length : 0);
        setVentasHoy(ventasGrouped.reduce((sum, item) => sum + item.total, 0));
        setVentas(ventasGrouped);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("Error cargando los datos del dashboard.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const generarReporte = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte Diario - Dashboard Supervisor", 14, 22);

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Productos con stock bajo: ${stockBajo}`, 14, 40);
    doc.text(`Ventas hoy: ${ventasHoy}`, 14, 48);

    if (ventas.length > 0) {
      const tableColumn = ["Producto", "Cantidad vendida"];
      const tableRows: (string | number)[][] = ventas.map((v) => [
        v.producto,
        v.total,
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
      });
    } else {
      doc.text("No hay ventas registradas hoy.", 14, 60);
    }

    doc.save(`Reporte_Dashboard_${new Date().toLocaleDateString()}.pdf`);
  };

  if (loading) return <p>Cargando dashboard...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className="supervisor-container">
      <SidebarSupervisor />
      <div className="supervisor-main">
        <Navbar />

        <div className="header-container">
          <h1>👋 Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}</h1>
          <p className="intro">Resumen de inventario y ventas del día.</p>
        </div>

        <div className="button-group">
          <button
            className="supervisor-button"
            title="Generar Reporte PDF"
            onClick={generarReporte}
          >
            <FaDownload />
          </button>
        </div>

        <div className="card-grid">
          <div className="card">
            <h3>Productos con stock bajo</h3>
            <p>{stockBajo}</p>
          </div>
          <div className="card">
            <h3>Ventas hoy</h3>
            <p>{ventasHoy}</p>
          </div>
        </div>

        {/* Gráfico de ventas */}
        <div className="card card-ventas">
          <h3>Ventas del día por producto</h3>

          {ventas.length > 0 ? (
            <div className="card-ventas-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ventas}
                  margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="producto"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value} unidades`, "Cantidad"]}
                  />
                  <Bar
                    dataKey="total"
                    fill="#4caf50"
                    barSize={40}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>No hay ventas registradas hoy.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSupervisor;
