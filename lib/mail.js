// app/api/send-email/route.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req) {
  const resetLink = `${
    process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL
  }/reset-password?token=${token}`;
  const { subject, text, to, html, name } = await req.json();

  const mailOptions = {
    from: `"Soporte Capres" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    text,
  };
  try {
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ message: 'Email sent successfully!' }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Error sending email', error }),
      { status: 500 }
    );
  }
}
