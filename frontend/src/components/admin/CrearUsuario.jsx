import { useState } from 'react';
import axios from 'axios';
import '../../styles/admin/crearUsuario.css';
const API_BASE = import.meta.env.VITE_API_URL;

function CrearUsuario() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'usuario',
  });

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const { name, email, password } = formData;
    if (!name || !email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.post(`${API_BASE}/api/users`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMensaje('✅ Usuario creado correctamente');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'usuario',
      });
    } catch (err) {
      console.error(err);
      setError('❌ ' + (err.response?.data?.message || 'Error al crear usuario'));
    }
  };

  return (
    <div className="crear-usuario-container">
      <h2 className="crear-usuario-titulo">Crear nuevo usuario</h2>
      <form onSubmit={handleSubmit} className="crear-usuario-form">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          className="input-usuario"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo"
          className="input-usuario"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="input-usuario"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          className="select-rol"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="usuario">Usuario</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" className="btn-crear-usuario">
          Crear usuario
        </button>
      </form>

      {mensaje && <p className="mensaje-exito">{mensaje}</p>}
      {error && <p className="mensaje-error">{error}</p>}
    </div>
  );
}

export default CrearUsuario;
