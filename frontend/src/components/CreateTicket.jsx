import React, { useState, useEffect } from 'react';
const API_BASE = import.meta.env.VITE_API_URL;
import axios from 'axios';
import '../styles/crearTicket.css';

function CrearTicket() {
  const [ticket, setTicket] = useState({
    title: '',
    description: '',
    priority: 'media',
    area_id: '',
    usuario_asignado_id: '',
  });

  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // Cargar las áreas al montar el componente
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/areas`);
        setAreas(res.data);
      } catch (error) {
        console.error('Error al cargar áreas:', error);
      }
    };
    fetchAreas();
  }, []);

  // Cuando cambia el área seleccionada, cargar los encargados de esa área
  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!ticket.area_id) {
        setUsuarios([]);
        return;
      }  

      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/users/encargados/${ticket.area_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuarios(res.data);
      } catch (error) {
        console.error('Error al cargar encargados del área:', error);
        setUsuarios([]);
      }
    };

    fetchUsuarios();
    setTicket((prev) => ({ ...prev, usuario_asignado_id: '' }));
  }, [ticket.area_id]);

  const handleChange = (e) => {
    setTicket({ ...ticket, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ticket.usuario_asignado_id) {
      setMensaje('❌ Debes seleccionar un responsable del área');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/tickets`, ticket, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensaje('✅ Ticket enviado correctamente');
      setTicket({
        title: '',
        description: '',
        priority: 'media',
        area_id: '',
        usuario_asignado_id: '',
      });
      setUsuarios([]);
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al enviar el ticket');
    }
  };

  return (
    <div className="crear-ticket-container">
      <h2>Crear nuevo ticket</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Título"
          value={ticket.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Descripción"
          value={ticket.description}
          onChange={handleChange}
          required
        />

        <select name="priority" value={ticket.priority} onChange={handleChange}>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>

        <select name="area_id" value={ticket.area_id} onChange={handleChange} required>
          <option value="">Seleccionar área</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>

        {usuarios.length > 0 && (
          <select
            name="usuario_asignado_id"
            value={ticket.usuario_asignado_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar responsable</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        <button type="submit">Enviar</button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default CrearTicket;
