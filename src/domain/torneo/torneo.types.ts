// src/domain/torneo/torneo.types.ts

export type EstadoTorneo = 
  | 'PENDIENTE_APROBACION' 
  | 'APROBADO' 
  | 'RECHAZADO' 
  | 'ARCHIVADO';

export interface DatosPagoTorneo {
  alias?: string;
  cbu?: string;
  titular?: string;
}

export interface Torneo {
  id: string;
  nombre: string;
  circuitoId: string;
  sede: string;
  premios?: string;
  estado: EstadoTorneo;
  validoParaRanking?: boolean;
  fechaInicio?: any;
  fechaFin?: any;
  fechaCreacion?: any;
  datosPago?: DatosPagoTorneo;
  organizadorLlaveId?: string;
  organizadorId?: string;
  contactoOrganizador?: string;
  comisionPorcentaje?: number;
  gananciaEstimadaFoxren?: number;
  modalidadPago?: string;
  alias?: string;
  aliasPago?: string;
}