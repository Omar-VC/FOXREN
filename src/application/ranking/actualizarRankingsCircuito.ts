import { collection, doc, getDocs, writeBatch } from "firebase/firestore";

import { auth, db } from "../../infrastructure/firebase/firebase";
import { FOXREN_OWNER_UID } from "../../infrastructure/firebase/adminIdentity";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";
import { circuitosRepository } from "../../infrastructure/repositories/circuitosRepository";
import { torneosRepository } from "../../infrastructure/repositories/torneosRepository";
import { competenciasRepository } from "../../infrastructure/repositories/competenciasRepository";
import { partidosRepository } from "../../infrastructure/repositories/partidosRepository";
import { parejasRepository } from "../../infrastructure/repositories/parejasRepository";
import { jugadoresRepository } from "../../infrastructure/repositories/jugadoresRepository";

import type { Circuito } from "../../domain/circuito/circuito.types";
import type { GeneroCompetencia } from "../../domain/competencia/competencia.types";
import { categoriaEfectivaCompetencia } from "../../domain/ranking/ranking.puntos";
import {
  calcularRankingGenero,
  competenciaCuentaParaRanking,
  construirFilasPublicas,
  idRankingPublico,
  jugadorEsPublicable,
  jugadorParaRanking,
} from "../../domain/ranking/ranking.circuito";
import type { RankingPublico } from "../../domain/ranking/ranking.circuito";
import { sincronizarPadron } from "../padron/sincronizarPadron";
import { calcularIdPublico } from "../../domain/jugador/jugador.idPublico";
import { calcularParticipaciones } from "../../domain/jugador/jugador.estadisticas";
import type { CompetenciaParaPerfil } from "../../domain/jugador/jugador.estadisticas";
import { construirPerfilPublico } from "../../domain/jugador/jugador.perfilPublico";
import type { PosicionPublica } from "../../domain/jugador/jugador.perfilPublico";

/** Colecciones de solo lectura para la web pública: nunca guardan datos privados. */
export const COLECCION_RANKINGS_PUBLICOS = COLLECTIONS.rankingsPublicos;
export const COLECCION_PERFILES_PUBLICOS = COLLECTIONS.jugadoresPublicos;

const GENEROS: GeneroCompetencia[] = ["MASCULINO", "FEMENINO", "MIXTO"];
const MAXIMO_POR_LOTE = 400;

/** Qué se publicó, para poder explicarlo en pantalla cuando el ranking sale vacío. */
export interface ResumenRanking {
  circuitoNombre: string;
  jugadoresTotales: number;
  jugadoresConPermiso: number;
  filasPorGenero: Record<GeneroCompetencia, number>;
}

export interface ResultadoRankingCircuito {
  circuitoId: string;
  circuitoNombre: string;
  resumen?: ResumenRanking;
  error?: string;
}

/** Lee todas las competencias de un circuito con sus partidos y parejas. */
async function cargarCompetenciasDelCircuito(
  circuito: Circuito,
): Promise<CompetenciaParaPerfil[]> {
  const torneos = await torneosRepository.obtenerTorneosPorCircuito(circuito.id);

  const porTorneo = await Promise.all(
    torneos.map(async (torneo) => ({
      torneo,
      competencias: await competenciasRepository.obtenerPorTorneoId(torneo.id),
    })),
  );

  const lista = porTorneo.flatMap(({ torneo, competencias }) =>
    competencias
      .filter((competencia) => competenciaCuentaParaRanking(competencia.estado))
      .map((competencia) => ({ torneo, competencia })),
  );

  return Promise.all(
    lista.map(async ({ torneo, competencia }) => {
      const [partidos, parejas] = await Promise.all([
        partidosRepository.getByCompetencia(competencia.id),
        parejasRepository.obtenerPorCompetenciaId(competencia.id),
      ]);

      return {
        competenciaId: competencia.id,
        genero: competencia.genero,
        estado: competencia.estado,
        categoria: categoriaEfectivaCompetencia(
          competencia.tipoReglaCategoria,
          competencia.valorReglaCategoria,
        ),
        partidos,
        parejas: parejas.map((pareja) => ({
          id: pareja.id,
          jugador1Id: pareja.jugador1Id,
          jugador2Id: pareja.jugador2Id,
          estado: pareja.estado,
        })),
        torneoNombre: torneo.nombre,
        competenciaNombre: competencia.nombre,
        circuitoNombre: circuito.nombre,
      };
    }),
  );
}

/** Escribe documentos en lotes y borra los de la colección que ya no corresponden. */
async function reemplazarColeccion(
  coleccion: string,
  documentos: Map<string, object>,
): Promise<void> {
  const existentes = await getDocs(collection(db, coleccion));
  const operaciones: Array<(lote: ReturnType<typeof writeBatch>) => void> = [];

  for (const [id, datos] of documentos) {
    operaciones.push((lote) => lote.set(doc(db, coleccion, id), datos));
  }
  for (const existente of existentes.docs) {
    if (!documentos.has(existente.id)) {
      operaciones.push((lote) => lote.delete(existente.ref));
    }
  }

  for (let i = 0; i < operaciones.length; i += MAXIMO_POR_LOTE) {
    const lote = writeBatch(db);
    for (const operacion of operaciones.slice(i, i + MAXIMO_POR_LOTE)) operacion(lote);
    await lote.commit();
  }
}

