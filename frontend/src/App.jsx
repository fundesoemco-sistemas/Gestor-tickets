import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

/* páginas */
import Login from './components/Login';
import CrearTicket from './components/CreateTicket';
import ListaTickets from './components/listaTickets';
import Dashboard from './components/admin/Dashboard';
import UserList from './components/admin/UserList';
import AreaList from './components/admin/areaList';
import AssignUsersToArea from './components/admin/AssignUsersToArea';
import UsuariosPorArea from './components/admin/UsuariosPorArea';
import AdminTickets from './components/admin/AdminTickets';
import CrearUsuario from './components/admin/CrearUsuario';
import AdminStats from './components/admin/AdminStats';

/* layout */
import MainLayout from './components/layout/mainLayout';

/* Componente para "Mis tickets" */
function MisTickets() {
  return (
    <div className="page-container">
      <h2>Mis tickets</h2>
      <hr />
      <ListaTickets />
    </div>
  );
}

/* ========================= APP ========================= */
function App() {
  const [user, setUser] = useState(null);

  /* comprobar token al montar */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  /* login ok */
  const handleLoginSuccess = (u) => {
    setUser(u);
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  /* logout */
  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  /* sin sesión -> login */
  if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

  /* ------------------------ Rutas protegidas ------------------------ */
  return (
    <Router>
      <Routes>
        {/* MainLayout contiene la sidebar + topbar + panel */}
        <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
          {/* 🔐 Ruta directa para el login */}
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

          {/* MainLayout solo se muestra si hay sesión */}
          <Route element={<MainLayout user={user} onLogout={handleLogout} />}></Route>

          {/* index dinámico según rol */}
          <Route
            index
            element={user.role === 'admin' ? <Dashboard user={user} /> : <MisTickets />}
          />

          {/* Rutas disponibles para todos los usuarios */}
          <Route path="mis-tickets" element={<MisTickets />} />
          <Route path="crear-ticket" element={<CrearTicket />} />

          {/* Rutas exclusivas para admin */}
          {user.role === 'admin' && (
            <>
              <Route path="dashboard" element={<Dashboard user={user} />} />
              <Route path="crear-usuario" element={<CrearUsuario />} />
              <Route path="usuarios" element={<UserList />} />
              <Route path="areas" element={<AreaList />} />
              <Route path="asignar-usuarios" element={<AssignUsersToArea />} />
              <Route path="usuarios-por-area" element={<UsuariosPorArea />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="estadisticas" element={<AdminStats />} />
            </>
          )}

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
