// src/pages/Web/Cajero/Caja.tsx
import React, { useEffect, useState, useContext } from "react";
import SidebarCajero from "../../../components/SidebarCajero";
import {
  fetchProductos,
  registrarMovimientoInventario,
  registrarVenta,
} from "../../../services/apiWeb";
import { AuthContext, AuthContextType } from "../../../context/AuthContext";
import "./Cajero.css";

// ================= TIPOS =================
interface ProductoAPI {
  id: number;
  nombre: string;
  precio: number | string;
  stock?: number;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

interface ProductoCarrito {
  producto: Producto;
  cantidad: number;
}

// ================= COMPONENTE =================

const Caja: React.FC = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);

  // Cargar productos
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data: ProductoAPI[] = await fetchProductos();

        const productosConvertidos: Producto[] = data.map((p) => ({
          ...p,
          stock: p.stock ?? 10,
          precio: Number(p.precio),
        }));

        setProductos(productosConvertidos);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };

    cargarProductos();
  }, []);

  // Agregar al carrito
  const agregarAlCarrito = (producto: Producto, cantidad: number) => {
    if (producto.stock < cantidad) {
      alert("No hay suficiente stock disponible.");
      return;
    }

    const existe = carrito.find((c) => c.producto.id === producto.id);

    if (existe) {
      setCarrito(
        carrito.map((c) =>
          c.producto.id === producto.id
            ? { ...c, cantidad: c.cantidad + cantidad }
            : c
        )
      );
    } else {
      setCarrito([...carrito, { producto, cantidad }]);
    }

    // actualizar stock local
    setProductos(
      productos.map((p) =>
        p.id === producto.id ? { ...p, stock: p.stock - cantidad } : p
      )
    );
  };

  // Eliminar del carrito
  const descartarProducto = (productoId: number) => {
    const item = carrito.find((c) => c.producto.id === productoId);
    if (!item) return;

    // Devolver stock
    setProductos(
      productos.map((p) =>
        p.id === productoId ? { ...p, stock: p.stock + item.cantidad } : p
      )
    );

    setCarrito(carrito.filter((c) => c.producto.id !== productoId));
  };

  // Total
  const total = carrito.reduce(
    (acc, c) => acc + c.producto.precio * c.cantidad,
    0
  );

  // Cobrar venta
  const cobrar = async () => {
    if (!user) {
      alert("No se encontró usuario autenticado.");
      return;
    }

    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    try {
      // Registrar movimiento de inventario
      for (const item of carrito) {
        const movimiento = {
          producto_id: item.producto.id,
          cambio: -item.cantidad,
          motivo: "venta",
          usuario_id: user.id,
        };

        const res = await registrarMovimientoInventario(movimiento);

        if (!res.success) {
          alert(`Error con ${item.producto.nombre}: ${res.message}`);
          return;
        }
      }

      // Registrar venta
      const ventaPayload = {
        usuario_id: user.id,
        total,
        detalles: carrito.map((c) => ({
          producto_id: c.producto.id,
          cantidad: c.cantidad,
          precio: c.producto.precio,
          subtotal: c.producto.precio * c.cantidad,
        })),
      };

      const resVenta = await registrarVenta(ventaPayload);

      if (!resVenta.success) {
        alert(`Error al registrar la venta: ${resVenta.message}`);
        return;
      }

      alert(`Venta realizada por $${total.toFixed(2)}`);

      // Reiniciar carrito
      setCarrito([]);

      // Recargar productos
      const data: ProductoAPI[] = await fetchProductos();
      setProductos(
        data.map((p) => ({
          ...p,
          stock: p.stock ?? 10,
          precio: Number(p.precio),
        }))
      );
    } catch (error) {
      console.error("Error al procesar venta:", error);
    }
  };

  return (
    <div className="cajero-container-general">
      <SidebarCajero />

      <main className="cajero-main">
        <div className="cajero-header">
          <h1>Ventana de Caja</h1>
          <p className="intro">
            Selecciona productos disponibles, agrégalos al carrito y realiza el cobro.
          </p>
        </div>

        {/* Carrito */}
        <div className="carrito">
          <h2>Carrito</h2>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {carrito.map((item) => (
                  <tr key={item.producto.id}>
                    <td>{item.producto.nombre}</td>
                    <td>${item.producto.precio.toFixed(2)}</td>
                    <td>{item.cantidad}</td>
                    <td>${(item.producto.precio * item.cantidad).toFixed(2)}</td>
                    <td>
                      <button onClick={() => descartarProducto(item.producto.id)}>
                        Descartar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="carrito-total">Total: ${total.toFixed(2)}</div>
          <button onClick={cobrar} disabled={carrito.length === 0}>
            Cobrar
          </button>
        </div>

        {/* Productos */}
        <div className="productos-list">
          <h2>Productos Disponibles</h2>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((prod) => (
                  <tr key={prod.id}>
                    <td>{prod.nombre}</td>
                    <td>${prod.precio.toFixed(2)}</td>
                    <td>{prod.stock}</td>
                    <td>
                      <button
                        disabled={prod.stock <= 0}
                        onClick={() => {
                          const cantidadStr = prompt(
                            `¿Cuántas unidades deseas agregar de ${prod.nombre}? Stock: ${prod.stock}`
                          );
                          const cantidad = Number(cantidadStr);

                          if (!cantidad || cantidad <= 0) return;

                          agregarAlCarrito(prod, cantidad);
                        }}
                      >
                        Agregar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Caja;
