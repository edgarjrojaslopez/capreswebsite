import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socios, usuarios } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { cedula, email, password } = await request.json();

    // Validate required fields
    if (!cedula || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Check if socio exists
    const [socio] = await db
      .select()
      .from(socios)
      .where(eq(socios.CodSocio, cedula))
      .limit(1);

    if (!socio) {
      return NextResponse.json(
        { error: 'Cédula no encontrada en nuestros registros' },
        { status: 404 }
      );
    }

    // Check if email is already registered
    const [existingUser] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.cedula, cedula))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Esta cédula ya está registrada' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update socio email if different
    if (socio.Email !== email) {
      await db
        .update(socios)
        .set({ Email: email })
        .where(eq(socios.CodSocio, cedula));
    }

    // Create user record
    await db.insert(usuarios).values({
      cedula,
      correo: email,
      password: hashedPassword,
    });

    // Send verification email using existing email service
    const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Registro exitoso - CAPRES',
        userData: {
          nombre: socio.NombreCompleto,
          cedula: cedula,
          email: email
        },
        tipoSolicitud: 'registro',
      }),
    });

    if (!emailResponse.ok) {
      console.error('Error sending welcome email:', await emailResponse.text());
      // Don't fail registration if email fails, just log it
    }

    return NextResponse.json(
      { 
        message: 'Registro exitoso. Por favor revisa tu correo para continuar.',
        emailSent: emailResponse.ok
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error en el registro. Por favor intente nuevamente.' },
      { status: 500 }
    );
  }
}
