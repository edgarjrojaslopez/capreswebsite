// app/api/upload/route.js
import { put } from '@vercel/blob';

export async function POST(request) {
  // Usa formData(), no json()
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return Response.json(
      { error: 'No se proporcionó archivo' },
      { status: 400 }
    );
  }

  try {
    // Subimos el archivo a Vercel Blob
    const blob = await put(`noticias/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return Response.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
