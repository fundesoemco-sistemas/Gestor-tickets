import React from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

function ExportButton() {
    const handleExport = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/tickets/export`, {
                responseType: 'blob',           // 👈 para manejar archivos binarios
                withCredentials: true           // 👈 necesario por CORS con auth
            });

            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tickets.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            console.error('❌ Error al exportar tickets:', err);
            alert('No se pudo exportar el archivo. Intenta más tarde.');
        }
    };

    return (
        <button onClick={handleExport} className="boton-exportar-excel">
            📥 Exportar Tickets en Excel
        </button>

    );
}

export default ExportButton;
