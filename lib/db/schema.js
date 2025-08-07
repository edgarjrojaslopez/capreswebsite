// lib/db/schema.js

import {
  mysqlTableCreator,
  varchar,
  decimal,
  date,
  boolean,
  text,
  datetime,
  int,
  timestamp,
} from 'drizzle-orm/mysql-core';

const mysqlTable = mysqlTableCreator((name) => name);

// 👇 Todas tus tablas convertidas

export const socios = mysqlTable('socios', {
  CodSocio: varchar('CodSocio', { length: 10 }).primaryKey(),
  avatar: varchar('avatar', { length: 255 }),
  NombreCompleto: varchar('NombreCompleto', { length: 255 }),
  NroCtaBanco: varchar('NroCtaBanco', { length: 20 }),
  Estatus: varchar('Estatus', { length: 1 }),
  FechaIng: date('FechaIng'),
  PorAporteS: decimal('PorAporteS', { precision: 10, scale: 2 }),
  PorAporteP: decimal('PorAporteP', { precision: 10, scale: 2 }),
  SaldoInicial: decimal('SaldoInicial', { precision: 10, scale: 2 }),
  SaldoActual: decimal('SaldoActual', { precision: 10, scale: 2 }),
  FecUltimoPrestamo: date('FecUltimoPrestamo'),
  Estado: boolean('Estado'),
  Telefonos: varchar('Telefonos', { length: 255 }),
  FechaEgreso: date('FechaEgreso'),
  FechaRegistro: date('FechaRegistro'),
  Email: varchar('Email', { length: 255 }),
  password: varchar('password', { length: 255 }),
  rol: varchar('rol', { length: 50 }).default('socio').notNull(),
});

export const haberes = mysqlTable('haberes', {
  codSocio: varchar('codSocio', { length: 10 }).primaryKey(),
  aporteS: decimal('aporteS', { precision: 10, scale: 2 }),
  aporteP: decimal('aporteP', { precision: 10, scale: 2 }),
  aporteV: decimal('aporteV', { precision: 10, scale: 2 }),
  retiroH: decimal('retiroH', { precision: 10, scale: 2 }),
  totalH: decimal('totalH', { precision: 10, scale: 2 }),
});

export const prestamos = mysqlTable('prestamos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  codSocio: varchar('codSocio', { length: 10 }).notNull(),
  tipoPrest: varchar('tipoPrest', { length: 255 }),
  fechaPrest: date('fechaPrest'),
  montoPrest: decimal('montoPrest', { precision: 10, scale: 2 }),
  saldoPrest: decimal('saldoPrest', { precision: 10, scale: 2 }),
});

export const passwordResetTokens = mysqlTable('passwordResetTokens', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('userId', { length: 10 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const noticias = mysqlTable('noticias', {
  id: varchar('id', { length: 36 }).primaryKey(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  resumen: varchar('resumen', { length: 512 }),
  contenido: text('contenido'),
  imagenUrl: varchar('imagenUrl', { length: 255 }),
  fechaCreacion: datetime('fechaCreacion').notNull(),
});

// Exporta el esquema completo para Drizzle
export const schema = {
  socios,
  haberes,
  prestamos,
  passwordResetTokens,
  noticias,
};
