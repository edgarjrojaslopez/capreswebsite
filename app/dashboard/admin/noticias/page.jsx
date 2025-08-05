// app/dashboard/admin/noticias/page.jsx
'use client';

import { useEffect, useState } from 'react';

// Componente principal de la página de gestión de noticias
export default function AdminNoticiasPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el formulario
  const [form, setForm] = useState({
    id: null, // Para saber si estamos editando o creando
    titulo: '',
    resumen: '',
    contenido: '',
    imagenUrl: '',
  });

  // Cargar las noticias al montar el componente
  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/noticias');
      if (!res.ok) throw new Error('No se pudo obtener la lista de noticias.');
      const data = await res.json();
      setNoticias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = form.id ? `/api/noticias/${form.id}` : '/api/noticias';
    const method = form.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Algo salió mal.');
      }

      await fetchNoticias(); // Recargar la lista de noticias
      resetForm(); // Limpiar el formulario
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (noticia) => {
    setForm({
      id: noticia.id,
      titulo: noticia.titulo,
      resumen: noticia.resumen || '',
      contenido: noticia.contenido,
      imagenUrl: noticia.imagenUrl || '',
    });
    window.scrollTo(0, 0); // Scroll al formulario
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta noticia?')) return;

    try {
      const res = await fetch(`/api/noticias/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'No se pudo eliminar la noticia.');
      }

      await fetchNoticias(); // Recargar la lista
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      titulo: '',
      resumen: '',
      contenido: '',
      imagenUrl: '',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Noticias</h1>

      {/* Formulario para Crear/Editar Noticias */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {form.id ? 'Editar Noticia' : 'Crear Nueva Noticia'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={form.titulo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="resumen" className="block text-sm font-medium text-gray-700">Resumen</label>
            <textarea
              id="resumen"
              name="resumen"
              rows="3"
              value={form.resumen}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="contenido" className="block text-sm font-medium text-gray-700">Contenido (HTML permitido)</label>
            <textarea
              id="contenido"
              name="contenido"
              rows="10"
              value={form.contenido}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="imagenUrl" className="block text-sm font-medium text-gray-700">URL de la Imagen (Opcional)</label>
            <input
              type="text"
              id="imagenUrl"
              name="imagenUrl"
              value={form.imagenUrl}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-4">
            {form.id && (
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Cancelar Edición
              </button>
            )}
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {form.id ? 'Actualizar Noticia' : 'Guardar Noticia'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Noticias Existentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Noticias Publicadas</h2>
        {loading && <p>Cargando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-4">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <h3 className="font-semibold">{noticia.titulo}</h3>
                <p className="text-sm text-gray-500">{new Date(noticia.fechaCreacion).toLocaleDateString('es-VE')}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(noticia)} className="px-3 py-1 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md">Editar</button>
                <button onClick={() => handleDelete(noticia.id)} className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}