// /app/api/dashboard/me/route.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';
import { socios, haberes, prestamos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withErrorHandler } from '@/lib/api/handler';
import { ApiError } from '@/lib/api/error';

// Función auxiliar para convertir valores a número
function parseDecimal(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = parseFloat(value);
  return isNaN(number) ? null : number;
}

async function getMyDashboardData(req) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    throw new ApiError('No autorizado', { status: 401 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError('Configuración de servidor incorrecta', { status: 500 });
  }

  const secretKey = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, secretKey);
  const codSocio = payload.cedula;

  if (!codSocio) {
    throw new ApiError('Token inválido: Código de socio no encontrado', { status: 400 });
  }

  // --- A partir de aquí, es la lógica del endpoint anterior ---

  // Verificar conexión a la base de datos
  if (!db) {
    throw new ApiError('Base de datos no conectada', { status: 500 });
  }

  // Buscar socio
  const [socio] = await db
    .select()
    .from(socios)
    .where(eq(socios.CodSocio, codSocio));

  if (!socio) {
    throw new ApiError('Socio no encontrado', { status: 404 });
  }

  // Buscar haberes
  const [haber] = await db
    .select()
    .from(haberes)
    .where(eq(haberes.codSocio, codSocio));

  // Buscar TODOS los préstamos del socio
  const prestamosList = await db
    .select()
    .from(prestamos)
    .where(eq(prestamos.codSocio, codSocio))
    .orderBy(prestamos.fechaPrest, 'desc');

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
      prestamos: prestamosParsed,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export const GET = withErrorHandler(getMyDashboardData);
