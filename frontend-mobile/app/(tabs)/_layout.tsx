import { Drawer } from 'expo-router/drawer';
import { AntDesign } from "@expo/vector-icons";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerStyle: { backgroundColor: '#f9f9f9', width: 200 },
        headerRight: () => (
          <AntDesign name="menu-fold" size={28} color="#007bff" style={{ marginRight: 15 }} />
        ),
      }}
    >
      {/* Todas las screens que estén en esta carpeta se detectan automáticamente */}
    </Drawer>
  );
}
