// components/Header.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false); // Para el menú del usuario
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Para el menú móvil
  const pathname = usePathname();

  // Verificar token al cargar
  useEffect(() => {
    const userDataString = localStorage.getItem('userData');

    if (!userDataString) {
      setUser(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(userDataString);
      setUser(parsedUser);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    setUser(null);
    setMobileMenuOpen(false); // Cerrar menú móvil al salir
    router.push('/');
  };

  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white focus:outline-none mr-2"
            aria-label="Menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <Link
            href="/"
            className="flex items-center space-x-4 hover:opacity-90 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative w-14 h-14 md:w-16 md:h-16 bg-white p-1">
              <Image
                src="/assets/images/capres.jpg"
                alt="Logo CAPRES"
                fill
                sizes="(max-width: 768px) 48px, 64px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold leading-tight">
                CAPRES
              </span>
              <span className="text-xs md:text-sm opacity-90 hidden sm:block">
                Caja de Ahorros SENIAT
              </span>
            </div>
          </Link>
        </div>

        {/* Menú Desktop (oculto en móvil) */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="hover:underline">
            Inicio
          </Link>
          <Link href="/about" className="hover:underline">
            Nosotros
          </Link>
          <Link href="/loans" className="hover:underline">
            Préstamos
          </Link>
          <Link href="/delegates" className="hover:underline">
            Delegados
          </Link>
          <Link href="/documents" className="hover:underline">
            Documentos
          </Link>
          <Link href="/contact" className="hover:underline">
            Contacto
          </Link>

          {/* Menú de usuario (desktop) */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                className="px-3 py-2 rounded-md focus:outline-none"
                onClick={() => setShowMenu(!showMenu)}
              >
                {user.nombre}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-10">
                  <Link
                    href="/dashboard"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/loans/request"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    Solicitar Préstamo
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 w-full text-left"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hover:underline">
              Iniciar Sesión
            </Link>
          )}
        </nav>

        {/* Menú Móvil (solo visible en móvil) */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-blue-800 text-white z-50 flex flex-col p-6">
            {/* Botón de cierre */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white"
                aria-label="Cerrar menú"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Enlaces del menú */}
            <nav className="flex-1 flex flex-col space-y-6 text-xl">
              <Link
                href="/"
                className="hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/about"
                className="hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                href="/loans"
                className="hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Préstamos
              </Link>
              <Link
                href="/delegates"
                className="hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Delegados
              </Link>
              <Link
                href="/documents"
                className="hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentos
              </Link>
              <Link
                href="/contact"
                className="hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hover:underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/loans/request"
                    className="hover:underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Solicitar Préstamo
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left hover:underline"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="hover:underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
