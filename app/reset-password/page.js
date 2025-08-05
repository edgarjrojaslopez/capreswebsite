// app/reset-password/page.js
'use client';

import ResetPasswordForm from './ResetPasswordForm';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {!token ? (
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600">Token no válido o ausente</h2>
            <p className="mt-2 text-gray-600">El enlace para restablecer la contraseña no es válido o ha expirado.</p>
            <Link href="/forgot-password">
              <a className="mt-4 inline-block text-blue-600 hover:underline">Solicitar un nuevo enlace</a>
            </Link>
          </div>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </div>
    </div>
  );
}