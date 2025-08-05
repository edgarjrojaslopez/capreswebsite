// /lib/db/schema.js

import {
  mysqlTable,
  varchar,
  date,
  decimal,
  tinyint,
  datetime,
  text,
} from 'drizzle-orm/mysql-core';

/**
 * Tabla: socios
 * Contiene información principal del socio
 */
export const socios = mysqlTable('socios', {
  CodSocio: varchar('CodSocio', { length: 10 }).primaryKey(),
  avatar: varchar('avatar', { length: 255 }), // URL al avatar del socio
  NombreCompleto: varchar('NombreCompleto', { length: 255 }),
  NroCtaBanco: varchar('NroCtaBanco', { length: 20 }),
  Estatus: varchar('Estatus', { length: 1 }),
  FechaIng: date('FechaIng'),
  PorAporteS: decimal('PorAporteS', { precision: 10, scale: 2 }),
  PorAporteP: decimal('PorAporteP', { precision: 10, scale: 2 }),
  SaldoInicial: decimal('SaldoInicial', { precision: 10, scale: 2 }),
  SaldoActual: decimal('SaldoActual', { precision: 10, scale: 2 }),
  FecUltimoPrestamo: date('FecUltimoPrestamo'),
  Estado: tinyint('Estado'),
  Telefonos: varchar('Telefonos', { length: 255 }),
  FechaEgreso: date('FechaEgreso'),
  FechaRegistro: date('FechaRegistro'),
  Email: varchar('Email', { length: 255 }),
  password: varchar('password', { length: 255 }), // Contraseña del socio
  reset_token: varchar('reset_token', { length: 255 }),
  reset_token_expires: datetime('reset_token_expires'),
  rol: varchar('rol', { length: 50 }).default('socio').notNull(), // Rol del usuario (ej: 'socio', 'admin')
});

/**
 * Tabla: haberes
 * Contiene información sobre los aportes y haberes del socio
 */
export const haberes = mysqlTable('haberes', {
  codSocio: varchar('codSocio', { length: 10 }).primaryKey(),
  aporteS: decimal('aporteS', { precision: 10, scale: 2 }),
  aporteP: decimal('aporteP', { precision: 10, scale: 2 }),
  aporteV: decimal('aporteV', { precision: 10, scale: 2 }),
  retiroH: decimal('retiroH', { precision: 10, scale: 2 }),
  totalH: decimal('totalH', { precision: 10, scale: 2 }),
});

/**
 * Tabla: prestamos
 * Contiene los préstamos del socio
 * Puede haber múltiples préstamos por socio
 */
export const prestamos = mysqlTable('prestamos', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  codSocio: varchar('codSocio', { length: 10 }).notNull(),
  tipoPrest: varchar('tipoPrest', { length: 255 }),
  fechaPrest: date('fechaPrest'),
  montoPrest: decimal('montoPrest', { precision: 10, scale: 2 }),
  saldoPrest: decimal('saldoPrest', { precision: 10, scale: 2 }),
});

/**
 * Tabla: noticias
 * Contiene las noticias y comunicados del sitio web
 */
export const noticias = mysqlTable('noticias', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  titulo: varchar('titulo', { length: 255 }).notNull(),
  resumen: varchar('resumen', { length: 512 }),
  contenido: text('contenido').notNull(),
  imagenUrl: varchar('imagenUrl', { length: 255 }),
  fechaCreacion: datetime('fechaCreacion').notNull(),
});