/**
 * Recalcula y publica los rankings de todos los circuitos (uno por género) y el
 * perfil de cada jugador con permiso de publicación vigente. Los jugadores activos
 * figuran aunque no hayan jugado, con sus puntos iniciales.
 *
 * Un circuito que falle no impide publicar los demás: el error queda en su resultado.
 */
export async function actualizarTodosLosRankings(): Promise<ResultadoRankingCircuito[]> {
  const [circuitos, jugadores] = await Promise.all([
    circuitosRepository.obtenerCircuitos(),
    jugadoresRepository.obtenerJugadores(),
  ]);

  // Mantiene al día la lista que ven los complejos; si falla, no frena el ranking.
  await sincronizarPadron(jugadores).catch((error) =>
    console.error("No se pudo sincronizar el padrón de jugadores:", error),
  );

  const publicables = jugadores.filter(jugadorEsPublicable);
  const paraRanking = publicables.map(jugadorParaRanking);
  const idsPublicos = new Map(
    await Promise.all(
      publicables.map(async (jugador) => [jugador.id, await calcularIdPublico(jugador.id)] as const),
    ),
  );

  const resultados: ResultadoRankingCircuito[] = [];
  const rankings = new Map<string, RankingPublico>();
  const competenciasTodas: CompetenciaParaPerfil[] = [];
  const posicionesPorJugador = new Map<string, PosicionPublica[]>();
  const actualizadoEn = new Date();

  for (const circuito of circuitos) {
    try {
      const competencias = await cargarCompetenciasDelCircuito(circuito);
      competenciasTodas.push(...competencias);

      const filasPorGenero = { MASCULINO: 0, FEMENINO: 0, MIXTO: 0 };

      for (const genero of GENEROS) {
        const filas = calcularRankingGenero(competencias, paraRanking, genero);
        const filasPublicas = construirFilasPublicas(filas, jugadores, idsPublicos);
        filasPorGenero[genero] = filasPublicas.length;

        rankings.set(idRankingPublico(circuito.id, circuito.temporada, genero), {
          circuitoId: circuito.id,
          circuitoNombre: circuito.nombre,
          temporada: circuito.temporada,
          genero,
          actualizadoEn,
          filas: filasPublicas,
        });

        for (const fila of filas) {
          const lista = posicionesPorJugador.get(fila.jugadorId) ?? [];
          lista.push({
            circuitoNombre: circuito.nombre,
            genero,
            posicion: fila.posicion,
            puntos: fila.puntos,
          });
          posicionesPorJugador.set(fila.jugadorId, lista);
        }
      }

      resultados.push({
        circuitoId: circuito.id,
        circuitoNombre: circuito.nombre,
        resumen: {
          circuitoNombre: circuito.nombre,
          jugadoresTotales: jugadores.length,
          jugadoresConPermiso: publicables.length,
          filasPorGenero,
        },
      });
    } catch (error) {
      resultados.push({
        circuitoId: circuito.id,
        circuitoNombre: circuito.nombre,
        error: error instanceof Error ? error.message : "Error desconocido.",
      });
    }
  }

  // Si un circuito falló, no se tocan los rankings ya publicados para no perderlos.
  const huboErrores = resultados.some((resultado) => resultado.error);

  const perfiles = new Map<string, object>();
  for (const jugador of publicables) {
    const idPublico = idsPublicos.get(jugador.id);
    if (!idPublico) continue;
    perfiles.set(
      idPublico,
      construirPerfilPublico({
        jugador,
        idPublico,
        participaciones: calcularParticipaciones(jugador.id, competenciasTodas),
        posiciones: posicionesPorJugador.get(jugador.id) ?? [],
        hoy: actualizadoEn,
      }),
    );
  }

  if (huboErrores) {
    const lote = writeBatch(db);
    for (const [id, ranking] of rankings) {
      lote.set(doc(db, COLECCION_RANKINGS_PUBLICOS, id), ranking);
    }
    await lote.commit();
  } else {
    await reemplazarColeccion(COLECCION_RANKINGS_PUBLICOS, rankings);
    await reemplazarColeccion(COLECCION_PERFILES_PUBLICOS, perfiles);
  }

  return resultados;
}

/** Recalcula los rankings y perfiles cuando cambia una competencia de un torneo con circuito. */
export async function actualizarRankingsDeCompetencia(
  competenciaId: string,
): Promise<ResumenRanking | null> {
  // El cálculo lee datos privados de jugadores: solo lo corre el superadmin.
  if (auth.currentUser?.uid !== FOXREN_OWNER_UID) return null;

  const competencia = await competenciasRepository.obtenerPorId(competenciaId);
  if (!competencia) return null;

  const torneo = await torneosRepository.obtenerTorneoPorId(competencia.torneoId);
  // Sin circuito no hay ranking que publicar.
  if (!torneo?.circuitoId) return null;

  const resultados = await actualizarTodosLosRankings();
  return resultados.find((resultado) => resultado.circuitoId === torneo.circuitoId)?.resumen ?? null;
}
