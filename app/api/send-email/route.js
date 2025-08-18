// app/api/send-email/route.js

import { Resend } from 'resend';
import { generateTrackingId } from '@/lib/generateTrackingId';

import { db } from '@/lib/db';
import { solicitudes, solicitudes_haberes } from '@/lib/db/schema';

const resend = new Resend(process.env.RESEND_API_KEY);
const DEFAULT_FROM = process.env.EMAIL_USER;

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      to,
      subject,
      userData,
      // Préstamo
      selectedLoanType,
      loanForm,
      // Retiro
      tipoSolicitud,
      tipoRetiro,
      montoSolicitado,
      razon,
    } = body;

    // === VALIDACIÓN BÁSICA ===
    if (!to || !subject || !userData) {
      return Response.json(
        { error: 'Campos esenciales faltantes: to, subject o userData' },
        { status: 400 }
      );
    }

    let numeroSeguimiento;
    let html;

    // === PROCESAR SEGÚN TIPO DE SOLICITUD ===
    if (tipoSolicitud === 'retiro') {
      // --- VALIDACIÓN PARA RETIRO ---
      if (!tipoRetiro || !razon || montoSolicitado == null) {
        return Response.json(
          { error: 'Faltan campos requeridos para retiro' },
          { status: 400 }
        );
      }

      if (isNaN(parseFloat(montoSolicitado)) || montoSolicitado <= 0) {
        return Response.json(
          { error: 'Monto de retiro inválido' },
          { status: 400 }
        );
      }

      // --- GENERAR ID DE SEGUIMIENTO ---
      numeroSeguimiento = generateTrackingId(userData.CodSocio);

      // --- GUARDAR EN BASE DE DATOS ---
      await db.insert(solicitudes_haberes).values({
        socioId: userData.CodSocio,
        nombreSocio: userData.NombreCompleto,
        emailSocio: userData.Email,
        telefonoSocio: userData.Telefonos,
        tipoRetiro,
        montoSolicitado: parseFloat(montoSolicitado),
        razon,
        numeroSeguimiento,
      });

      console.log('✅ Solicitud de retiro guardada en DB:', numeroSeguimiento);

      // --- PLANTILLA DE CORREO PARA RETIRO ---
      html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Solicitud de Retiro de Haberes</title>
        </head>
        <body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:700px; margin:30px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <!-- CABECERA -->
            <tr>
              <td bgcolor="#16a34a" style="padding:30px 40px; text-align:center; color:white;">
                <div style="font-size:28px; margin-bottom:8px;">💵</div>
                <h1 style="margin:0; font-size:20px; color:white;">Solicitud de Retiro de Haberes</h1>
                <p style="margin:8px 0 0; color:#d1fae5; font-size:14px;">N°: ${numeroSeguimiento}</p>
              </td>
            </tr>
            <!-- CUERPO -->
            <tr>
              <td style="padding:40px;">
                <h2 style="color:#1e293b; font-size:18px; border-bottom:2px solid #e2e8f0; display:inline-block; margin-bottom:16px;">👤 Solicitante</h2>
                <table width="100%" style="font-size:14px; color:#1e293b;">
                  <tr><td width="30%"><strong>Nombre:</strong></td><td>${
                    userData.NombreCompleto
                  }</td></tr>
                  <tr><td><strong>Cédula:</strong></td><td>${
                    userData.CodSocio
                  }</td></tr>
                  <tr><td><strong>Email:</strong></td><td>${
                    userData.Email || 'N/A'
                  }</td></tr>
                  <tr><td><strong>Teléfono:</strong></td><td>${
                    userData.Telefonos || 'N/A'
                  }</td></tr>
                </table>

                <h2 style="color:#1e293b; font-size:18px; border-bottom:2px solid #e2e8f0; display:inline-block; margin:24px 0 16px;">💰 Detalles del Retiro</h2>
                <table width="100%" style="font-size:14px; color:#1e293b;">
                  <tr><td width="30%"><strong>Tipo:</strong></td><td>Retiro ${
                    tipoRetiro === 'parcial' ? 'Parcial' : 'Total'
                  }</td></tr>
                  <tr><td><strong>Monto:</strong></td><td>Bs. ${new Intl.NumberFormat(
                    'es-VE',
                    {
                      minimumFractionDigits: 2,
                    }
                  ).format(montoSolicitado)}</td></tr>
                  <tr><td><strong>Fecha:</strong></td><td>${new Date().toLocaleDateString(
                    'es-VE'
                  )}</td></tr>
                </table>

                <h2 style="color:#1e293b; font-size:18px; border-bottom:2px solid #e2e8f0; display:inline-block; margin:24px 0 16px;">📝 Razón</h2>
                <div style="background:#f8fafc; padding:16px; border-radius:8px; border-left:4px solid #16a34a; font-style:italic;">
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
    } else {
      // --- VALIDACIÓN PARA PRÉSTAMO ---
      if (!selectedLoanType || !loanForm?.amount || !loanForm?.reason) {
        return Response.json(
          { error: 'Faltan campos requeridos para préstamo' },
          { status: 400 }
        );
      }

      const monto = parseFloat(loanForm.amount);
      if (isNaN(monto) || monto <= 0) {
        return Response.json(
          { error: 'Monto de préstamo inválido' },
          { status: 400 }
        );
      }

      // --- GENERAR ID DE SEGUIMIENTO ---
      numeroSeguimiento = generateTrackingId(userData.CodSocio);

      // --- GUARDAR EN BASE DE DATOS ---
      await db.insert(solicitudes).values({
        socioId: userData.CodSocio,
        nombreSocio: userData.NombreCompleto,
        emailSocio: userData.Email,
        telefonoSocio: userData.Telefonos,
        tipoPrestamo: selectedLoanType.name,
        montoSolicitado: monto,
        razon: loanForm.reason,
        numeroSeguimiento,
      });

      console.log(
        '✅ Solicitud de préstamo guardada en DB:',
        numeroSeguimiento
      );

      // --- PLANTILLA DE CORREO PARA PRÉSTAMO ---
      html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Solicitud de Préstamo</title>
        </head>
        <body style="margin:0; padding:0; background:#f4f6f9; font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:700px; margin:30px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <!-- CABECERA -->
            <tr>
              <td bgcolor="#1e40af" style="padding:30px 40px; text-align:center; color:white;">
                <div style="font-size:28px; margin-bottom:8px;">📄</div>
                <h1 style="margin:0; font-size:20px; color:white;">Solicitud de Préstamo Recibida</h1>
                <p style="margin:8px 0 0; color:#e0e7ff; font-size:14px;">N°: ${numeroSeguimiento}</p>
              </td>
            </tr>
            <!-- CUERPO -->
            <tr>
              <td style="padding:40px;">
                <h2 style="color:#1e293b; font-size:18px; border-bottom:2px solid #e2e8f0; display:inline-block; margin-bottom:16px;">👤 Solicitante</h2>
                <table width="100%" style="font-size:14px; color:#1e293b;">
                  <tr><td width="30%"><strong>Nombre:</strong></td><td>${
                    userData.NombreCompleto
                  }</td></tr>
                  <tr><td><strong>Cédula:</strong></td><td>${
                    userData.CodSocio
                  }</td></tr>
                  <tr><td><strong>Email:</strong></td><td>${
                    userData.Email || 'N/A'
                  }</td></tr>
                  <tr><td><strong>Teléfono:</strong></td><td>${
                    userData.Telefonos || 'N/A'
                  }</td></tr>
                </table>

                <h2 style="color:#1e293b; font-size:18px; border-bottom:2px solid #e2e8f0; display:inline-block; margin:24px 0 16px;">💰 Detalles</h2>
                <table width="100%" style="font-size:14px; color:#1e293b;">
                  <tr><td width="30%"><strong>Tipo:</strong></td><td>${
                    selectedLoanType.name
                  }</td></tr>
                  <tr><td><strong>Monto:</strong></td><td>Bs. ${new Intl.NumberFormat(
                    'es-VE',
                    {
                      minimumFractionDigits: 2,
                    }
                  ).format(monto)}</td></tr>
                  <tr><td><strong>Fecha:</strong></td><td>${new Date().toLocaleDateString(
                    'es-VE'
                  )}</td></tr>
                </table>

                <h2 style="color:#1e293b; font-size:18px; border-bottom:2px solid #e2e8f0; display:inline-block; margin:24px 0 16px;">📝 Razón</h2>
                <div style="background:#f8fafc; padding:16px; border-radius:8px; border-left:4px solid #3b82f6; font-style:italic;">
                  ${loanForm.reason.replace(/\n/g, '<br>')}
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
    }

    // === ENVIAR CORREO CON RESEND ===
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject: `${subject} [${numeroSeguimiento}]`,
      html,
    });

    if (error) {
      console.error('❌ Error al enviar correo:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // === RESPUESTA EXITOSA ===
    return Response.json({
      success: true,
      message: 'Solicitud procesada y correo enviado',
      data: {
        numeroSeguimiento,
        email: data,
      },
    });
  } catch (err) {
    console.error('Error en /api/send-email:', err);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
