import type { RegistroHistorial } from "./historial.types";

const MESES_INACTIVIDAD = 5;

export function obtenerUltimaParticipacion(
  historial: RegistroHistorial[]
): Date | null {
  if (historial.length === 0) {
    return null;
  }

  return historial.reduce((ultima, registro) => {
    return registro.fecha > ultima ? registro.fecha : ultima;
  }, historial[0].fecha);
}

export function jugadorEstaInactivo(
  historial: RegistroHistorial[],
  fechaActual: Date = new Date()
): boolean {
  const ultimaParticipacion = obtenerUltimaParticipacion(historial);

  if (!ultimaParticipacion) {
    return true;
  }

  const fechaLimite = new Date(fechaActual);
  fechaLimite.setMonth(
    fechaLimite.getMonth() - MESES_INACTIVIDAD
  );

  return ultimaParticipacion < fechaLimite;
}