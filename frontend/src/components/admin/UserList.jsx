import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/admin/UserList.css';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';

function UserList() {
  const [usuarios, setUsuarios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'usuario' });
  const [asignModal, setAsignModal] = useState(null);
  const [asignArea, setAsignArea] = useState('');
  const [asignManager, setAsignManager] = useState(false);

  const token = localStorage.getItem('token');

  const axiosAuth = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  useEffect(() => {
    fetchUsuarios();
    axiosAuth.get('/areas')
      .then(r => setAreas(r.data))
      .catch(err => console.error('❌ Error al obtener áreas:', err));
  }, []);

  const fetchUsuarios = () => {
    axiosAuth.get('/users')
      .then(r => {
        if (Array.isArray(r.data)) {
          setUsuarios(r.data);
        } else {
          console.error('⚠️ Respuesta inesperada:', r.data);
          setUsuarios([]);
        }
      })
      .catch(err => {
        console.error('❌ Error al obtener usuarios:', err);
        setUsuarios([]);
      });
  };

  const openEdit = u => {
    setUsuarioEdit(u);
    setForm({ name: u.name, email: u.email, role: u.role });
  };

  const openAsign = u => {
    setAsignModal(u);
    setAsignArea('');
    setAsignManager(false);
  };

  const saveUser = () => {
    axiosAuth.put(`/users/${usuarioEdit.id}`, form)
      .then(() => {
        setUsuarioEdit(null);
        fetchUsuarios();
      })
      .catch(err => {
        alert('Error al guardar usuario');
        console.error(err);
      });
  };

  const deleteUser = (id) => {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      axiosAuth.delete(`/users/${id}`)
        .then(() => {
          fetchUsuarios();
          alert('Usuario eliminado');
        })
        .catch(err => {
          console.error('❌ Error al eliminar usuario:', err);
          alert('No se pudo eliminar el usuario');
        });
    }
  };

  const saveAsign = () => {
    axiosAuth.post('/user-areas', {
      user_id: asignModal.id,
      area_id: asignArea,
      is_manager: asignManager
    })
      .then(() => {
        setAsignModal(null);
        alert('Área asignada');
        fetchUsuarios();
      })
      .catch(err => {
        console.error('❌ Error al asignar área:', err);
        alert(err.response?.data?.message || 'Error al asignar área');
      });
  };

  return (
    <div className="user-list-container">
      <h2>Gestión de Usuarios</h2>

      {usuarios.length === 0 ? (
        <p>No hay usuarios para mostrar.</p>
      ) : (
        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <div className="user-actions">
                      <button onClick={() => openEdit(u)} title="Editar">
                        <FaEdit />
                      </button>
                      <button onClick={() => openAsign(u)} title="Asignar área">
                        <FaPlus />
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="danger" title="Eliminar">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {usuarioEdit && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar usuario</h3>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre" />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Correo" />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="usuario">Usuario</option>
              <option value="admin">Admin</option>
            </select>
            <div className="modal-buttons">
              <button onClick={saveUser}><FaCheck /> Guardar</button>
              <button onClick={() => setUsuarioEdit(null)}><FaTimes /> Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {asignModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Asignar área a {asignModal.name}</h3>

            <select value={asignArea} onChange={e => setAsignArea(e.target.value)}>
              <option value="">-- Selecciona área --</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={asignManager}
                onChange={e => setAsignManager(e.target.checked)}
              />
              Encargado (manager)
            </label>

            <div className="modal-buttons">
              <button disabled={!asignArea} onClick={saveAsign}><FaCheck /> Guardar</button>
              <button onClick={() => setAsignModal(null)}><FaTimes /> Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
