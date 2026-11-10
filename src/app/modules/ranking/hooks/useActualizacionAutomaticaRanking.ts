import { useEffect } from "react";

import { actualizarTodosLosRankings } from "../../../../application/ranking/actualizarRankingsCircuito";

const CLAVE = "foxren:ranking:ultimaActualizacion";
const INTERVALO_MS = 15 * 60 * 1000;

function leerUltima(): number {
  try {
    return Number(window.sessionStorage.getItem(CLAVE)) || 0;
  } catch {
    return 0;
  }
}

function guardarUltima(valor: number) {
  try {
    if (valor) window.sessionStorage.setItem(CLAVE, String(valor));
    else window.sessionStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento disponible: se recalcula en cada visita, no pasa nada.
  }
}

/**
 * Recalcula en segundo plano los rankings y perfiles públicos al entrar al panel
 * de administración, si pasaron más de 15 minutos desde la última vez.
 * Solo debe montarse dentro del área protegida del superadmin: el cálculo lee
 * datos privados de jugadores.
 */
export function useActualizacionAutomaticaRanking(habilitado = true) {
  useEffect(() => {
    if (!habilitado) return;
    const ahora = Date.now();
    if (ahora - leerUltima() < INTERVALO_MS) return;

    // Se marca antes de empezar para no duplicar el cálculo si el efecto corre dos veces.
    guardarUltima(ahora);
    actualizarTodosLosRankings().catch((error) => {
      guardarUltima(0);
      console.error("No se pudo actualizar el ranking público:", error);
    });
  }, [habilitado]);
}
