// scripts/migrate-passwords.js

const { db } = require('../../lib/db');
const { socios } = require('../../lib/db/schema');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function migratePasswords() {
  try {
    // Obtener todos los socios con contraseña en texto plano
    const sociosConPassword = await db
      .select()
      .from(socios)
      .where(socios.password.like('password%')); // Ajusta si es necesario

    if (sociosConPassword.length === 0) {
      console.log('✅ No hay contraseñas en texto plano para migrar.');
      return;
    }

    for (const socio of sociosConPassword) {
      const hashed = await bcrypt.hash('password123', SALT_ROUNDS);
      await db
        .update(socios)
        .set({ password: hashed })
        .where(socios.CodSocio.eq(socio.CodSocio));

      console.log(`✅ Contraseña hasheada para socio: ${socio.CodSocio}`);
    }

    console.log('✅ Migración de contraseñas completada');
  } catch (error) {
    console.error('❌ Error al migrar contraseñas:', error);
  } finally {
    process.exit();
  }
}

migratePasswords();
