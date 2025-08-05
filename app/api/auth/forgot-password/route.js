export const runtime = 'nodejs';

import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendResetEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const { cedula, email: correoIngresado } = await req.json();

    const [socio] = await db
      .select()
      .from(socios)
      .where(eq(socios.CodSocio, cedula));

    if (!socio) {
      // No revelamos si el socio existe
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Si el socio existe, recibirá un correo.',
        }),
        { status: 200 }
      );
    }

    let emailFinal = socio.Email;

    // Caso 1: No tiene correo registrado
    if (!emailFinal && !correoIngresado) {
      return new Response(
        JSON.stringify({
          requiresEmail: true,
          message:
            'Este socio no tiene un correo registrado. Por favor, ingrésalo para continuar.',
        }),
        { status: 200 }
      );
    }

    // Caso 2: No tiene correo, pero el usuario lo ingresó
    if (!emailFinal && correoIngresado) {
      // Validar formato del correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correoIngresado)) {
        return new Response(
          JSON.stringify({
            error: 'El correo electrónico no tiene un formato válido.',
          }),
          { status: 400 }
        );
      }

      // Guardar el correo en la base de datos
      await db
        .update(socios)
        .set({ Email: correoIngresado })
        .where(eq(socios.CodSocio, cedula));

      emailFinal = correoIngresado;
    }

    // Generar token de recuperación
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await db
      .update(socios)
      .set({
        reset_token: token,
        reset_token_expires: expires,
      })
      .where(eq(socios.CodSocio, cedula));

    // Enviar correo
    await sendResetEmail(emailFinal, socio.NombreCompleto, token);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Si el socio existe, recibirá un correo.',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
}
