// app/api/noticias/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { noticias } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * @route GET /api/noticias
 * @description Obtiene todas las noticias, ordenadas por fecha de creación descendente.
 */
export async function GET() {
  try {
    const todasLasNoticias = await db
      .select()
      .from(noticias)
      .orderBy(desc(noticias.fechaCreacion));

    return NextResponse.json(todasLasNoticias);
  } catch (error) {
    console.error('Error al obtener las noticias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener las noticias.' },
      { status: 500 }
    );
  }
}

/**
 * @route POST /api/noticias
 * @description Crea una nueva noticia.
 * @access Admin
 */
export async function POST(request) {
  // Aquí agregaremos la lógica de autenticación para administradores más adelante

  try {
    const body = await request.json();
    const { titulo, resumen, contenido, imagenUrl } = body;

    if (!titulo || !contenido) {
      return NextResponse.json(
        { error: 'El título y el contenido son obligatorios.' },
        { status: 400 }
      );
    }

    const nuevaNoticia = {
      id: uuidv4(),
      titulo,
      resumen,
      contenido,
      imagenUrl,
      fechaCreacion: new Date(),
    };

    await db.insert(noticias).values(nuevaNoticia);

    return NextResponse.json(nuevaNoticia, { status: 201 });
  } catch (error) {
    console.error('Error al crear la noticia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear la noticia.' },
      { status: 500 }
    );
  }
}
