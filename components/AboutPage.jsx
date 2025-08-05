// components/AboutPage.jsx
// About Page Component
export default function AboutPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Sobre Nosotros</h2>

      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Historia de CAPRES</h3>
        <p className="mb-4">
          El día 22 de Junio de 1995, 53 funcionarios adscritos al Servicio
          Nacional Integrado de Administración Tributaria (SENIAT) se reunieron
          a objeto de constituir lo que es hoy “La Caja de Ahorro y Previsión de
          los Empleados del Servicio Nacional Integrado de Administración
          Aduanera y Tributaria SENIAT – CAPRES”; teniendo por objeto principal
          establecer y fomentar el ahorro sistemático y en general procurar para
          sus asociados toda clase de beneficios socioeconómicos.
        </p>
        <p className="mb-4">
          Nuestra trayectoria ha estado marcada por el compromiso con la
          transparencia, la responsabilidad social y el desarrollo sostenible de
          nuestros socios.
        </p>
        <p>
          Actualmente contamos con más de 4,500 socios activos y ofrecemos una
          amplia gama de productos y servicios financieros diseñados
          específicamente para el colectivo SENIAT.
        </p>
      </section>

      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">
          Consejo de Administración
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Eloy Noriega',
              role: 'Presidente',
              image: 'https://placehold.co/300x300?text=Presidente',
            },
            {
              name: 'Raúl Lucena',
              role: 'Tesorero',
              image: 'https://placehold.co/300x300?text=Vicepresidente',
            },
            {
              name: 'Gustavo Soler',
              role: 'Secretario',
              image: 'https://placehold.co/300x300?text=Tesorero',
            },
          ].map((member, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h4 className="font-semibold">{member.name}</h4>
              <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">
          Consejo de Administración (Suplentes)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Luis Vidal',
              role: 'Presidente',
              image: 'https://placehold.co/300x300?text=Presidente',
            },
            {
              name: 'María Elena Barrios',
              role: 'Tesorera',
              image: 'https://placehold.co/300x300?text=Vicepresidente',
            },
            {
              name: 'Marisol Duque',
              role: 'Secretaria',
              image: 'https://placehold.co/300x300?text=Tesorero',
            },
          ].map((member, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg  shadow text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h4 className="font-semibold">{member.name}</h4>
              <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Consejo de Vigilancia</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Víctor Ojeda',
              role: 'Presidente',
              image: 'https://placehold.co/300x300?text=Presidente',
            },
            {
              name: 'Mayuri Troya',
              role: 'Vice-Presidente',
              image: 'https://placehold.co/300x300?text=Vicepresidente',
            },
            {
              name: 'Dora Castillo',
              role: 'Secretaria',
              image: 'https://placehold.co/300x300?text=Tesorero',
            },
          ].map((member, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h4 className="font-semibold">{member.name}</h4>
              <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">
          Consejo de Vigilancia (Suplentes)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Janeth Vera',
              role: 'Presidente',
              image: 'https://placehold.co/300x300?text=Presidente',
            },
            {
              name: 'Richard Landaeta',
              role: 'Vice-Presidente',
              image: 'https://placehold.co/300x300?text=Vicepresidente',
            },
            {
              name: 'Daysi Seijas',
              role: 'Secretaria',
              image: 'https://placehold.co/300x300?text=Tesorero',
            },
          ].map((member, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h4 className="font-semibold">{member.name}</h4>
              <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-4">Organigrama</h3>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">
            El organigrama detallado de CAPRES está disponible en formato PDF
            para su descarga desde la sección de Documentos.
          </p>
        </div>
      </section>
    </div>
  );
}
