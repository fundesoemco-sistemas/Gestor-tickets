import React from 'react';
import '../../styles/admin/Dashboard.css';

function Dashboard({ user }) {
  return (
    <div className="dashboard-container">
      {/*  Encabezado */}
      <header className="dashboard-header">
        <h2>Bienvenido al portal de {user?.name || 'Administrador'}</h2>
      </header>

      {/* Introducción informativa */}
      <section className="dashboard-intro">
        <p>
          Este panel administrativo está diseñado para facilitar la gestión integral del sistema de tickets de atención interna. 
          Desde aquí, podrás supervisar las áreas de trabajo, administrar los usuarios y hacer seguimiento a los reportes ingresados.
        </p>
        <p>
          El objetivo es asegurar una atención eficiente, transparente y organizada. Te invitamos a explorar las secciones 
          disponibles mediante el menú lateral.
        </p>

        <div className="dashboard-highlight">
          <strong>Funciones principales:</strong>
          <ul>
            <li>👥 Administración de usuarios y roles.</li>
            <li>🏢 Organización de áreas de atención.</li>
            <li>📝 Seguimiento y control de tickets asignados.</li>
            <li>📈 Acceso a estadísticas del sistema.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
