// app/api/solicitudes-haberes/route.js

import { Resend } from 'resend';
import { verifyToken } from '@/lib/auth';
import { generateTrackingId } from '@/lib/generateTrackingId';
import { db } from '@/lib/db'; // Ajusta la ruta según tu proyecto
import { solicitudes_haberes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

// Correo verificado en Resend
const FROM_EMAIL = 'onboarding@resend.dev'; // Cambia cuando verifiques tu dominio
const TO_EMAIL = 'support@capreswebsite.capres.com.ve';

export async function POST(request) {
  try {
    // 1. Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return Response.json({ error: 'Token inválido' }, { status: 401 });
    }

    // 2. Leer cuerpo de la solicitud
    const body = await request.json();
    const { tipoRetiro, monto, razon, userData } = body;

    // 3. Validar campos requeridos
    if (!tipoRetiro || !razon || !userData) {
      return Response.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    if (!['parcial', 'total'].includes(tipoRetiro)) {
      return Response.json(
        { error: 'Tipo de retiro inválido' },
        { status: 400 }
      );
    }

    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      return Response.json({ error: 'Monto inválido' }, { status: 400 });
    }

    // 4. Generar número de seguimiento
    const numeroSeguimiento = generateTrackingId(userData.CodSocio);

    // 5. Guardar en la base de datos
    try {
      await db.insert(solicitudes_haberes).values({
        socioId: userData.CodSocio,
        nombreSocio: userData.NombreCompleto,
        emailSocio: userData.Email,
        telefonoSocio: userData.Telefonos,
        tipoRetiro,
        montoSolicitado: montoNumerico,
        razon,
        estado: 'pendiente',
        numeroSeguimiento,
      });

      console.log('✅ Solicitud de retiro guardada:', numeroSeguimiento);
    } catch (dbError) {
      console.error('❌ Error al guardar en DB:', dbError);
      return Response.json(
        { error: 'No se pudo guardar la solicitud' },
        { status: 500 }
      );
    }

    // 6. Plantilla HTML del correo
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Solicitud de Retiro de Haberes</title>
      </head>
      <body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:700px; margin:30px auto; background:#ffffff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <!-- CABECERA -->
          <tr>
            <td bgcolor="#1e40af" style="padding:30px 40px; text-align:center; color:white;">
              <div style="font-size:28px; margin-bottom:8px;">💰</div>
              <h1 style="margin:0; font-size:20px; color:white;">Solicitud de Retiro de Haberes</h1>
              <p style="margin:8px 0 0; color:#e0e7ff; font-size:14px;">N°: ${numeroSeguimiento}</p>
            </td>
          </tr>
          <!-- CUERPO -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#1e293b; font-size:18px; border-bottom:2px solid #e2e8f0; display:inline-block; margin-bottom:16px;">👤 Solicitante</h2>
              <table width="100%" style="font-size:14px; color:#1e293b;">
                <tr><td width="30%"><strong>Nombre:</strong></td><td>${userData.NombreCompleto}</td></tr>
                <tr><td><strong>Cédula:</strong></td><td>${userData.CodSocio}</td></tr>
                <tr><td><strong>Email:</strong></td><td>${userData.Email || 'N/A'}</td></tr>
                <tr><td><strong>Teléfono:</strong></td><td>${userData.Telefonos || 'N/A'}</td></tr>
              </table>

              <h2 style="color:#1e293b; font-size:18px; border-bottom:2px solid #e2e8f0; display:inline-block; margin:24px 0 16px;">💸 Detalles del Retiro</h2>
              <table width="100%" style="font-size:14px; color:#1e293b;">
                <tr><td width="30%"><strong>Tipo:</strong></td><td>${tipoRetiro === 'parcial' ? 'Retiro Parcial' : 'Retiro Total'}</td></tr>
                <tr><td><strong>Monto:</strong></td><td>Bs. ${montoNumerico.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td></tr>
                <tr><td><strong>Fecha:</strong></td><td>${new Date().toLocaleDateString('es-VE')}</td></tr>
              </table>

              <h2 style="color:#1e293b; font-size:18px; border-bottom:2px solid #e2e8f0; display:inline-block; margin:24px 0 16px;">📝 Razón</h2>
              <div style="background:#f8fafc; padding:16px; border-radius:8px; border-left:4px solid #3b82f6; font-style:italic;">
                ${razon.replace(/\n/g, '<br>')}
              </div>
            </td>
          </tr>
          <!-- PIE -->
          <tr>
            <td style="text-align:center; padding:20px; background:#f8fafc; color:#64748b; font-size:12px; border-top:1px solid #e2e8f0;">
              Este mensaje fue generado automáticamente.<br>
              &copy; ${new Date().getFullYear()} CAPRES. Todos los derechos reservados.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 7. Enviar correo con Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Solicitud de Retiro de Haberes - ${userData.NombreCompleto} [${numeroSeguimiento}]`,
      html,
    });

    if (error) {
      console.error('❌ Error al enviar correo:', error);
      // No detenemos el flujo, pero registramos
    } else {
      console.log('📨 Correo enviado:', data);
    }

    // 8. Respuesta exitosa
    return Response.json({
      success: true,
      message: 'Solicitud de retiro enviada correctamente',
       {
        numeroSeguimiento,
        emailEnviado: !error,
      },
    });
  } catch (err) {
    console.error('Error en /api/solicitudes-haberes:', err);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}