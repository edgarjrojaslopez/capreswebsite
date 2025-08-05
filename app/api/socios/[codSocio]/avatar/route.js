// app/api/socios/[codSocio]/avatar/route.js
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');

// Helper function to ensure the upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    // This error is okay if the directory already exists
    if (error.code !== 'EEXIST') {
      console.error('Error creating upload directory:', error);
      throw new Error('Could not create upload directory.');
    }
  }
}

export async function PUT(request, { params }) {
  const { codSocio } = params;

  // Authorization check
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('avatar'); // 'avatar' must match the key from the frontend

    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo.' }, { status: 400 });
    }

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen.' }, { status: 400 });
    }

    // Ensure the upload directory exists
    await ensureUploadDir();

    // Create a buffer from the file
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Create a unique filename
    const ext = file.name.match(/\.[0-9a-z]+$/i)?.[0] || '.jpg';
    const fileName = `avatar-${codSocio}-${Date.now()}${ext}`; // Add timestamp to prevent caching issues
    const filePath = join(UPLOAD_DIR, fileName);

    // Write the file to the filesystem
    await writeFile(filePath, fileBuffer);

    // Generate the public URL for the avatar
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Update the user's record in the database using Drizzle
    const result = await db
      .update(socios)
      .set({ avatar: avatarUrl })
      .where(eq(socios.CodSocio, codSocio));

    if (result.affectedRows === 0) {
        // This case might happen if codSocio is invalid
        return NextResponse.json({ error: 'Socio no encontrado.' }, { status: 404 });
    }

    // Return a success response
    return NextResponse.json({
      avatarUrl,
      message: 'Avatar actualizado correctamente',
    });

  } catch (error) {
    console.error('Error en /api/socios/[codSocio]/avatar:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
