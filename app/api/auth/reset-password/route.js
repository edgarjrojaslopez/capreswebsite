// app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { passwordResetTokens, socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

export async function PUT(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Hashear el token recibido
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // Buscar token válido
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, hashedToken))
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json(
        {
          error: 'Token inválido',
        },
        { status: 400 }
      );
    }

    if (tokenRecord.used) {
      return NextResponse.json(
        {
          error: 'Token ya utilizado',
        },
        { status: 400 }
      );
    }

    if (new Date() > new Date(tokenRecord.expiresAt)) {
      return NextResponse.json(
        {
          error: 'Token expirado',
        },
        { status: 400 }
      );
    }

    // Validar fortaleza de contraseña
    if (password.length < 8) {
      return NextResponse.json(
        {
          error: 'La contraseña debe tener al menos 8 caracteres',
        },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar contraseña del socio
    await db
      .update(socios)
      .set({ password: hashedPassword })
      .where(eq(socios.CodSocio, tokenRecord.userId));

    // Marcar token como usado
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    return NextResponse.json({
      message:
        '¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión con tu nueva contraseña.',
    });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
