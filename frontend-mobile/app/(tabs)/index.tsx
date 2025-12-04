import { useEffect, useContext, useState } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "../../src/context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function TabsIndex() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [ready, setReady] = useState(false);
useEffect(() => {
  const timeout = setTimeout(() => {
    if (!token) {
      router.replace("/screens/LoginScreen"); // ruta exacta
    } else {
      router.replace("/screens/CajaScreen"); // ruta exacta
    }
    setReady(true);
  }, 50);

  return () => clearTimeout(timeout);
}, [token, router]);


  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
