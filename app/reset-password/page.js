// app/reset-password/page.js

import ResetPasswordForm from './ResetPasswordForm';
import { Suspense } from 'react';

// ✅ Evita prerrenderizado
export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        🔐 Restablecer Contraseña
      </h2>

      {/* ✅ Envuelve el componente que usa useSearchParams */}
      <Suspense fallback={<div className="text-center py-4">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>

      <div className="mt-6 text-center">
        <a href="/login" className="text-blue-600 hover:underline text-sm">
          ← Volver al inicio de sesión
        </a>
      </div>
    </div>
  );
}
