// /app/api/dashboard/[codSocio]/route.js

import { withErrorHandler } from '@/lib/api/handler';
import { ApiError } from '@/lib/api/error';
import { db } from '@/lib/db';
import { socios, haberes, prestamos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Función auxiliar para convertir valores a número
function parseDecimal(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = parseFloat(value);
  return isNaN(number) ? null : number;
}

async function handleGetDashboard(req) {
  try {
    // Extraer codSocio de la URL
    const url = new URL(req.url);
    const path = url.pathname; // "/api/dashboard/12345678"
    const codSocio = path.split('/').pop(); // Extrae el último segmento

    console.log('🔍 [API] Buscando socio con codSocio:', codSocio);

    if (!codSocio) {
      throw new ApiError('Código de socio no proporcionado', {
        code: 'MISSING_SOCIO',
        status: 400,
      });
    }

    // Verificar conexión a la base de datos
    if (!db) {
      throw new ApiError('Base de datos no conectada', {
        code: 'DB_ERROR',
        status: 500,
      });
    }

    // Buscar socio
    const [socio] = await db
      .select()
      .from(socios)
      .where(eq(socios.CodSocio, codSocio));

    console.log('👤 [API] Socio encontrado:', socio);

    if (!socio) {
      throw new ApiError('Socio no encontrado', {
        code: 'SOCIO_NOT_FOUND',
        status: 404,
      });
    }

    // Buscar haberes
    const [haber] = await db
      .select()
      .from(haberes)
      .where(eq(haberes.codSocio, codSocio));

    console.log('💰 [API] Haberes encontrados:', haber);

    // Buscar TODOS los préstamos del socio (ordenados por fecha)
    const prestamosList = await db
      .select()
      .from(prestamos)
      .where(eq(prestamos.codSocio, codSocio))
      .orderBy(prestamos.fechaPrest, 'desc');

    console.log('🏦 [API] Préstamos encontrados:', prestamosList);

    // Convertir campos numéricos a float
    const haberesParsed = haber
      ? {
          codSocio: haber.codSocio,
          aporteS: parseDecimal(haber.aporteS),
          aporteP: parseDecimal(haber.aporteP),
          aporteV: parseDecimal(haber.aporteV),
          retiroH: parseDecimal(haber.retiroH),
          totalH: parseDecimal(haber.totalH),
        }
      : null;

    const prestamosParsed = prestamosList.map((p) => ({
      id: p.id,
      codSocio: p.codSocio,
      tipoPrest: p.tipoPrest,
      fechaPrest: p.fechaPrest,
      montoPrest: parseDecimal(p.montoPrest),
      saldoPrest: parseDecimal(p.saldoPrest),
    }));

    // Devolver respuesta JSON
    return new Response(
      JSON.stringify({
        socio,
        haberes: haberesParsed,
        prestamos: prestamosParsed, // 👈 Ahora es un array
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ [API] Error en handleGetDashboard:', error);
    throw error;
  }
}

export const GET = withErrorHandler(handleGetDashboard);
