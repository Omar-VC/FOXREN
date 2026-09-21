export type EstadoTorneo = 'INSCRIPCION_ABIERTA' | 'PROXIMO' | 'EN_JUEGO' | 'FINALIZADO' | 'CANCELADO';

export interface DatosPagoTorneo {
  alias?: string;
  cbu?: string;
  titular?: string;
}

export interface Torneo {
  id: string;
  nombre: string;
  circuitoId?: string;
  sede: string;
  premios?: string;
  estado: string;
  validoParaRanking?: boolean;
  fechaInicio?: any;
  fechaFin?: any;
  fechaCreacion?: any;
  aliasPago?: string;
  alias?: string;
  datosPago?: {
    alias?: string;
    cbu?: string;
    titular?: string;
  };
  organizadorLlaveId?: string;
  organizadorId?: string;
  contactoOrganizador?: string;
  comisionPorcentaje?: number;
  gananciaEstimadaFoxren?: number;
  modalidadPago?: string;
}