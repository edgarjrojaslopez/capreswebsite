import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { nombre, email, asunto, mensaje } = await req.json();

    // Validaciones básicas
    if (!nombre || !email || !asunto || !mensaje) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Configurar transporter de nodemailer con debug
    const transporter = nodemailer.createTransport({
      host: 'mail.capres.com.ve',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true, // Para ver más detalles del error
      logger: true, // Para logging detallado
    });

    // Verificar conexión antes de enviar
    try {
      await transporter.verify();
      console.log('✅ Conexión SMTP exitosa');
    } catch (verifyError) {
      console.error('❌ Error de conexión SMTP:', verifyError);
      throw verifyError;
    }

    // Correo para CAPRES
    const mailToCapres = {
      from: process.env.EMAIL_USER,
      to: 'testmail@capres.com.ve',
      subject: `Nuevo mensaje de contacto: ${asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
            📧 Nuevo Mensaje de Contacto
          </h2>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Información del Remitente:</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Correo:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${asunto}</p>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Mensaje:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${mensaje}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Nota:</strong> Responde directamente a ${email} para contactar al remitente.
            </p>
          </div>
        </div>
      `,
    };

    // Correo de confirmación para el usuario
    const mailToUser = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmación - Mensaje recibido en CAPRES',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
            ✅ Mensaje Recibido - CAPRES
          </h2>

          <p>Hola <strong>${nombre}</strong>,</p>

          <p>Hemos recibido tu mensaje con el asunto: <strong>"${asunto}"</strong></p>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0369a1;">
              📞 <strong>¿Necesitas respuesta urgente?</strong><br>
              Puedes contactarnos directamente al: <strong>+58 0212-7092111</strong>
            </p>
          </div>

          <p>Nuestro equipo revisará tu consulta y te responderemos a la brevedad posible.</p>

          <p style="color: #6b7280; font-size: 14px;">
            <strong>Horario de atención:</strong><br>
            Lunes a Viernes: 8:00 AM - 3:00 PM
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #9ca3af; font-size: 12px;">
            Este es un correo automático, por favor no responder a esta dirección.
          </p>
        </div>
      `,
    };

    // Enviar ambos correos
    await Promise.all([
      transporter.sendMail(mailToCapres),
      transporter.sendMail(mailToUser),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente',
    });
  } catch (error) {
    console.error('Error enviando correo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
