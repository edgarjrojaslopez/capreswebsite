// lib/auth/config.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { socios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        cedula: {
          label: "Cédula",
          type: "text",
          placeholder: "Ingrese su cédula"
        },
        password: {
          label: "Contraseña",
          type: "password",
          placeholder: "Ingrese su contraseña"
        }
      },
      async authorize(credentials) {
        if (!credentials?.cedula || !credentials?.password) {
          throw new Error('Cédula y contraseña son requeridos');
        }

        try {
          // Buscar usuario por cédula (CodSocio es varchar(10))
          const user = await db
            .select()
            .from(socios)
            .where(eq(socios.CodSocio, credentials.cedula))
            .limit(1);

          if (!user || user.length === 0) {
            throw new Error('Usuario no encontrado');
          }

          const foundUser = user[0];

          // Verificar contraseña
          const isValid = await bcrypt.compare(credentials.password, foundUser.password);
          if (!isValid) {
            throw new Error('Contraseña incorrecta');
          }

          // Retornar datos del usuario
          return {
            id: foundUser.CodSocio,
            name: foundUser.NombreCompleto,
            email: foundUser.Email || `${foundUser.CodSocio}@capres.com`,
            rol: foundUser.rol || 'socio',
            activo: foundUser.Estado
          };
        } catch (error) {
          console.error('Error en autenticación:', error);
          throw new Error(error.message || 'Error interno del servidor');
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
        token.activo = user.activo;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.rol = token.rol;
        session.user.activo = token.activo;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);