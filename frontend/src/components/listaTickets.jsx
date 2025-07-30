import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DetalleTicket from './DetalleTicket';
import '../styles/listaTicket.css';
import { jwtDecode } from 'jwt-decode';

function ListaTickets() {
  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  });

  const [tickets, setTickets] = useState({ creados: [], asignados: [] });
  const [ticketSel, setTicketSel] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userAreas, setUserAreas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
      setUserAreas(decoded.areas || []);
    }

    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/mis-tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error al cargar tickets:', err);
    }
  };

  const handleStatusChange = async (id, nuevoEstado) => {
    try {
      await api.put(`/tickets/${id}/status`, { status: nuevoEstado });
      fetchTickets();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const canEdit = (ticket) => {
    return userAreas.includes(ticket.area_id);
  };

  const aplicarFiltros = (lista) => {
    return filtroEstado ? lista.filter(t => t.status === filtroEstado) : lista;
  };

  const renderTabla = (lista) => (
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Título</th><th>Descripción</th><th>Prioridad</th><th>Área</th><th>Usuario</th><th>Estado</th><th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {lista.map(t => (
          <tr key={t.id}>
            <td>{t.id}</td>
            <td>{t.title}</td>
            <td>{t.description}</td>
            <td>{t.priority}</td>
            <td>{t.area_name}</td>
            <td>{t.user_name}</td>
            <td>
              <select
                value={t.status}
                disabled={!canEdit(t)}
                onChange={e => handleStatusChange(t.id, e.target.value)}
              >
                <option value='pendiente'>Pendiente</option>
                <option value='en_proceso'>En proceso</option>
                <option value='cerrado'>Cerrado</option>
              </select>
            </td>
            <td><button onClick={() => setTicketSel(t)}>Ver detalles</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCards = (lista) => (
    <div className="ticket-carrusel-container">
      {lista.map(t => (
        <div key={t.id} className="ticket-slide">
          <h4>#{t.id} - {t.title}</h4>
          <p><strong>Descripción:</strong> {t.description}</p>
          <p><strong>Prioridad:</strong> {t.priority}</p>
          <p><strong>Área:</strong> {t.area_name}</p>
          <p><strong>Usuario:</strong> {t.user_name}</p>
          <label><strong>Estado:</strong></label>
          <select
            value={t.status}
            disabled={!canEdit(t)}
            onChange={e => handleStatusChange(t.id, e.target.value)}
          >
            <option value='pendiente'>Pendiente</option>
            <option value='en_proceso'>En proceso</option>
            <option value='cerrado'>Cerrado</option>
          </select>
          <button onClick={() => setTicketSel(t)}>Ver detalles</button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="contenedor-tickets">
      <h2>Mis Tickets Creados</h2>
      <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
        <option value="">Todos</option>
        <option value="pendiente">Pendiente</option>
        <option value="en_proceso">En proceso</option>
        <option value="cerrado">Cerrado</option>
      </select>
      <div className="ticket-table">
        {renderTabla(aplicarFiltros(tickets.creados))}
      </div>
      {renderCards(aplicarFiltros(tickets.creados))}

      <h2 className="titulo-secundario">Tickets Asignados a Mi Área</h2>
      <div className="ticket-table">
        {renderTabla(aplicarFiltros(tickets.asignados))}
      </div>
      {renderCards(aplicarFiltros(tickets.asignados))}

      {ticketSel && (
        <DetalleTicket ticket={ticketSel} onClose={() => setTicketSel(null)} />
      )}
    </div>
  );
}

export default ListaTickets;
