// app/(drawer)/CajaScreen.tsx
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { AuthContext } from "../../src/context/AuthContext";
import { fetchProductos, registrarMovimientoInventario, registrarVenta } from "../../src/api/api";

interface ProductoAPI {
  id: number;
  nombre: string;
  precio: string | number;
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

interface User {
  id: number;
  nombre?: string;
  email?: string;
  rol_nombre?: string;
}

export default function CajaScreen() {
  const { user } = useContext(AuthContext) as { user: User | null };
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState("1");

  // Cargar productos
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data: ProductoAPI[] = await fetchProductos();
        setProductos(
          data.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            precio: Number(p.precio),
            stock: p.stock ?? 10,
          }))
        );
      } catch (err) {
        console.error("Error al cargar productos:", err);
      }
    };
    cargarProductos();
  }, []);

  const abrirModal = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setCantidad("1");
    setModalVisible(true);
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado) return;

    const cant = Number(cantidad);
    if (!cant || cant <= 0) return Alert.alert("Cantidad inválida");
    if (productoSeleccionado.stock < cant) return Alert.alert("Stock insuficiente");

    setCarrito((prev) => {
      const existe = prev.find((c) => c.producto.id === productoSeleccionado.id);
      if (existe) {
        return prev.map((c) =>
          c.producto.id === productoSeleccionado.id ? { ...c, cantidad: c.cantidad + cant } : c
        );
      } else {
        return [...prev, { producto: productoSeleccionado, cantidad: cant }];
      }
    });

    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoSeleccionado.id ? { ...p, stock: p.stock - cant } : p
      )
    );

    setModalVisible(false);
  };

  const descartarProducto = (productoId: number) => {
    const item = carrito.find((c) => c.producto.id === productoId);
    if (!item) return;

    setProductos((prev) =>
      prev.map((p) => (p.id === productoId ? { ...p, stock: p.stock + item.cantidad } : p))
    );

    setCarrito((prev) => prev.filter((c) => c.producto.id !== productoId));
  };

  const total = carrito.reduce((acc, c) => acc + c.producto.precio * c.cantidad, 0);

  const cobrar = async () => {
    if (!user) return Alert.alert("Usuario no encontrado");
    if (carrito.length === 0) return Alert.alert("Carrito vacío");

    try {
      for (const item of carrito) {
        const res = await registrarMovimientoInventario({
          producto_id: item.producto.id,
          cambio: -item.cantidad,
          motivo: "venta",
          usuario_id: user.id,
        });
        if (!res.success)
          return Alert.alert(`Error con ${item.producto.nombre}: ${String(res.message)}`);
      }

      const resVenta = await registrarVenta({
        usuario_id: user.id,
        total,
        detalles: carrito.map((c) => ({
          producto_id: c.producto.id,
          cantidad: c.cantidad,
          precio: c.producto.precio,
          subtotal: c.producto.precio * c.cantidad,
        })),
      });

      if (!resVenta.success)
        return Alert.alert(`Error al registrar venta: ${String(resVenta.message)}`);

      Alert.alert(`Venta realizada: $${total.toFixed(2)}`);
      setCarrito([]);

      const data: ProductoAPI[] = await fetchProductos();
      setProductos(
        data.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          precio: Number(p.precio),
          stock: p.stock ?? 10,
        }))
      );
    } catch (err) {
      console.error("Error al procesar venta:", err);
      Alert.alert("Error inesperado al procesar la venta");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Caja</Text>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        ListHeaderComponent={<Text style={styles.subtitle}>Productos</Text>}
        renderItem={({ item }) => (
          <View style={styles.productoCard}>
            <Text style={[styles.productoText, { fontWeight: "700" }]}>{item.nombre}</Text>
            <Text style={styles.productoText}>${item.precio.toFixed(2)}</Text>
            <Text style={styles.productoText}>Stock: {item.stock}</Text>
            <TouchableOpacity
              style={[styles.addButton, item.stock <= 0 && styles.buttonDisabled]}
              disabled={item.stock <= 0}
              onPress={() => abrirModal(item)}
            >
              <AntDesign name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.subtitle}>Carrito</Text>
      {carrito.map((c) => (
        <View key={c.producto.id} style={styles.carritoRow}>
          <Text style={[styles.carritoText, { fontWeight: "700" }]}>
            {c.producto.nombre} x {c.cantidad} = ${(c.producto.precio * c.cantidad).toFixed(2)}
          </Text>
          <TouchableOpacity
            style={styles.cancelIconButton}
            onPress={() => descartarProducto(c.producto.id)}
          >
            <AntDesign name="close-circle" size={20} color="#ff4d4f" />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.button, carrito.length === 0 && styles.buttonDisabled]}
          disabled={carrito.length === 0}
          onPress={cobrar}
        >
          <Text style={styles.buttonText}>Cobrar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cantidad de {productoSeleccionado?.nombre}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cantidad}
              onChangeText={setCantidad}
              placeholder="Cantidad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.buttonSmall]} onPress={agregarAlCarrito}>
                <Text style={styles.buttonText}>Agregar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSmall, styles.buttonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fdfdfd" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20, color: "#222" },
  subtitle: { fontSize: 20, fontWeight: "600", marginVertical: 12, color: "#444" },
  rowWrapper: { justifyContent: "space-between" },
  productoCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  productoText: { fontSize: 16, color: "#333", textAlign: "center", marginBottom: 4 },
  addButton: {
    marginTop: 8,
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { backgroundColor: "#aaa" },
  carritoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 8,
  },
  carritoText: { fontSize: 16, color: "#333" },
  cancelIconButton: { padding: 4 },
  totalContainer: {
    marginTop: 25,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: { fontSize: 18, fontWeight: "700", color: "#111" },
  button: { backgroundColor: "#007bff", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  buttonSmall: { paddingVertical: 6, paddingHorizontal: 10 },
  buttonCancel: { backgroundColor: "#ff4d4f" },
  buttonText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, marginBottom: 18, fontSize: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
});
