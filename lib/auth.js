import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashea una contraseña en texto plano.
 * @param {string} password - La contraseña a hashear.
 * @returns {Promise<string>} El hash de la contraseña.
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano con un hash.
 * @param {string} password - La contraseña en texto plano.
 * @param {string} hash - El hash guardado en la base de datos.
 * @returns {Promise<boolean>} True si las contraseñas coinciden.
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export const logout = () => {
  // Limpiar localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userData');

  // Limpiar cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Redirigir al login
  window.location.href = '/login';
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;

  // Intentar obtener de cookie primero
  const cookieToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];

  return cookieToken || localStorage.getItem('token');
};
