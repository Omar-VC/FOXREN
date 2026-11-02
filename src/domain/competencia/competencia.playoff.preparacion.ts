import type { FormatoPartido, Partido } from "../partido/partido.types";
import type { Resultado } from "../resultado/resultado.types";
import type { Zona } from "./competencia.zonas.types";
import type { CriterioDesempateZona } from "./competencia.types";
import type { TipoFormatoCompetencia } from "./competencia.formato.types";
import type { ClasificadoZona, CuadroPlayoff } from "./competencia.playoff.types";
import { calcularTablaZona, clasificarParejasZona } from "./competencia.tabla.ts";
import {
  generarCuadro,
  sembrarDesdeZonas,
  sortearSiembra,
} from "./competencia.playoff.rules.ts";

export interface EntradaPlanPlayoff {
  competenciaId: string;
  formato: TipoFormatoCompetencia;
  /** Parejas activas de la competencia (solo se usa en eliminación directa pura). */
  parejaIdsActivas: string[];
  zonas: Zona[];
  /** Partidos de la competencia (se filtran por zona). */
  partidos: Partido[];
  resultados: Resultado[];
  parejasClasificanPorZona: number;
  formatoPartidoZona: FormatoPartido;
  criteriosDesempate?: CriterioDesempateZona[];
  /** Semilla del sorteo (eliminación directa pura). Se guarda para poder reproducirlo. */
  semilla: number;
}

export type PlanPlayoff =
  | { ok: true; cuadro: CuadroPlayoff; siembra: string[] }
  | { ok: false; bloqueos: string[] };

function bloqueado(...bloqueos: string[]): PlanPlayoff {
  return { ok: false, bloqueos };
}

/**
 * Decide si el playoff se puede armar y, si se puede, devuelve la llave completa.
 * No toca Firestore: recibe todo lo necesario y devuelve el plan o los motivos
 * por los que está bloqueado (zonas incompletas, empate en el corte, etc.).
 */
export function planificarPlayoff(entrada: EntradaPlanPlayoff): PlanPlayoff {
  if (entrada.formato === "eliminacion_directa") {
    if (entrada.parejaIdsActivas.length < 2) {
      return bloqueado("Se necesitan al menos dos parejas activas para generar la llave.");
    }
    // Se ordena antes de sortear: el mismo sorteo (misma semilla) da siempre lo mismo.
    const ordenadas = [...entrada.parejaIdsActivas].sort();
    const siembra = sortearSiembra(ordenadas, entrada.semilla);
    return { ok: true, siembra, cuadro: generarCuadro(entrada.competenciaId, siembra) };
  }

  if (entrada.zonas.length === 0) {
    return bloqueado("Primero hay que generar las zonas.");
  }

  const clasifican = entrada.parejasClasificanPorZona;
  const bloqueos: string[] = [];
  const clasificados: ClasificadoZona[] = [];

  for (const zona of [...entrada.zonas].sort((a, b) => a.orden - b.orden)) {
    if (zona.parejaIds.length <= clasifican) {
      bloqueos.push(
        `${zona.nombre} tiene ${zona.parejaIds.length} parejas: no pueden clasificar ${clasifican}.`,
      );
      continue;
    }

    try {
      const idsPartidosZona = new Set(
        entrada.partidos.filter((p) => p.zonaId === zona.id).map((p) => p.id),
      );
      const tabla = calcularTablaZona(
        zona,
        entrada.partidos,
        entrada.resultados.filter((r) => idsPartidosZona.has(r.partidoId)),
        entrada.criteriosDesempate,
        entrada.formatoPartidoZona,
      );

      if (!tabla.completa) {
        bloqueos.push(
          `${zona.nombre}: faltan ${tabla.partidosPendientes} partido(s) con resultado oficial.`,
        );
        continue;
      }

      const clasificacion = clasificarParejasZona(tabla, clasifican, entrada.criteriosDesempate);
      if (clasificacion.bloqueadaPorEmpate) {
        bloqueos.push(
          `${zona.nombre}: hay un empate total en el corte de clasificación entre ${clasificacion.empateEnCorte.length} parejas. Debe resolverse antes de armar el playoff.`,
        );
        continue;
      }

      for (const parejaId of clasificacion.clasificados) {
        const fila = tabla.filas.find((f) => f.parejaId === parejaId)!;
        clasificados.push({
          parejaId,
          zonaId: zona.id,
          posicion: fila.posicion,
          partidosJugados: fila.partidosJugados,
          victorias: fila.victorias,
          diferenciaSets: fila.diferenciaSets,
          diferenciaGames: fila.diferenciaGames,
        });
      }
    } catch (error) {
      bloqueos.push(
        `${zona.nombre}: ${error instanceof Error ? error.message : "no se pudo calcular la tabla."}`,
      );
    }
  }

  if (bloqueos.length > 0) return { ok: false, bloqueos };
  if (clasificados.length < 2) {
    return bloqueado("Se necesitan al menos dos parejas clasificadas para armar el playoff.");
  }

  const siembra = sembrarDesdeZonas(clasificados, entrada.semilla);
  return { ok: true, siembra, cuadro: generarCuadro(entrada.competenciaId, siembra) };
}
