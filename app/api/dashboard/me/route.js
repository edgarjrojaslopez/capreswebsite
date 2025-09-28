export const runtime = 'nodejs';

import { db } from '@/lib/db';
import { socios, haberes, prestamos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    console.log('🔍 API Dashboard - Solicitud recibida');
    console.log('🔍 URL completa:', request.url);
    console.log('🔍 userId recibido:', userId);

    if (!userId) {
      console.log('❌ No se proporcionó userId');
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Debug: verificar si el userId existe en la base de datos
    console.log('🔍 Buscando usuario en BD:', userId);

    // 1. Obtener datos del socio
    const userArray = await db
      .select()
      .from(socios)
      .where(eq(socios.CodSocio, userId));

    console.log('🔍 Resultado de búsqueda en socios:', {
      encontrado: userArray.length > 0,
      cantidad: userArray.length,
      userId: userId
    });

    if (userArray.length === 0) {
      console.log('❌ Usuario no encontrado en BD:', userId);

      // Debug: mostrar algunos usuarios existentes para referencia
      try {
        const sampleUsers = await db
          .select({ CodSocio: socios.CodSocio, NombreCompleto: socios.NombreCompleto })
          .from(socios)
          .limit(5);

        console.log('🔍 Usuarios de ejemplo en BD:', sampleUsers);
      } catch (sampleError) {
        console.error('❌ Error obteniendo usuarios de ejemplo:', sampleError);
      }

      return NextResponse.json({
        error: 'Usuario no encontrado',
        debug: {
          userIdSolicitado: userId,
          usuariosEjemplo: 'Ver consola del servidor'
        }
      }, { status: 404 });
    }

    const user = userArray[0];
    console.log('✅ Usuario encontrado:', {
      CodSocio: user.CodSocio,
      NombreCompleto: user.NombreCompleto,
      Estado: user.Estado
    });

    const { password, ...userWithoutPassword } = user;

    // 2. Obtener datos de haberes
    console.log('🔍 Buscando haberes para usuario:', user.CodSocio);
    const haberesData = await db
      .select()
      .from(haberes)
      .where(eq(haberes.codSocio, user.CodSocio));

    console.log('🔍 Haberes encontrados:', haberesData.length);
    console.log('🔍 Datos de haberes:', haberesData);

    // 3. Obtener datos de préstamos
    console.log('🔍 Buscando préstamos para usuario:', user.CodSocio);
    const prestamosData = await db
      .select()
      .from(prestamos)
      .where(eq(prestamos.codSocio, user.CodSocio));

    console.log('🔍 Préstamos encontrados:', prestamosData.length);
    console.log('🔍 Datos de préstamos:', prestamosData);

    // 4. Ensamblar y devolver el payload completo
    const responsePayload = {
      socio: userWithoutPassword,
      haberes: haberesData,
      prestamos: prestamosData,
    };

    console.log('✅ Enviando respuesta exitosa para usuario:', userId);
    console.log('📊 Resumen de datos:', {
      socio: !!responsePayload.socio,
      haberesCount: responsePayload.haberes.length,
      prestamosCount: responsePayload.prestamos.length,
      socioData: {
        CodSocio: responsePayload.socio?.CodSocio,
        NombreCompleto: responsePayload.socio?.NombreCompleto
      }
    });

    console.log('📦 Payload completo que se enviará:');
    console.log(JSON.stringify(responsePayload, null, 2));

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('💥 Error crítico en /api/dashboard/me:', error);
    console.error('💥 Stack trace:', error.stack);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        debug: {
          errorMessage: error.message,
          stack: error.stack
        }
      },
      { status: 500 }
    );
  }
}