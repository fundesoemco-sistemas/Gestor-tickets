import React from 'react';

function DetalleTicket({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div style={estilos.overlay}>
      <div style={estilos.modal}>
        <h3>📝 Detalles del Ticket</h3>
        <p><strong>ID:</strong> {ticket.id}</p>
        <p><strong>Título:</strong> {ticket.title}</p>
        <p><strong>Descripción:</strong> {ticket.description}</p>
        <p><strong>Prioridad:</strong> {ticket.priority}</p>
        <p><strong>Estado:</strong> {ticket.status}</p>
        <p><strong>Usuario:</strong> {ticket.user_name}</p>
        <p><strong>Fecha creación:</strong> {new Date(ticket.created_at).toLocaleString()}</p>

        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

const estilos = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff', color: 'black', padding: '20px',
    borderRadius: '8px', width: '90%', maxWidth: '500px',
  }
};

export default DetalleTicket;
