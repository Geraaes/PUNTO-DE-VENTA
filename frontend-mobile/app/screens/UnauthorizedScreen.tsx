import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function UnauthorizedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>No tienes permisos para acceder a esta sección.</Text>
      <Button title="Volver al login" onPress={() => router.replace("/screens/LoginScreen")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { fontSize: 18, marginBottom: 20, textAlign: "center" },
});
