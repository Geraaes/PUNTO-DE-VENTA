// src/navigation/AppNavigator.tsx
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";

import { AuthContext } from "../context/AuthContext";
import LoginScreen from "../../app/screens/LoginScreen";
import CajaScreen from "../../app/screens/CajaScreen";
import UnauthorizedScreen from "../../app/screens/UnauthorizedScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer personalizado (puedes agregar más items o estilo)
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

// Drawer que contiene la Caja
function CajaDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: "right", // menú a la izquierda
        headerShown: true, // muestra el header
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="CajaScreen"
        component={CajaScreen}
        options={{ title: "Caja" }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : user.rol_nombre === "cajero" ? (
          <Stack.Screen
            name="CajaDrawer"
            component={CajaDrawer}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Unauthorized"
            component={UnauthorizedScreen}
            options={{ title: "Acceso denegado" }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
