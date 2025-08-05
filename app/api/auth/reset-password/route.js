// app/api/auth/reset-password/route.js
import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Faltan el token o la contraseña.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    // Hashear el token recibido para compararlo con el de la BD
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar al usuario con ese token y que no haya expirado
    const user = await db.select().from(socios).where(
      eq(socios.reset_token, hashedToken),
      gt(socios.reset_token_expires, new Date())
    ).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'El token es inválido o ha expirado.' }, { status: 400 });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña y limpiar los campos del token
    await db.update(socios)
      .set({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      })
      .where(eq(socios.CodSocio, user[0].CodSocio));

    return NextResponse.json({ message: 'Contraseña actualizada correctamente.' });

  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}