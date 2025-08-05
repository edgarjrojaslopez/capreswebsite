import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Bloque para verificar la conexión al iniciar la aplicación.
// Esto te ayudará a saber inmediatamente si el problema es la conexión a la BD.
pool
  .getConnection()
  .then((connection) => {
    console.log('✅ Conexión a la base de datos establecida con éxito.');
    connection.release(); // Libera la conexión de vuelta al pool
  })
  .catch((err) => {
    console.error('❌ Error al conectar con la base de datos:', err.message);
  });

export const db = drizzle(pool);
