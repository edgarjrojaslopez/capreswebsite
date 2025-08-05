import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    // Configurar el transportador de email (igual que en contact/route.js)
    const transporter = nodemailer.createTransport({
      host: 'mail.capres.com.ve',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true,
      logger: true,
    });

    // Verificar conexión antes de enviar
    try {
      await transporter.verify();
      console.log('✅ Conexión SMTP exitosa');
    } catch (verifyError) {
      console.error('❌ Error de conexión SMTP:', verifyError);
      throw verifyError;
    }

    // Configurar el email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    return Response.json({
      success: true,
      message: 'Email enviado correctamente',
    });
  } catch (error) {
    console.error('Error enviando email:', error);
    return Response.json(
      { error: 'Error al enviar el email' },
      { status: 500 }
    );
  }
}
