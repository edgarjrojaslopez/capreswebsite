export const runtime = 'nodejs';

import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({
          error: 'La contraseña debe tener al menos 6 caracteres',
        }),
        { status: 400 }
      );
    }

    const [socio] = await db
      .select()
      .from(socios)
      .where(eq(socios.reset_token, token));

    if (!socio) {
      return new Response(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { status: 400 }
      );
    }

    if (new Date() > new Date(socio.reset_token_expires)) {
      return new Response(JSON.stringify({ error: 'El enlace ha expirado' }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    await db
      .update(socios)
      .set({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      })
      .where(eq(socios.CodSocio, socio.CodSocio));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contraseña actualizada con éxito',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en reset-password:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
}
