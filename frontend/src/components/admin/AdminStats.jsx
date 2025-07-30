import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { FaClock } from 'react-icons/fa';
import '../../styles/admin/adminStats.css';

const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#FFBB28'];

function AdminStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/tickets/stats');
        setStats(res.data);
      } catch (err) {
        console.error('❌ Error cargando estadísticas:', err);
        setError('No se pudieron cargar las estadísticas.');
      }
    };
    fetchStats();
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="loading">Cargando estadísticas...</p>;

  const formatearHoras = (horasDecimal) => {
    if (horasDecimal === 'N/A') return 'N/A';
    const horas = Math.floor(horasDecimal);
    const minutos = Math.round((horasDecimal - horas) * 60);
    return `${horas}h ${minutos}min`;
  };

  return (
    <div className="stats-container">
      <h2>Estadísticas de Tickets</h2>

      <div className="chart-section">
        <h3>Tickets por Estado</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={stats.porEstado}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {stats.porEstado.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h3>Tickets por Prioridad</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.porPrioridad}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="priority" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Cantidad" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h3>Tickets por Área</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.porArea} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="area" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" name="Cantidad" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="stat-card tiempo-resolucion">
        <h3><FaClock /> Tiempo Promedio de Resolución</h3>
        <p>{formatearHoras(stats.tiempoPromedioHoras)}</p>
      </div>

      {stats.tiempoPromedioPorArea && stats.tiempoPromedioPorArea.length > 0 && (
        <div className="chart-section tiempo-por-area">
          <h3><FaClock /> Tiempo Promedio por Área</h3>
          <table className="tabla-tiempo-area">
            <thead>
              <tr>
                <th>Área</th>
                <th>Horas</th>
                <th>Tiempo Formateado</th>
              </tr>
            </thead>
            <tbody>
              {stats.tiempoPromedioPorArea.map((item, index) => (
                <tr key={index}>
                  <td>{item.area}</td>
                  <td>{item.horasDecimales}</td>
                  <td>{item.tiempoFormateado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminStats;
