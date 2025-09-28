import LoginForm from '@/components/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>
        <LoginForm />
      </div>
    </div>
  );
}
