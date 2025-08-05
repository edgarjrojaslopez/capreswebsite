// app/api/auth/change-password/route.js
export const runtime = 'nodejs';

import { withErrorHandler } from '@/lib/api/handler';
import { ApiError } from '@/lib/api/error';
import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

async function changePasswordHandler(req) {
  const { currentPassword, newPassword } = await req.json();

  // 1. Obtener token del header
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
    throw new ApiError('Token inválido o expirado', { status: 401 });
  }

  const codSocio = decoded.cedula;

  // 2. Buscar al socio
  const [socio] = await db
    .select()
    .from(socios)
    .where(eq(socios.CodSocio, codSocio));

  if (!socio) {
    throw new ApiError('Socio no encontrado', { status: 404 });
  }

  // 3. Verificar contraseña actual
  let isMatch = false;
  if (socio.password.startsWith('$2b$')) {
    isMatch = await bcrypt.compare(currentPassword, socio.password);
  } else {
    // Soporte para contraseñas en texto plano
    isMatch = currentPassword === socio.password;
  }

  if (!isMatch) {
    throw new ApiError('La contraseña actual es incorrecta', { status: 401 });
  }

  // 4. Hashear y guardar nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db
    .update(socios)
    .set({ password: hashedPassword })
    .where(eq(socios.CodSocio, codSocio));

  return new Response(
    JSON.stringify({ success: true, message: 'Contraseña actualizada' }),
    { status: 200 }
  );
}

export const POST = withErrorHandler(changePasswordHandler);
