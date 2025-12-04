import React from "react";
import { AuthProvider } from "./context/AuthProvider";
import AppRouter from "./routes/AppRouter";

const App: React.FC = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;
