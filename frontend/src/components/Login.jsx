import React, { useState } from 'react';
import axios from 'axios';
import '../styles/login.css';
const API_BASE = import.meta.env.VITE_API_URL;

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        `${API_BASE}/api/login`,
        {
          email: email.trim().toLowerCase(),
          password,
        },
        {
          withCredentials: true, // 🔥 Necesario para que CORS con credenciales funcione
        }
      );

      const { token, user } = res.data;

      // Guardar token y pasar datos del usuario a App
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      onLoginSuccess(user);

    } catch (err) {
      console.error('❌ Error en login:', err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Correo o contraseña incorrectos'
          : 'Error al iniciar sesión');
      setError(msg);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Ingresar</button>
        </form>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
