// app/api/auth/forgot-password/route.js
import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const { cedula, email } = await req.json();

    if (!cedula) {
      return NextResponse.json({ error: 'La cédula es obligatoria' }, { status: 400 });
    }

    // Buscar al socio por su CodSocio (cédula)
    const socio = await db.select().from(socios).where(eq(socios.CodSocio, cedula)).limit(1);

    if (socio.length === 0) {
      return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 });
    }

    const user = socio[0];

    // Si el socio no tiene email y no se ha proporcionado uno nuevo
    if (!user.Email && !email) {
      return NextResponse.json({ requiresEmail: true });
    }

    const userEmail = email || user.Email;

    // Generar token de reseteo
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hora de expiración

    // Actualizar el socio con el token y, si es necesario, el nuevo email
    await db.update(socios)
      .set({
        reset_token: passwordResetToken,
        reset_token_expires: passwordResetExpires,
        ...(email && { Email: email }), // Actualiza el email si se proporcionó uno nuevo
      })
      .where(eq(socios.CodSocio, cedula));

    // Enviar el correo de restablecimiento
    try {
      await sendPasswordResetEmail(userEmail, resetToken);
      return NextResponse.json({ message: 'Correo de restablecimiento enviado' });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      // Revertir la actualización de la base de datos si el correo falla
      await db.update(socios)
        .set({ reset_token: null, reset_token_expires: null })
        .where(eq(socios.CodSocio, cedula));
      return NextResponse.json({ error: 'No se pudo enviar el correo de restablecimiento' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}