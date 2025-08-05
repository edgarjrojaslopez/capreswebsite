'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardContent from '@/components/DashboardContent';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [haberesData, setHaberesData] = useState(null);
  const [prestamosData, setPrestamosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [codSocio, setCodSocio] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Obtener token y datos del usuario
    const storedToken = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    if (!storedToken || !storedUserData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      const userCodSocio = parsedUserData.id || parsedUserData.CodSocio;

      console.log(
        '🔍 Dashboard - Token:',
        storedToken ? 'Presente' : 'Ausente'
      );
      console.log('🔍 Dashboard - CodSocio extraído:', userCodSocio);

      setToken(storedToken);
      setCodSocio(userCodSocio);

      // Cargar datos del dashboard
      fetchDashboardData(userCodSocio, storedToken);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchDashboardData = async (codSocio, token) => {
    try {
      const response = await fetch(`/api/dashboard/${codSocio}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setUserData(data.socio);
      setHaberesData(data.haberes);
      setPrestamosData(data.prestamos || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  if (!userData || !codSocio) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">
          Error: No se pudieron cargar los datos del usuario
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <DashboardContent
          userData={userData}
          haberesData={haberesData}
          prestamosData={prestamosData}
          codSocio={codSocio}
          token={token}
        />
      </main>
    </div>
  );
}
