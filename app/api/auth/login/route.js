export const runtime = 'nodejs';

import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ ERROR FATAL: JWT_SECRET no está definido');
}

export async function POST(req) {
  try {
    const { cedula, password } = await req.json();

    if (!cedula || !password) {
      return new Response(
        JSON.stringify({
          error: { message: 'Cédula y contraseña requeridas' },
        }),
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(socios)
      .where(eq(socios.CodSocio, cedula));

    if (!user) {
      return new Response(
        JSON.stringify({ error: { message: 'Credenciales inválidas' } }),
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: { message: 'Credenciales inválidas' } }),
        { status: 401 }
      );
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET no está definido');
      return new Response(
        JSON.stringify({ error: { message: 'Error interno del servidor' } }),
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      cedula: user.CodSocio,
      nombre: user.NombreCompleto,
      rol: user.rol,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // Establecer cookie httpOnly
    const isProd = process.env.NODE_ENV === 'production';
    const cookie = [
      `token=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      isProd ? 'Secure' : '', // Solo Secure en producción
      'Max-Age=604800', // 7 días
    ]
      .filter(Boolean)
      .join('; ');

    return new Response(
      JSON.stringify({
        token,
        user: { id: user.CodSocio, nombre: user.NombreCompleto, rol: user.rol },
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error en login:', error);
    return new Response(
      JSON.stringify({ error: { message: 'Error interno del servidor' } }),
      { status: 500 }
    );
  }
}
