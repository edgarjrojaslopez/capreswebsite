// lib/mail.js
import nodemailer from 'nodemailer';

// Crea el transporter con manejo seguro de variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_PORT === '465', // true solo para 465
  requireTLS: process.env.EMAIL_PORT === '587', // Habilita STARTTLS para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Opcional: para desarrollo
  // logger: true,
  // debug: true,
});

export const sendPasswordResetEmail = async ({ email, token, name = '' }) => {
  // Usa NEXTAUTH_URL (backend) o NEXT_PUBLIC_BASE_URL (frontend)
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      'Falta definir NEXTAUTH_URL o NEXT_PUBLIC_BASE_URL en .env'
    );
  }
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Soporte Capres" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Restablece tu contraseña',
    html: `
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado exitosamente a:', email);
  } catch (error) {
    console.error('❌ Error enviando correo:', error.message || error);
    throw new Error(`No se pudo enviar el correo: ${error.message}`);
  }
};
