import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/admin/usuariosPorArea.css';
const API_BASE = import.meta.env.VITE_API_URL;

function UsuariosPorArea() {
  const [areas, setAreas] = useState([]);
  const [areaSeleccionada, setAreaSel] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  const token = localStorage.getItem('token');
  const axiosAuth = axios.create({
    baseURL: `${API_BASE}`,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/areas`)
      .then((res) => setAreas(res.data))
      .catch((err) => console.error('❌ Error al obtener áreas:', err));
  }, []);

  const fetchUsuarios = (areaId) => {
    axiosAuth
      .get(`/api/areas/${areaId}/users`)
      .then((res) => setUsuarios(res.data))
      .catch((err) => {
        console.error('❌ Error al obtener usuarios:', err);
        setUsuarios([]);
      });
  };

  const handleEliminarRelacion = async (userId) => {
    if (!areaSeleccionada) return;

    const ok = window.confirm('¿Quitar este usuario del área?');
    if (!ok) return;

    try {
      await axiosAuth.delete(`/api/user-areas/${userId}/${areaSeleccionada}`);
      fetchUsuarios(areaSeleccionada);
    } catch (err) {
      console.error('❌ Error al quitar usuario:', err);
      alert(err.response?.data?.message || 'No se pudo quitar el usuario');
    }
  };

  const handleAreaChange = (e) => {
    const id = e.target.value;
    setAreaSel(id);
    id ? fetchUsuarios(id) : setUsuarios([]);
  };

  return (
    <div className="usuarios-por-area">
      <h2>Usuarios por Área</h2>

      <select value={areaSeleccionada} onChange={handleAreaChange}>
        <option value="">-- Seleccionar área --</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      {usuarios.length > 0 ? (
        <div className="tabla-usuarios">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <button className="btn-eliminar" onClick={() => handleEliminarRelacion(u.id)}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : areaSeleccionada ? (
        <p className="sin-usuarios">No hay usuarios asignados a esta área.</p>
      ) : null}
    </div>
  );
}

export default UsuariosPorArea;
