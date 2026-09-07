// src/domain/circuito/circuito.types.ts

export type EstadoCircuito = 'activo' | 'inactivo' | 'finalizado';

export interface Circuito {
  id: string;
  nombre: string;
  descripcion?: string;
  temporada: string; // ej: "2026"
  logoUrl?: string;
  estado: EstadoCircuito;
  fechaCreacion: Date;
}

export interface LlaveOrganizador {
  id: string;
  codigo: string; // Código único generado para el organizador
  circuitoId: string;
  nombreOrganizador: string;
  emailOrganizador: string;
  activa: boolean;
  fechaEmision: Date;
  fechaExpiracion?: Date;
}