// src/pages/Auth/Register.tsx
import React, { useState } from "react";
import "./Login.css"; // reutilizamos el mismo CSS moderno

const Register: React.FC = () => {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación simple
    if (!form.nombre || !form.email || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setError(null);
    console.log("Registrando usuario:", form);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Título dentro de la card */}
        <h2 className="login-title">¡Crea tu cuenta!</h2>

        {/* Introducción breve */}
        <p className="login-intro">
          Regístrate para gestionar tus productos, usuarios e inventario.
        </p>

        {error && <div className="login-error">{error}</div>}

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          className="login-input"
          value={form.nombre}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          className="login-input"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="login-input"
          value={form.password}
          onChange={handleChange}
        />
        <button type="submit" className="login-button">
          Registrarse
        </button>

        <p className="form-footer">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
