// lib/mail.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async ({ email, token, name = '' }) => {
  const resetLink = `${
    process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL
  }/reset-password?token=${token}`;

  console.log('📧 Enviando correo con Resend:', { email, resetLink });

  try {
    const { data, error } = await resend.emails.send({
      from: 'Soporte Capres <no-reply@capres.com.ve>',
      to: [email],
      subject: 'Restablece tu contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #2563eb, #4f46e5); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Restablecer Contraseña</h1>
          </div>
          <div style="padding: 30px; background-color: white;">
            <p>Hola ${name || 'usuario'},</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Restablecer Contraseña
              </a>
            </div>
            <p><small>Si no solicitaste esto, ignora este correo.</small></p>
          </div>
        </div>
      `,
      text: `Hola ${
        name || 'usuario'
      },\n\nHaz clic aquí para restablecer tu contraseña:\n${resetLink}\n\nSi no solicitaste esto, ignora este mensaje.`,
    });

    if (error) {
      console.error('❌ Error de Resend:', error);
      throw new Error(error.message);
    }

    console.log('✅ Correo enviado con éxito:', data);
  } catch (error) {
    console.error('❌ Error al enviar con Resend:', error);
    throw error;
  }
};
