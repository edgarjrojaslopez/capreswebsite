// app/api/contact/route.js

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, email, asunto, mensaje } = body;

    // ✅ Validaciones
    if (!nombre || !email || !asunto || !mensaje) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El correo electrónico no es válido' },
        { status: 400 }
      );
    }

    // ✅ Enviar correo a CAPRES
    const { data: dataAdmin, error: errorAdmin } = await resend.emails.send({
      from: 'Formulario de Contacto <support@capreswebsite.capres.com.ve>',
      to: ['contactenos@capres.com.ve'], // Tu correo de contacto real
      subject: `Nuevo mensaje: ${asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>📧 Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Asunto:</strong> ${asunto}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <p><strong>Mensaje:</strong></p>
            <p>${mensaje}</p>
          </div>
        </div>
      `,
    });

    if (errorAdmin) {
      console.error('❌ Error al enviar a CAPRES:', errorAdmin);
      return NextResponse.json(
        { error: 'No se pudo enviar el mensaje al administrador' },
        { status: 500 }
      );
    }

    // ✅ Enviar correo de confirmación al usuario
    const { data: dataUser, error: errorUser } = await resend.emails.send({
      from: 'CAPRES <contacto@capreswebsite.capres.com.ve>',
      to: [email],
      subject: '✅ Tu mensaje fue recibido',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>✅ Hemos recibido tu mensaje</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Gracias por contactarnos. Hemos recibido tu consulta sobre: <strong>"${asunto}"</strong>.</p>
          <p>Nos pondremos en contacto contigo pronto.</p>
          <p><strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 4:00 PM</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
        </div>
      `,
    });

    // ⚠️ No es crítico si falla el correo al usuario
    if (errorUser) {
      console.warn(
        'Advertencia: No se pudo enviar correo de confirmación al usuario:',
        errorUser
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente',
    });
  } catch (error) {
    console.error('Error en /api/contact:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
