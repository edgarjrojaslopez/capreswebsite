// import nodemailer from 'nodemailer';

// export async function POST(request) {
//   try {
//     const { to, subject, html } = await request.json();

//     // Configurar el transportador de email (igual que en contact/route.js)
//     const transporter = nodemailer.createTransport({
//       host: 'mail.capres.com.ve',
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//       debug: true,
//       logger: true,
//     });

//     // Verificar conexión antes de enviar
//     try {
//       await transporter.verify();
//       console.log('✅ Conexión SMTP exitosa');
//     } catch (verifyError) {
//       console.error('❌ Error de conexión SMTP:', verifyError);
//       throw verifyError;
//     }

//     // Configurar el email
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to,
//       subject,
//       html,
//     };

//     // Enviar el email
//     await transporter.sendMail(mailOptions);

//     return Response.json({
//       success: true,
//       message: 'Email enviado correctamente',
//     });
//   } catch (error) {
//     console.error('Error enviando email:', error);
//     return Response.json(
//       { error: 'Error al enviar el email' },
//       { status: 500 }
//     );
//   }
// }
// app/api/send-email/route.js

import { Resend } from 'resend';

// Inicializa Resend con tu API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Correo por defecto (usamos el mismo que tenías en Nodemailer)
const DEFAULT_FROM = process.env.EMAIL_USER || 'prestamos@capres.com.ve';

export async function POST(request) {
  try {
    // Extrae los datos del cuerpo
    const { to, subject, html } = await request.json();

    // Validación de campos requeridos
    if (!to || !subject || !html) {
      return Response.json(
        { error: 'Faltan campos requeridos: to, subject, html' },
        { status: 400 }
      );
    }

    // Envía el correo con Resend
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM, // ← Usa el correo de environment (verificado en Resend)
      to: Array.isArray(to) ? to : [to], // Soporta un solo correo o lista
      subject,
      html,
      // Opcional: agregar texto plano si quieres
      // text: html.replace(/<[^>]*>/g, ''), // texto simple básico
    });

    // Si hay error, responde con 500
    if (error) {
      console.error('Error en Resend:', error);
      return Response.json(
        { error: error.message || 'Error al enviar el correo' },
        { status: 500 }
      );
    }

    // Éxito
    return Response.json({
      success: true,
      message: 'Correo enviado correctamente',
      data,
    });
  } catch (err) {
    console.error('Error inesperado en /api/send-email:', err);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
