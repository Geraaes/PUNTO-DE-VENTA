// app/_layout.tsx
import { Slot } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <Slot />  {/* Renderiza los screens y layouts hijos */}
        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}
