export const runtime = 'nodejs';

import { withErrorHandler } from '@/lib/api/handler';
import { ApiError } from '@/lib/api/error';
import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

async function updateSocioHandler(req) {
  // Obtener codSocio de la URL
  const url = new URL(req.url);
  const codSocio = url.pathname.split('/').pop();

  // Verificar token
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError('No autorizado', { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    decoded = payload;
  } catch (err) {
    throw new ApiError('Token inválido', { status: 401 });
  }

  // Verificar que el socio solo pueda editar sus propios datos
  if (decoded.cedula !== codSocio) {
    throw new ApiError('No autorizado para editar estos datos', { status: 403 });
  }

  // Obtener datos del body
  const { Telefonos, Email } = await req.json();

  // Validar que solo se envíen campos permitidos
  const allowedFields = {};
  if (Telefonos !== undefined) allowedFields.Telefonos = Telefonos;
  if (Email !== undefined) allowedFields.Email = Email;

  if (Object.keys(allowedFields).length === 0) {
    throw new ApiError('No hay campos válidos para actualizar', { status: 400 });
  }

  // Actualizar en la base de datos
  await db
    .update(socios)
    .set(allowedFields)
    .where(eq(socios.CodSocio, codSocio));

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Datos actualizados correctamente',
      updatedFields: allowedFields
    }),
    { status: 200 }
  );
}

export const PUT = withErrorHandler(updateSocioHandler);