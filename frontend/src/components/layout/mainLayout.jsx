import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import '../../styles/layout.css';

function MainLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const links = user.role === 'admin'
    ? [
      { to: '/usuarios', label: 'Usuarios' },
      { to: '/areas', label: 'Áreas' },
      { to: '/usuarios-por-area', label: 'Usuarios por área' },
      { to: '/tickets', label: 'Todos los tickets' },
      { to: '/crear-usuario', label: 'Crear usuario' },
      { to: '/estadisticas', label: 'Estadisticas' },
    ]
    : [
      { to: '/mis-tickets', label: 'Mis tickets' },
      { to: '/crear-ticket', label: 'Crear nuevo ticket' },
    ];

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : ''}`}>

      {/* Botón hamburguesa solo visible en pantallas pequeñas */}
      <button className="hamburger" onClick={toggleSidebar} aria-label="Menú">
        ☰
      </button>

      {/* Sidebar */}
      <aside className="sidebar">
        <header className="logo">
          <Link to="/" onClick={() => setSidebarOpen(false)}>BIENVENIDO</Link>
        </header>

        <nav>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              end
              onClick={() => setSidebarOpen(false)} // cerrar en móvil
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={onLogout}>Cerrar sesión</button>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
