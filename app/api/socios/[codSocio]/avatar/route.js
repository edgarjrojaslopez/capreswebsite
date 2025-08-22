export const runtime = 'nodejs';

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Validación de autorización (puedes mejorarla con JWT si lo necesitas)
async function checkAuth(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return { authorized: false, error: 'No autorizado' };
  }

  // Aquí podrías validar el token (ej: JWT, o comparar con uno secreto)
  // Por ahora, solo verificamos que exista.
  // TODO: Implementa validación real si es necesario.
  return { authorized: true };
}

export async function PUT(request, { params }) {
  const { codSocio } = params;

  // Verificar autorización
  const auth = await checkAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    console.log(
      '🔍 avatar upload - content-type:',
      request.headers.get('content-type')
    );

    const formData = await request.formData();
    const file = formData.get('avatar');

    if (!file) {
      return NextResponse.json(
        { error: 'No se subió ningún archivo.' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen.' },
        { status: 400 }
      );
    }

    // Leer el archivo como ArrayBuffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generar un nombre único
    const ext = file.name.match(/\.[0-9a-z]+$/i)?.[0] || '.png';
    const fileName = `avatar-${codSocio}-${Date.now()}${ext}`;

    // Subir a Vercel Blob
    const blob = await put(`avatars/${fileName}`, fileBuffer, {
      access: 'public', // La URL será pública
      contentType: file.type,
    });

    const avatarUrl = blob.url; // URL pública del avatar

    // Actualizar en la base de datos
    const result = await db
      .update(socios)
      .set({ avatar: avatarUrl })
      .where(eq(socios.CodSocio, codSocio));

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Socio no encontrado.' },
        { status: 404 }
      );
    }

    // Responder con éxito
    return NextResponse.json({
      avatarUrl,
      message: 'Avatar actualizado correctamente',
    });
  } catch (error) {
    console.error('Error en /api/socios/[codSocio]/avatar:', error);

    // Si el error es específico de Blob (ej: token faltante)
    if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json(
        { error: 'Configuración de almacenamiento no válida.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
