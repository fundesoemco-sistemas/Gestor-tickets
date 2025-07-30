// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/* 1)     importa primero el tema global */
import './styles/theme.css';
import './styles/layout.css'

/* 2)     después tu reset/general existente (si lo necesitas) */
import './index.css';

import App from './App.jsx';

// 🚨 Interceptor global para manejar token expirado o inválido
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);

  if (response.status === 401) {
    try {
      const data = await response.clone().json();
      const mensaje = data?.error?.toLowerCase?.() || '';

      if (mensaje.includes('jwt expired') || mensaje.includes('token inválido')) {
        alert('⚠️ Tu sesión ha expirado o es inválida. Inicia sesión nuevamente.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return new Response(null, { status: 401 });
      }
    } catch (e) {
      // Si el backend no responde con JSON, igual redirigimos
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }

  return response;
};

// 👇 Render normal de React
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
