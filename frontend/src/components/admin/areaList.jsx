import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import '../../styles/admin/areaList.css';

function AreaList() {
  const [areas, setAreas] = useState([]);
  const [nuevaArea, setNuevaArea] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [areaEditando, setAreaEditando] = useState(null);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/areas');
      setAreas(res.data);
    } catch (error) {
      console.error('❌ Error al obtener áreas:', error);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevaArea.trim()) return;

    try {
      await axios.post('http://localhost:3000/api/areas/create', { name: nuevaArea });
      setNuevaArea('');
      fetchAreas();
    } catch (error) {
      console.error('❌ Error al crear área:', error);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta área?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/areas/${id}`);
      fetchAreas();
    } catch (error) {
      console.error('❌ Error al eliminar área:', error);
    }
  };

  const handleEditar = (area) => {
    setModoEdicion(true);
    setAreaEditando(area);
    setNuevaArea(area.name);
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    if (!nuevaArea.trim() || !areaEditando) return;

    try {
      await axios.put(`http://localhost:3000/api/areas/${areaEditando.id}`, {
        name: nuevaArea,
      });
      setModoEdicion(false);
      setAreaEditando(null);
      setNuevaArea('');
      fetchAreas();
    } catch (error) {
      console.error('❌ Error al actualizar área:', error);
    }
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setAreaEditando(null);
    setNuevaArea('');
  };

  return (
    <div className="area-container">
      <h2>Gestión de Áreas</h2>

      <form onSubmit={modoEdicion ? handleActualizar : handleCrear}>
        <input
          type="text"
          value={nuevaArea}
          onChange={(e) => setNuevaArea(e.target.value)}
          placeholder="Nombre del área"
        />
        <button type="submit" className="btn-primary">
          {modoEdicion ? (
            <>
              <Pencil size={16} /> Actualizar
            </>
          ) : (
            <>
              <Plus size={16} /> Crear
            </>
          )}
        </button>
        {modoEdicion && (
          <button type="button" className="btn-secondary" onClick={cancelarEdicion}>
            <X size={16} /> Cancelar
          </button>
        )}
      </form>

      <ul className="area-list">
        {areas.map((area) => (
          <li key={area.id}>
            <span>{area.name}</span>
            <div className="area-actions">
              <button className="btn-editar" onClick={() => handleEditar(area)}>
                <Pencil size={14} />
              </button>
              <button className="btn-eliminar" onClick={() => handleEliminar(area.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AreaList;
