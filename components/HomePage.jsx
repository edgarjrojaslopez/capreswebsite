// components/HomePage.jsx
'use client';
import Jumbotron from '@/components/Jumbotron';
import { useEffect, useState } from 'react';
import Link from 'next/link'; // Importar Link

// Función para formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ahora hacemos fetch a nuestra nueva API
    fetch('/api/noticias')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar las noticias desde la API');
        return res.json();
      })
      .then((data) => setNews(data))
      .catch((err) => {
        console.error('Error al cargar noticias:', err);
        setNews([]); // En caso de error, dejamos el array vacío
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="mb-12">
        <Jumbotron />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Misión, Visión, Valores (sin cambios) */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold mb-3">Nuestra Misión</h3>
          <p className="text-gray-600">
            Promover la cultura del ahorro y brindar servicios financieros
            accesibles que fortalezcan la economía de nuestros asociados.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold mb-3">Nuestra Visión</h3>
          <p className="text-gray-600">
            Ser la principal opción financiera para los empleados del SENIAT,
            reconociendo por nuestra solidez, innovación y servicio
            personalizado.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-semibold mb-3">Valores</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Transparencia</li>
            <li>Confianza</li>
            <li>Responsabilidad</li>
            <li>Solidaridad</li>
          </ul>
        </div>
      </section>

      {/* Noticias Recientes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Noticias Recientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <p className="text-gray-500">Cargando noticias...</p>
          ) : news.length === 0 ? (
            <p className="text-gray-500">No hay noticias disponibles en este momento.</p>
          ) : (
            news.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow">
                <span className="text-sm text-blue-600 font-medium">
                  {formatDate(item.fechaCreacion)} 
                </span>
                <h3 className="text-xl font-semibold mt-2 mb-2">
                  {item.titulo}
                </h3>
                <p className="text-gray-600 mb-4">{item.resumen}</p>
                <Link href={`/noticia/${item.id}`} className="text-blue-600 hover:underline text-sm font-semibold">
                  Leer más →
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}