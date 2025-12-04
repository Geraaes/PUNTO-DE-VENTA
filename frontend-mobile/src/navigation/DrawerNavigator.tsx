// src/navigation/DrawerNavigator.tsx
import React, { useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AuthContext } from "../context/AuthContext";
import CajaScreen from "../../app/screens/CajaScreen";
import UnauthorizedScreen from "../../app/screens/UnauthorizedScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      initialRouteName="Caja"
      screenOptions={{
        headerShown: true,
        drawerPosition: "right", // <-- drawer desde la derecha
        drawerStyle: {
          backgroundColor: "#f9f9f9", // color muy claro
          width: 200, // ancho reducido
          borderLeftWidth: 0, // sin borde
          elevation: 0, // sin sombra en Android
        },
        drawerActiveTintColor: "#007bff",
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "500",
        },
      }}
    >
      {user?.rol_nombre === "cajero" ? (
        <Drawer.Screen name="Caja" component={CajaScreen} />
      ) : (
        <Drawer.Screen
          name="AccesoDenegado"
          component={UnauthorizedScreen}
          options={{ title: "Acceso denegado" }}
        />
      )}
    </Drawer.Navigator>
  );
}
