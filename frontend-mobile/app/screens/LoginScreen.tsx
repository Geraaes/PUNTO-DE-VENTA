// app/screens/LoginScreen.tsx
import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../src/context/AuthContext";
import { loginUser } from "../../src/api/api";

export default function LoginScreen() {
  const { setUser, setToken } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Completa todos los campos");
    }

    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (!data.success) {
        Alert.alert("Error", data.message || "Email o contraseña incorrectos");
        setLoading(false);
        return;
      }

      const usuario = data.data.user;
      const token = data.data.token;

      if (usuario.rol_nombre !== "cajero") {
        Alert.alert(
          "Acceso denegado",
          "No tienes permisos para acceder a la caja"
        );
        setLoading(false);
        return;
      }

      setUser(usuario);
      setToken(token);

      router.replace("/screens/CajaScreen");
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Error al conectar con el servidor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>¡Bienvenido al Punto de Venta!</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#f0f4f7",
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
