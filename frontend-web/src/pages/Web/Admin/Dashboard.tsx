// src/pages/Web/Admin/Dashboard.tsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaDownload } from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";

import {
  fetchUsuarios,
  fetchProductos,
  fetchCategorias,
  fetchRoles,
  fetchProductos as fetchInventario, // para inventario usamos fetchProductos
  fetchVentas,
} from "../../../services/apiWeb";

import "./Admin.css";

interface DashboardStats {
  usuarios: number;
  productos: number;
  categorias: number;
  roles: number;
  inventario_total: number;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

interface Venta {
  id: number;
  producto: string;
  cantidad: number;
  total: number;
}

interface VentasPorProducto {
  producto: string;
  total: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    usuarios: 0,
    productos: 0,
    categorias: 0,
    roles: 0,
    inventario_total: 0,
  });

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const userName = "Admin";

  // ================= CARGAR ESTADÍSTICAS =================
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const [usuarios, productos, categorias, roles, inventario] =
          await Promise.all([
            fetchUsuarios(),
            fetchProductos(),
            fetchCategorias(),
            fetchRoles(),
            fetchInventario(), // TODOS los productos activos
          ]);

        const inventarioTotal = Array.isArray(inventario)
          ? inventario.reduce((sum, item: Producto) => sum + (item.stock ?? 0), 0)
          : 0;

        setStats({
          usuarios: Array.isArray(usuarios) ? usuarios.length : 0,
          productos: Array.isArray(productos) ? productos.length : 0,
          categorias: Array.isArray(categorias) ? categorias.length : 0,
          roles: Array.isArray(roles) ? roles.length : 0,
          inventario_total: inventarioTotal,
        });
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        setErrorMsg("No se pudieron cargar las estadísticas del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // ================= CARGAR VENTAS =================
  useEffect(() => {
    const loadVentas = async () => {
      try {
        const res = await fetchVentas(); // devuelve array de ventas
        setVentas(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error("Error al cargar ventas:", error);
        setVentas([]);
      }
    };
    loadVentas();
  }, []);

  // ================= PREPARAR DATOS PARA GRÁFICO =================
  const ventasPorProducto: VentasPorProducto[] = [];
  ventas.forEach((v) => {
    const index = ventasPorProducto.findIndex((item) => item.producto === v.producto);
    if (index === -1) {
      ventasPorProducto.push({ producto: v.producto, total: v.total });
    } else {
      ventasPorProducto[index].total += v.total;
    }
  });

  // ================= GENERAR PDF =================
  const handleDownloadPDF = async () => {
    try {
      const usuarios = await fetchUsuarios();
      const productos = await fetchProductos();
      const inventario = await fetchInventario();
      const ventasRes = await fetchVentas();
      const ventasPDF = Array.isArray(ventasRes) ? ventasRes : [];

      const doc = new jsPDF();

      doc.text("Usuarios", 14, 14);
      autoTable(doc, {
        startY: 20,
        head: [["ID", "Nombre", "Email"]],
        body: usuarios.map((u: Usuario) => [u.id, u.nombre, u.email]),
      });

      doc.text("Productos", 14, (doc.lastAutoTable?.finalY ?? 20) + 10);
      autoTable(doc, {
        startY: (doc.lastAutoTable?.finalY ?? 20) + 14,
        head: [["ID", "Nombre", "Precio"]],
        body: productos.map((p: Producto) => [p.id, p.nombre, p.precio]),
      });

      doc.text("Inventario", 14, (doc.lastAutoTable?.finalY ?? 20) + 10);
      autoTable(doc, {
        startY: (doc.lastAutoTable?.finalY ?? 20) + 14,
        head: [["Producto", "Cantidad"]],
        body: inventario.map((i: Producto) => [i.nombre, i.stock]),
      });

      doc.text("Ventas", 14, (doc.lastAutoTable?.finalY ?? 20) + 10);
      autoTable(doc, {
        startY: (doc.lastAutoTable?.finalY ?? 20) + 14,
        head: [["ID", "Producto", "Cantidad", "Total"]],
        body: ventasPDF.map((v: Venta) => [v.id, v.producto, v.cantidad, v.total]),
      });

      doc.save("reporte_sistema.pdf");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("No se pudo generar el PDF.");
    }
  };

  if (loading) return <p>Cargando dashboard...</p>;
  if (errorMsg) return <p className="error-msg">{errorMsg}</p>;

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Navbar />

        <div className="header-container">
          <h1 className="page-title">👋 ¡Bienvenido{userName ? `, ${userName}` : ""}!</h1>
          <p className="intro">Aquí puedes ver un resumen del sistema.</p>
        </div>

        {/* CARDS */}
        <div className="card-grid">
          <div className="card"><h3>Usuarios</h3><p>{stats.usuarios}</p></div>
          <div className="card"><h3>Productos</h3><p>{stats.productos}</p></div>
          <div className="card"><h3>Categorías</h3><p>{stats.categorias}</p></div>
          <div className="card"><h3>Roles</h3><p>{stats.roles}</p></div>
          <div className="card"><h3>Inventario Total</h3><p>{stats.inventario_total}</p></div>
        </div>

    {/* VENTAS - GRÁFICO */}
<div className="card card-ventas">
  <h3>Ventas por Producto</h3>

  <div style={{ width: "100%", height: "350px" }}>
    <ResponsiveContainer>
      <BarChart
        data={ventasPorProducto}
        margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="producto" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="total" fill="#4caf50" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>


        {/* REPORTE PDF */}
        <div className="card card-reporte">
          <h3>Generar Reporte</h3>
          <p className="intro">Este botón genera un reporte completo del sistema.</p>
          <button className="admin-button" onClick={handleDownloadPDF}>
            <span className="sr-only">Generar reporte PDF</span>
            <FaDownload />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
