// lib/mail.js
import { Resend } from 'resend';

// Se instancia el cliente de Resend usando la API Key de las variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

// El correo "desde" donde se enviarán los emails.
// NOTA: Resend requiere que este dominio esté verificado en tu cuenta.
const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export const sendPasswordResetEmail = async ({ email, token, name = '' }) => {
  const resetLink = `${
    process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL
  }/reset-password?token=${token}`;

  // El cuerpo del correo se mantiene igual, es un HTML bien diseñado.
  const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #2563eb, #4f46e5); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Restablecer Contraseña</h1>
        </div>

        <div style="padding: 30px; background-color: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hola ${name || 'usuario'},
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(to right, #2563eb, #4f46e5); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
              Restablecer Contraseña
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #666; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
            <strong>¿No solicitaste este cambio?</strong><br>
            Si no fuiste tú, puedes ignorar este mensaje. Tu contraseña permanecerá segura.
          </p>
        </div>

        <div style="padding: 20px; text-align: center; font-size: 14px; color: #6b7280; background-color: #f3f4f6; border-radius: 0 0 8px 8px;">
          <p>© ${new Date().getFullYear()} Capres. Todos los derechos reservados.</p>
          <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
            Si tienes problemas con el botón, copia y pega esta URL en tu navegador:<br>
            <span style="word-break: break-all;">${resetLink}</span>
          </p>
        </div>
      </div>
    `;

  try {
    // Usamos el método de resend.emails.send() en lugar de transporter.sendMail()
    const { data, error } = await resend.emails.send({
      from: `"Soporte Capres" <${fromEmail}>`,
      to: [email],
      subject: 'Restablece tu contraseña',
      html: emailHtml,
    });

    // Si la API de Resend devuelve un error, lo lanzamos
    if (error) {
      console.error('Error de la API de Resend:', error);
      throw new Error(error.message);
    }

    console.log('Correo enviado con éxito a través de Resend:', data);
    return data;
  } catch (error) {
    console.error('Error detallado al enviar correo con Resend:', error);
    // Lanzamos el error para que sea capturado por el manejador en la ruta de la API
    throw error;
  }
};