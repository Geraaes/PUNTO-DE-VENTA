import React, { useState, useContext, FormEvent, useLayoutEffect } from "react";
import { AuthContext, User } from "../../context/AuthContext";
import { loginUser } from "../../services/apiWeb";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      nombre: string;
      rol_id: number;
      rol_nombre: string;
      email: string;
    };
    token: string;
  };
  message: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fadeIn, setFadeIn] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const result: LoginResponse = await loginUser(email, password);

      if (!result.success) {
        setError(result.message);
        return;
      }

      const usuario: User = {
         id: result.data.user.id,  
        nombre: result.data.user.nombre,
        rol: result.data.user.rol_nombre, // admin, supervisor, cajero
        token: result.data.token,
      };

      login(usuario);

      // Redirige según rol
      switch (usuario.rol) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "supervisor":
          navigate("/supervisor/dashboard");
          break;
        case "cajero":
          navigate("/cajero/caja"); 
          break;
        default:
          navigate("/unauthorized");
          break;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesión");
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className={`login-title ${fadeIn ? "fade-in" : ""}`}>
          ¡Bienvenido a POS Web!
        </h2>
        <p className="login-intro">
          Gestiona tus productos, usuarios, inventario y más desde una sola plataforma.
        </p>

        {error && <p className="login-error">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">
          Iniciar sesión
        </button>

        <p className="form-footer">
          ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
