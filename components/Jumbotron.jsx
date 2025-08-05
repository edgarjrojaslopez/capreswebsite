// components/Jumbotron.jsx

import Link from 'next/link';

export default function Jumbotron() {
  return (
    <div
      className="
        relative
        bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600
        text-white
        px-6 py-16 md:py-24
        min-h-[60vh] md:min-h-[75vh]
        flex
        items-center
      "
    >
      {/* Fondo opcional con imagen */}

      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/images/d03fcb52-6eec-44cc-ae31-fe6aa891e404.png')" }}
      ></div>


      <div className="relative z-10 max-w-4xl mx-auto text-center md:text-left">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
          Bienvenido a <span className="text-yellow-300">CAPRES</span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-2xl mx-auto md:mx-0 mb-8">
          La Caja de Ahorros y Previsión de los empleados del SENIAT,
          comprometida con tu bienestar económico y el de tu familia.
        </p>

        {/* Botón de Iniciar Sesión */}
        <Link
          href="/login"
          className="
            inline-block
            bg-white text-blue-800
            font-semibold
            px-8 py-3
            rounded-lg
            shadow-md
            hover:bg-blue-50
            transition-colors
            duration-200
            text-lg
            md:text-base
            mx-auto md:mx-0
          "
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}