'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Componente que usa los parámetros
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div>
      <h1>Restablecer Contraseña</h1>
      <p>Token: {token}</p>
      {/* Tu formulario aquí */}
    </div>
  );
}

// Página principal con Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
