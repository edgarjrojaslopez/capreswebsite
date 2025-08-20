// components/DashboardContent.jsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Función para obtener token de cookie o localStorage
const getToken = () => {
  if (typeof window === 'undefined') return null;
  const cookieToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];
  return cookieToken || localStorage.getItem('token');
};

export default function DashboardContent({
  userData,
  haberesData,
  prestamosData,
  codSocio,
  token,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showLoanFormModal, setShowLoanFormModal] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState('');
  const [loanForm, setLoanForm] = useState({
    amount: '',
    reason: '',
  });
  const [avatar, setAvatar] = useState('/avatar-default.png');
  const [changePasswordModal, setChangePasswordModal] = useState(false);

  // Modal para retiro
  const [showRetiroFormModal, setShowRetiroFormModal] = useState(false);
  const [showRetiroModal, setShowRetiroModal] = useState(false);
  const [selectedRetiroType, setSelectedRetiroType] = useState('');
  const [retiroForm, setRetiroForm] = useState({
    amount: '',
    reason: '',
  });

  console.log('🔍 DashboardContent - Token:', token ? 'Presente' : 'Ausente');
  console.log('🔍 DashboardContent - codSocio:', codSocio);
  console.log('🔍 DashboardContent - userData:', userData);
  // console.log('🔍 Headers:', Object.fromEntries(request.headers.entries()));
  // console.log('🔍 Content-Type:', request.headers.get('content-type'));

  if (!userData || !codSocio) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">
          Error: No se pudieron cargar los datos del usuario
        </div>
      </div>
    );
  }

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Inválida';
    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  // Formatear números
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  // Calcular préstamos activos
  const totalPrestamos = prestamosData.reduce(
    (acc, p) => acc + p.saldoPrest,
    0
  );
  const ultimoPrestamo =
    prestamosData.length > 0 ? prestamosData[prestamosData.length - 1] : null;

  // Calcular disponible: 80% de haberes - préstamos activos
  const disponibleBase = (haberesData?.totalH || 0) * 0.8;
  const disponibleNeto = Math.max(0, disponibleBase - totalPrestamos);

  // Handlers
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const allowedFields = {
        Telefonos: form.Telefonos,
        Email: form.Email,
      };
      const res = await fetch(`/api/socios/${codSocio}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(allowedFields),
      });
      if (res.ok) {
        setEditing(false);
        alert('Datos actualizados correctamente');
      } else {
        alert('Error al actualizar los datos');
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Error de conexión');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`/api/socios/${codSocio}/avatar`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // NO pongas 'Content-Type'
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAvatar(data.avatarUrl);
      } else {
        throw new Error(data.error || 'Error al subir avatar');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('No se pudo guardar el avatar. Intenta de nuevo.');
    }
  };

  const handleEdit = () => {
    setForm({
      Telefonos: userData.Telefonos || '',
      Email: userData.Email || '',
    });
    setEditing(true);
  };

  const handleLoanTypeSelect = (loanType) => {
    setSelectedLoanType(loanType);
    setShowLoanModal(false);
    setShowLoanFormModal(true);
  };

  const handleLoanSubmit = async () => {
    if (!loanForm.amount || !loanForm.reason) {
      alert('Por favor completa todos los campos');
      return;
    }
    try {
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     to: 'support@capreswebsite.capres.com.ve',
      //     subject: `Solicitud de ${selectedLoanType.name} - ${
      //       userData.NombreCompleto || userData.CodSocio
      //     }`,
      //     html: htmlTemplate,
      //   }),
      // });
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: 'support@capreswebsite.capres.com.ve',
          subject: `Solicitud de ${selectedLoanType.name} - ${userData.NombreCompleto}`,
          userData, // ← Enviado completo
          selectedLoanType,
          loanForm,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(
          'Solicitud enviada correctamente. Recibirás una respuesta en los próximos días hábiles.'
        );
        setLoanForm({ amount: '', reason: '' });
        setShowLoanFormModal(false);
        setSelectedLoanType('');
      } else {
        throw new Error(data.error || 'Error al enviar el correo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar la solicitud. Inténtalo nuevamente.');
    }
  };

  const handleRetiroTypeSelect = (retiroType) => {
    setSelectedRetiroType(retiroType);
    setShowRetiroModal(false);
    setShowRetiroFormModal(true);
  };

  const handleRetiroSubmit = async () => {
    if (!retiroForm.reason.trim()) {
      alert('Por favor indica la razón del retiro');
      return;
    }

    let monto = 0;

    if (selectedRetiroType.id === 'parcial') {
      monto = parseFloat(retiroForm.amount);
      if (isNaN(monto) || monto <= 0) {
        alert('Ingresa un monto válido');
        return;
      }
      if (monto > disponibleNeto) {
        alert(`El monto no puede exceder Bs. ${formatNumber(disponibleNeto)}`);
        return;
      }
    } else {
      monto = disponibleNeto;
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: 'support@capreswebsite.capres.com.ve',
          subject: `Solicitud de Retiro de Haberes - ${userData.NombreCompleto}`,
          userData,
          tipoSolicitud: 'retiro',
          tipoRetiro: selectedRetiroType.id,
          montoSolicitado: monto,
          razon: retiroForm.reason,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(
          'Solicitud de retiro enviada correctamente. Será revisada en breve.'
        );
        setRetiroForm({ amount: '', reason: '' });
        setShowRetiroFormModal(false);
        setSelectedRetiroType('');
      } else {
        throw new Error(data.error || 'Error al enviar la solicitud');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud de retiro:', error);
      alert('No se pudo enviar la solicitud. Inténtalo más tarde.');
    }
  };

  useEffect(() => {
    // Si el backend ya devuelve el avatar en userData, úsalo
    if (userData?.avatar) {
      setAvatar(userData.avatar);
    }
    // Si no, puedes hacer una petición para obtenerlo
    // Pero lo ideal es que ya venga en `userData`
  }, [userData?.avatar]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* === ENCABEZADO CENTRADO === */}
        {/* === ENCABEZADO CENTRADO Y ALINIADO CORRECTAMENTE === */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col lg:flex-row items-center lg:items-start gap-8 border border-gray-100">
          {/* Avatar, nombre, cédula, fecha - Ahora centrado en todos los dispositivos */}
          <div className="flex flex-col items-center text-center lg:items-center lg:text-left w-full lg:w-auto">
            <div className="relative mb-4 group">
              <img
                src={avatar}
                alt="Avatar"
                className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-xl transition-transform duration-300 group-hover:scale-105"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              {userData.NombreCompleto}
            </h2>
            <p className="text-gray-600 font-medium mb-1">
              <span className="font-semibold">Cédula:</span> {userData.CodSocio}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Ingreso:</span>{' '}
              {formatDate(userData.FechaIng)}
            </p>
          </div>

          {/* Tarjetas de saldos */}
          <div className="w-full lg:flex-1 space-y-4 mt-6 lg:mt-0">
            {/* [Las tarjetas permanecen igual] */}
            <DashboardCard
              title="Total Haberes"
              value={formatNumber(haberesData?.totalH)}
              icon="💰"
              color="from-blue-500 to-blue-600"
              description="Tu acumulado total"
            />
            <DashboardCard
              title="Disponible para Retiro/Préstamo"
              value={formatNumber(disponibleNeto)}
              icon="💳"
              color="from-emerald-500 to-emerald-600"
              description={
                totalPrestamos > 0
                  ? `80% (${formatNumber(
                      disponibleBase
                    )}) - préstamos activos (${formatNumber(totalPrestamos)})`
                  : '80% de tus haberes totales'
              }
            />
            <DashboardCard
              title="Último Retiro"
              value={formatNumber(haberesData?.retiroH)}
              icon="💵"
              color="from-green-500 to-green-600"
              description="Monto más reciente"
            />
            <DashboardCard
              title="Aporte Socio"
              value={formatNumber(haberesData?.aporteS)}
              icon="🧍"
              color="from-yellow-500 to-yellow-600"
              description="Tu contribución mensual"
            />
            <DashboardCard
              title="Aporte Patrono"
              value={formatNumber(haberesData?.aporteP)}
              icon="🏢"
              color="from-purple-500 to-purple-600"
              description="Aporte de la empresa"
            />
          </div>
        </div>
        {/* === ÚLTIMO PRÉSTAMO ACTIVO (SI EXISTE) === */}
        {ultimoPrestamo && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-5 shadow-md">
            <h4 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
              🔥 Último Préstamo Activo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Tipo:</span>{' '}
                <span className="text-gray-800">
                  {ultimoPrestamo.tipoPrest}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Monto:</span>{' '}
                <span className="text-gray-800 font-bold">
                  {formatNumber(ultimoPrestamo.montoPrest)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Fecha:</span>{' '}
                <span className="text-gray-800">
                  {formatDate(ultimoPrestamo.fechaPrest)}
                </span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Saldo pendiente:{' '}
              <span className="font-semibold">
                {formatNumber(ultimoPrestamo.saldoPrest)}
              </span>
            </div>
          </div>
        )}
        {/* === ALERTA DE CONTRASEÑA TEMPORAL === */}
        {userData.password === 'password123' && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-6 border-yellow-500 text-yellow-800 p-5 rounded-xl shadow-md">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3 text-yellow-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h4 className="text-lg font-semibold">
                  ¡Cambia tu contraseña!
                </h4>
                <p className="mt-1">
                  Estás usando una contraseña temporal. Por tu seguridad,{' '}
                  <button
                    onClick={() => setChangePasswordModal(true)}
                    className="text-blue-600 underline font-medium hover:text-blue-800"
                  >
                    cámbiala ahora
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>
        )}
        {/* === INFORMACIÓN PERSONAL === */}
        <section className="bg-white rounded-3xl shadow-lg p-7 border border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <DetailItem label="Cédula" value={userData.CodSocio} />
            <DetailItem
              label="Fecha de Ingreso"
              value={formatDate(userData.FechaIng)}
            />
            <DetailItem
              label="Cuenta Bancaria"
              value={userData.NroCtaBanco || 'No registrada'}
            />
            <DetailItem
              label="Teléfono"
              value={userData.Telefonos || 'No registrado'}
            />
            <DetailItem
              label="Email"
              value={userData.Email || 'No registrado'}
            />
          </div>
          <button
            onClick={handleEdit}
            className="mt-6 py-3 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            ✏️ Editar Datos
          </button>
        </section>
        {/* === SECCIÓN DE ADMINISTRACIÓN (SOLO PARA ADMINS) === */}
        {userData.rol === 'admin' && (
          <section className="bg-white rounded-3xl shadow-lg p-7 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Panel de Administración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href="/dashboard/admin/noticias"
                className="flex items-center justify-center p-6 bg-blue-50 rounded-xl shadow hover:bg-blue-100 transition-all duration-200"
              >
                <span className="text-blue-600 text-lg font-semibold">
                  📰 Gestionar Noticias
                </span>
              </Link>
            </div>
          </section>
        )}{' '}
        {/* ← Aquí faltaba el paréntesis de cierre */}
        {/* === PRÉSTAMOS ACTIVOS === */}
        <section className="bg-white rounded-3xl shadow-lg p-7 border border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            Préstamos Activos
          </h3>

          {prestamosData.length > 0 ? (
            <div className="space-y-6">
              {prestamosData.map((p, i) => {
                const porcentajePagado =
                  ((p.montoPrest - p.saldoPrest) / p.montoPrest) * 100;
                return (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-r from-white to-gray-50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                      <span className="font-bold text-lg text-gray-800">
                        {p.tipoPrest}
                      </span>
                      <span className="text-red-600 font-extrabold text-xl mt-2 sm:mt-0">
                        {formatNumber(p.saldoPrest)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {formatNumber(p.montoPrest - p.saldoPrest)} pagado de{' '}
                      {formatNumber(p.montoPrest)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.max(0, porcentajePagado)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Fecha: {formatDate(p.fechaPrest)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto mb-4 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h4 className="text-xl font-medium mb-4">
                No tienes préstamos activos
              </h4>
              <p className="mb-6">
                ¿Necesitas un préstamo? Solicítalo fácilmente desde aquí.
              </p>
              <button
                onClick={() => setShowLoanModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                💰 Solicitar Préstamo
              </button>
            </div>
          )}
        </section>
        {/* === RETIRO DE HABERES === */}
        <section className="bg-white rounded-3xl shadow-lg p-7 border border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9l-7 7-7-7m14 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9"
              />
            </svg>
            Retiro de Haberes
          </h3>

          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-4 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h18M3 14h18m-9-4v8m-7-4h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z"
              />
            </svg>
            <h4 className="text-xl font-medium mb-4">
              ¿Deseas retirar tus haberes?
            </h4>
            <p className="mb-6 max-w-md mx-auto">
              Puedes solicitar un <strong>retiro parcial</strong> (hasta el 80%
              de tus haberes) o un <strong>retiro total</strong> (baja del
              sistema).
            </p>
            <button
              onClick={() => setShowRetiroModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              💵 Solicitar Retiro
            </button>
          </div>
        </section>
        {/* === MODALES === */}
        {editing && (
          <EditModal
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        )}
        {showLoanModal && (
          <LoanTypeModal
            onClose={() => setShowLoanModal(false)}
            onSelectType={handleLoanTypeSelect}
          />
        )}
        {showLoanFormModal && (
          <LoanFormModal
            loanType={selectedLoanType}
            form={loanForm}
            setForm={setLoanForm}
            onSubmit={handleLoanSubmit}
            onClose={() => {
              setShowLoanFormModal(false);
              setSelectedLoanType('');
              setLoanForm({ amount: '', reason: '' });
            }}
          />
        )}
        {showRetiroModal && (
          <RetiroTypeModal
            onClose={() => setShowRetiroModal(false)}
            onSelectType={handleRetiroTypeSelect}
            disponibleNeto={disponibleNeto}
            formatNumber={formatNumber}
          />
        )}
        {showRetiroFormModal && (
          <RetiroFormModal
            retiroType={selectedRetiroType}
            form={retiroForm}
            setForm={setRetiroForm}
            onSubmit={handleRetiroSubmit}
            onClose={() => {
              setShowRetiroFormModal(false);
              setSelectedRetiroType('');
              setRetiroForm({ amount: '', reason: '' });
            }}
            disponibleNeto={disponibleNeto}
            formatNumber={formatNumber}
          />
        )}
        {changePasswordModal && (
          <ChangePasswordModal
            onClose={() => setChangePasswordModal(false)}
            onSuccess={() => {
              setChangePasswordModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// === COMPONENTES REUTILIZABLES ===

function DashboardCard({ title, value, icon, color, description }) {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs opacity-80 mt-1">{description}</p>
        </div>
        <div className="text-5xl opacity-90 drop-shadow-md">{icon}</div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 hover:rounded px-2 transition">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) =>
          onChange((prev) => ({ ...prev, [name]: e.target.value }))
        }
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition"
      />
    </div>
  );
}

function EditModal({ form, setForm, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          ✏️ Editar Datos
        </h3>
        <div className="space-y-5">
          <InputField
            label="Teléfono"
            name="Telefonos"
            value={form.Telefonos}
            onChange={setForm}
          />
          <InputField
            label="Email"
            name="Email"
            value={form.Email}
            onChange={setForm}
            type="email"
          />
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function SimpleInputField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition"
      />
    </div>
  );
}

function ChangePasswordModal({ onClose, onSuccess }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPass !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPass.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      const token = getToken();
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: newPass,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('¡Contraseña actualizada!');
        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      } else {
        setError(data.error?.message || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          🔐 Cambiar Contraseña
        </h3>
        {success ? (
          <div className="text-center py-6 text-green-600 font-medium text-lg">
            ✅ {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            <SimpleInputField
              label="Contraseña Actual"
              name="current"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              type="password"
            />
            <SimpleInputField
              label="Nueva Contraseña"
              name="new"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              type="password"
            />
            <SimpleInputField
              label="Confirmar Contraseña"
              name="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition"
              >
                Cambiar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function LoanTypeModal({ onClose, onSelectType }) {
  const loanTypes = [
    {
      id: 'short',
      name: 'Préstamo a Corto Plazo',
      description: 'Hasta 12 meses - 8% anual',
      maxAmount: '80% de tus haberes',
      icon: '⚡',
    },
    {
      id: 'medium',
      name: 'Préstamo a Mediano Plazo',
      description: 'Hasta 24 meses - 10% anual',
      maxAmount: '80% de tus haberes',
      icon: '📈',
    },
    {
      id: 'long',
      name: 'Préstamo a Largo Plazo',
      description: 'Hasta 36 meses - 12% mensual',
      maxAmount: '80% de tus haberes',
      icon: '🏦',
    },
    {
      id: 'special',
      name: 'Préstamo Especial',
      description: 'Educativo, médico o familiar',
      maxAmount: '80% de tus haberes',
      icon: '⭐',
    },
  ];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-7">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            💰 Tipos de Préstamo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="grid gap-4">
          {loanTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelectType(type)}
              className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{type.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {type.description}
                  </p>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    Monto máximo: {type.maxAmount}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoanFormModal({ loanType, form, setForm, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {loanType.icon} {loanType.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Solicitado (Bs.)
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa el monto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón del Préstamo
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe el motivo del préstamo"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Enviar Solicitud
          </button>
        </div>
      </div>
    </div>
  );
}

function RetiroTypeModal({
  onClose,
  onSelectType,
  disponibleNeto,
  formatNumber,
}) {
  const tipos = [
    {
      id: 'parcial',
      name: 'Retiro Parcial',
      description: 'Hasta el 80% de tus haberes totales',
      icon: '💰',
      maxAmount:
        disponibleNeto === 0
          ? 'No disponible'
          : `Máx: Bs. ${formatNumber(disponibleNeto)}`,
    },
    {
      id: 'total',
      name: 'Retiro Total',
      description: 'Saldo completo (baja del sistema)',
      icon: '🏦',
      maxAmount: disponibleNeto === 0 ? 'No disponible' : 'Total disponible',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-7">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            💵 Tipo de Retiro
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="grid gap-4">
          {tipos.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => onSelectType(tipo)}
              className="text-left p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tipo.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{tipo.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {tipo.description}
                  </p>
                  <p className="text-sm font-medium text-green-600 mt-1">
                    {tipo.maxAmount}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RetiroFormModal({
  retiroType,
  form,
  setForm,
  onSubmit,
  onClose,
  disponibleNeto,
  formatNumber,
}) {
  const isParcial = retiroType.id === 'parcial';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {retiroType.icon} {retiroType.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="space-y-5">
          {isParcial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto a Retirar (Bs.)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={
                  disponibleNeto === 0
                    ? 'No disponible'
                    : `Hasta ${formatNumber(disponibleNeto)}`
                }
                min="0"
                max={disponibleNeto}
                step="0.01"
              />
            </div>
          )}

          {!isParcial && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              <strong>Retiro Total:</strong> Solicitarás el 100% de tu saldo
              disponible.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón del Retiro
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Indica el motivo del retiro"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Enviar Solicitud
          </button>
        </div>
      </div>
    </div>
  );
}
