// app/api/noticias/[id]/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { noticias } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @route GET /api/noticias/[id]
 * @description Obtiene una noticia específica por su ID.
 */
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const [noticia] = await db.select().from(noticias).where(eq(noticias.id, id));
    if (!noticia) {
      return NextResponse.json({ error: 'Noticia no encontrada' }, { status: 404 });
    }
    return NextResponse.json(noticia);
  } catch (error) {
    console.error(`Error al obtener la noticia ${id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * @route PUT /api/noticias/[id]
 * @description Actualiza una noticia existente.
 * @access Admin
 */
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { titulo, resumen, contenido, imagenUrl } = body;

    if (!titulo || !contenido) {
      return NextResponse.json({ error: 'Título y contenido son obligatorios' }, { status: 400 });
    }

    const [updatedNoticia] = await db
      .update(noticias)
      .set({
        titulo,
        resumen,
        contenido,
        imagenUrl,
      })
      .where(eq(noticias.id, id))
      .returning();

    if (!updatedNoticia) {
      return NextResponse.json({ error: 'Noticia no encontrada para actualizar' }, { status: 404 });
    }

    return NextResponse.json(updatedNoticia);
  } catch (error) {
    console.error(`Error al actualizar la noticia ${id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * @route DELETE /api/noticias/[id]
 * @description Elimina una noticia.
 * @access Admin
 */
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const [deletedNoticia] = await db.delete(noticias).where(eq(noticias.id, id)).returning();

    if (!deletedNoticia) {
      return NextResponse.json({ error: 'Noticia no encontrada para eliminar' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Noticia eliminada correctamente' });
  } catch (error) {
    console.error(`Error al eliminar la noticia ${id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
