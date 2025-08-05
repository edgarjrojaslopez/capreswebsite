// components/DelegatesPage.jsx
// Delegates Page Component
export default function DelegatesPage() {
  const regions = [
    { name: 'Los Andes', delegates: 1 },
    { name: 'Zuliana', delegates: 2 },
    { name: 'Nor-Oriental', delegates: 1 },
    { name: 'Capital', delegates: 4 },
    { name: 'Insular', delegates: 1 },
    { name: 'Guayana', delegates: 1 },
  ];

  const delegates = [
    {
      region: 'Región Los Andes',

      nombre: 'Mariela Carrero',

      cedula: '5.446.421',
    },

    {
      region: 'Aduana Marítima de Maracaibo',

      nombre: 'Anelsis Quintero',

      cedula: '7.713.948',
    },

    {
      region: 'Región Capital',

      nombre: 'Yenis Carreño',

      cedula: '10.470.037',
    },

    {
      region: 'Gerencia de Contribuyentes Especiales',

      nombre: 'Tulio Colina',

      cedula: '11.941.120',
    },

    {
      region: 'Nivel Normativo',

      nombre: 'Adabel Becerra',

      cedula: '14.472.836',
    },

    {
      region: 'Región lnsular de Tributos Internos',

      nombre: 'Luis Cardona',

      cedula: '12.672.797',
    },

    {
      region: 'Región   Nor-Oriental',

      nombre: 'Juan  Pineda',

      cedula: '8.479.968',
    },

    {
      region: 'Aduana Aérea de Maiquetía',

      nombre: 'Marianela Salazar',

      cedula: '12.460.212',
    },

    {
      region: 'Región Guayana, Aduana',

      nombre: 'Deiby Barrios',

      cedula: '6.445.946',
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Delegados Regionales</h2>

      <section className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p>
            Los delegados son representantes electos por los socios para
            participar en las asambleas y reuniones de la junta directiva. Su
            función principal es defender los intereses de los socios de su
            región y servir como enlace entre los asociados y la administración.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-4">Lista de Delegados</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Región
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cédula
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {delegates.map((delegate, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {delegate.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {delegate.nombre}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {delegate.cedula}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
