import type { ModoAsignacionZonas } from "./competencia.formato.types";

export interface Zona {
  id: string;
  competenciaId: string;
  nombre: string;
  parejaIds: string[];
  orden: number;
}

export interface ConfiguracionZonas {
  modoAsignacion: ModoAsignacionZonas;
  cantidadZonas: number;
  parejasPorZona: number[];
  parejasClasificanPorZona: number;
}