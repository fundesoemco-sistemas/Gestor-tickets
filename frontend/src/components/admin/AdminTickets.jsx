import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/admin/AdminTickets.css';  

function AdminTickets() {
  /* ---------------- state ---------------- */
  const [tickets, setTickets] = useState([]);
  const [areas,   setAreas]   = useState([]);

  const [fArea, setFArea]           = useState('');
  const [fEstado, setFEstado]       = useState('');
  const [fPrioridad, setFPrioridad] = useState('');

  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    title:'', description:'', priority:'media',
    status:'pendiente', area_id:''
  });

  /* ---------- instancia axios con token ---------- */
  const api = axios.create({
    baseURL : 'http://localhost:3000/api',
    headers : {
      Authorization:`Bearer ${localStorage.getItem('token')}`
    }
  });

  /* ---------- cargar tickets + áreas ---------- */
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [t, a] = await Promise.all([ api.get('/tickets'),
                                         api.get('/areas') ]);
      setTickets(t.data);
      setAreas(a.data);
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
    }
  };

  /* ---------- abrir modal ---------- */
  const openEdit = (t) => {
    setEdit(t);
    setForm({
      title       : t.title,
      description : t.description,
      priority    : t.priority,
      status      : t.status,
      area_id     : t.area_id
    });
  };

  /* ---------- guardar cambios ---------- */
  const save = async () => {
    try {
      await api.put(`/tickets/${edit.id}`, form);
      setEdit(null);
      fetchData();
    } catch (err) {
      console.error('❌ Error al editar ticket:', err);
      alert(err.response?.data?.message || 'No se pudo editar');
    }
  };

  /* ---------- eliminar ---------- */
  const remove = async (id) => {
    if (!window.confirm('¿Eliminar ticket definitivamente?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      fetchData();
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      alert(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  /* ---------- aplicar filtros ---------- */
  const filtrados = tickets.filter(t=>{
    const okArea  = fArea      ? String(t.area_id) === fArea : true;
    const okEst   = fEstado    ? t.status   === fEstado     : true;
    const okPrio  = fPrioridad ? t.priority === fPrioridad  : true;
    return okArea && okEst && okPrio;
  });

  /* ---------- UI ---------- */
  return (
    <div className="admin-tickets">
      <h2>Todos los Tickets</h2>

      {/* ▸ Filtros */}
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'1rem' }}>
        {/* Área */}
        <select value={fArea} onChange={e=>setFArea(e.target.value)}>
          <option value=''>Todas las áreas</option>
          {areas.map(a=>(
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {/* Estado */}
        <select value={fEstado} onChange={e=>setFEstado(e.target.value)}>
          <option value=''>Todos los estados</option>
          <option value='pendiente'>Pendiente</option>
          <option value='en_proceso'>En proceso</option>
          <option value='cerrado'>Cerrado</option>
        </select>

        {/* Prioridad */}
        <select value={fPrioridad} onChange={e=>setFPrioridad(e.target.value)}>
          <option value=''>Todas las prioridades</option>
          <option value='baja'>Baja</option>
          <option value='media'>Media</option>
          <option value='alta'>Alta</option>
        </select>
      </div>

      {/* ▸ Tabla */}
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Título</th><th>Área</th>
            <th>Prioridad</th><th>Estado</th><th>Usuario</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map(t=>(
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.title}</td>
              <td>{t.area_name}</td>
              <td>{t.priority}</td>
              <td>{t.status}</td>
              <td>{t.user_name}</td>
              <td>
                <button onClick={()=>openEdit(t)}>✏️</button>
                <button onClick={()=>remove(t.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ▸ Modal edición */}
      {edit && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar Ticket #{edit.id}</h3>

            <input value={form.title}
                   onChange={e=>setForm({...form,title:e.target.value})}
                   placeholder="Título" />

            <textarea value={form.description}
                      onChange={e=>setForm({...form,description:e.target.value})}
                      placeholder="Descripción" />

            <select value={form.priority}
                    onChange={e=>setForm({...form,priority:e.target.value})}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>

            <select value={form.status}
                    onChange={e=>setForm({...form,status:e.target.value})}>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="cerrado">Cerrado</option>
            </select>

            <select value={form.area_id}
                    onChange={e=>setForm({...form,area_id:e.target.value})}>
              <option value="">-- Área --</option>
              {areas.map(a=>(
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            <div className="modal-buttons">
              <button onClick={save}>Guardar</button>
              <button onClick={()=>setEdit(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTickets;
