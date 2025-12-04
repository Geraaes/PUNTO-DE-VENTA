import { createContext } from "react";

export interface User {
   id: number;   
  nombre: string;
  rol: string;
  token?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});
