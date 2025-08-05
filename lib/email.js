// lib/email.js
import nodemailer from 'nodemailer';

export async function sendResetEmail(to, nombre, token) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password, no tu contraseña normal
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Recuperación de contraseña - CAPRES',
    html: `
      <h2>Hola ${nombre}</h2>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p><strong>Este enlace expira en 1 hora.</strong></p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
