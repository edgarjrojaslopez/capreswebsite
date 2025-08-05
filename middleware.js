import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  console.log('🔍 Middleware ejecutándose para:', request.nextUrl.pathname);

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value;

    console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');

    if (!token) {
      console.log('❌ No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      console.log('✅ Token válido para usuario:', payload.cedula);
      return NextResponse.next();
    } catch (error) {
      console.log('❌ Invalid token, redirecting to login:', error.message);
      // Limpiar cookie inválida
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
