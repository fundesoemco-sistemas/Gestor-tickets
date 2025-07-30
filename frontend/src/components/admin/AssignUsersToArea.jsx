import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/admin/assignUsers.css'; 

function AssignUsersToArea() {
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);

  useEffect(() => {
    obtenerAreas();
    obtenerUsuarios();
  }, []);

  const obtenerAreas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/areas');
      setAreas(res.data);
    } catch (error) {
      console.error('Error al obtener áreas:', error);
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/users');
      setUsuarios(res.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const asignarUsuarios = async () => {
    try {
      await axios.post(`http://localhost:3000/api/areas/${areaSeleccionada}/assign-users`, {
        userIds: usuariosSeleccionados,
      });
      alert('✅ Usuarios asignados correctamente al área');
    } catch (error) {
      console.error('Error al asignar usuarios:', error);
      alert('❌ Error al asignar usuarios');
    }
  };

  return (
    <div className="assign-container">
      <h2>Asignar Usuarios a un Área</h2>

      <label>Selecciona un Área:</label>
      <select value={areaSeleccionada} onChange={(e) => setAreaSeleccionada(e.target.value)}>
        <option value="">-- Seleccionar área --</option>
        {areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
      </select>

      <label>Selecciona Usuarios:</label>
      <div className="usuarios-multiselect">
        {usuarios.map((user) => (
          <label key={user.id}>
            <input
              type="checkbox"
              value={user.id}
              checked={usuariosSeleccionados.includes(user.id)}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                setUsuariosSeleccionados((prev) =>
                  e.target.checked
                    ? [...prev, id]
                    : prev.filter((uid) => uid !== id)
                );
              }}
            />
            {user.name} ({user.email})
          </label>
        ))}
      </div>

      <button onClick={asignarUsuarios} disabled={!areaSeleccionada || usuariosSeleccionados.length === 0}>
        Asignar Usuarios
      </button>
    </div>
  );
}

export default AssignUsersToArea;
