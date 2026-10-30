import { useCallback, useEffect, useState } from "react";

import { competenciasRepository } from "../../../../infrastructure/repositories/competenciasRepository";
import { partidosRepository } from "../../../../infrastructure/repositories/partidosRepository";
import { parejasRepository } from "../../../../infrastructure/repositories/parejasRepository";
import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";
import { zonasRepository } from "../../../../infrastructure/repositories/zonasRepository";
import { resultadoRepository } from "../../../../infrastructure/repositories/resultadoRepository";
import { cambiarEstadoCompetencia } from "../../../../application/competencias/cambiarEstadoCompetencia";
import { prepararCompetencia } from "../../../../application/competencias/prepararCompetencia";
import type { ResultadoPreparacionCompetencia } from "../../../../application/competencias/prepararCompetencia";
import type { Competencia } from "../../../../domain/competencia/competencia.types";
import type { Partido } from "../../../../domain/partido/partido.types";
import type { Pareja } from "../../../../domain/pareja/pareja.types";
import type { Jugador } from "../../../../domain/jugador/jugador.types";
import type { Zona } from "../../../../domain/competencia/competencia.zonas.types";
import type { Resultado } from "../../../../domain/resultado/resultado.types";

interface UseCompetenciaAdminReturn {
  competencia: Competencia | null;
  cargando: boolean;
  error: string | null;
  partidos: Partido[];
  parejas: Pareja[];
  jugadores: Jugador[];
  zonas: Zona[];
  resultados: Resultado[];
  cargandoPartidos: boolean;
  errorPartidos: string | null;
  cambiandoEstado: boolean;
  preparando: boolean;
  resultadoPreparacion: ResultadoPreparacionCompetencia | null;
  informeCopiado: boolean;
  actualizacionParejas: number;
  actualizacionPartidos: number;
  abrirInscripciones: () => Promise<void>;
  preparar: () => Promise<void>;
  cerrarInscripciones: () => Promise<void>;
  copiarInforme: () => Promise<void>;
  actualizarPartidos: () => void;
  actualizarParejas: () => void;
  setCompetencia: (updater: (actual: Competencia | null) => Competencia | null) => void;
  nombreJugador: (jugadorId: string) => string;
  nombrePareja: (parejaId: string | null) => string;
  nombreZona: (zonaId?: string) => string;
  etiquetaEstadoPartido: (estado: Partido["estado"]) => string;
}

export function useCompetenciaAdmin(competenciaId: string): UseCompetenciaAdminReturn {
  const [competencia, setCompetencia] = useState<Competencia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [parejas, setParejas] = useState<Pareja[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [cargandoPartidos, setCargandoPartidos] = useState(true);
  const [errorPartidos, setErrorPartidos] = useState<string | null>(null);

  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [preparando, setPreparando] = useState(false);
  const [resultadoPreparacion, setResultadoPreparacion] =
    useState<ResultadoPreparacionCompetencia | null>(null);
  const [informeCopiado, setInformeCopiado] = useState(false);
  const [actualizacionParejas, setActualizacionParejas] = useState(0);
  const [actualizacionPartidos, setActualizacionPartidos] = useState(0);

  /* ---------- Carga de competencia ---------- */
  useEffect(() => {
    async function cargarCompetencia() {
      if (!competenciaId) {
        setError("No se indicó una competencia.");
        setCargando(false);
        return;
      }

      try {
        setError(null);
        const datos = await competenciasRepository.obtenerPorId(competenciaId);
        setCompetencia(datos);
      } catch {
        setError("No se pudo cargar la competencia.");
      } finally {
        setCargando(false);
      }
    }

    cargarCompetencia();
  }, [competenciaId]);

  /* ---------- Carga de partidos, parejas, zonas, resultados ---------- */
  useEffect(() => {
    let cancelado = false;

    async function cargarDatosPartidos() {
      if (!competenciaId) {
        setCargandoPartidos(false);
        return;
      }

      try {
        setCargandoPartidos(true);
        setErrorPartidos(null);

        const [partidosCargados, parejasCargadas, zonasCargadas] =
          await Promise.all([
            partidosRepository.getByCompetencia(competenciaId),
            parejasRepository.obtenerPorCompetenciaId(competenciaId),
            zonasRepository.obtenerPorCompetenciaId(competenciaId),
          ]);

        const resultadosCargados = await resultadoRepository.obtenerPorPartidoIds(
          partidosCargados.map((partido) => partido.id),
        );

        const idsJugadores = Array.from(
          new Set(
            parejasCargadas.flatMap((pareja) => [
              pareja.jugador1Id,
              pareja.jugador2Id,
            ]),
          ),
        );
        const jugadoresCargados = await jugadoresRepository.obtenerPorIds(idsJugadores);

        if (cancelado) return;

        setPartidos(
          partidosCargados.sort((a, b) => {
            const ordenZona = (a.zonaId ?? "").localeCompare(b.zonaId ?? "");
            return ordenZona !== 0 ? ordenZona : a.orden - b.orden;
          }),
        );
        setParejas(parejasCargadas);
        setJugadores(jugadoresCargados);
        setZonas(zonasCargadas);
        setResultados(resultadosCargados);
      } catch {
        if (!cancelado) {
          setErrorPartidos("No se pudieron cargar los partidos de la competencia.");
        }
      } finally {
        if (!cancelado) {
          setCargandoPartidos(false);
        }
      }
    }

    void cargarDatosPartidos();

    return () => {
      cancelado = true;
    };
  }, [competenciaId, actualizacionPartidos, actualizacionParejas]);

  /* ---------- Acciones de competencia ---------- */
  async function abrirInscripciones() {
    if (!competencia) return;

    try {
      setCambiandoEstado(true);
      setError(null);
      await cambiarEstadoCompetencia(competencia.id, "inscripciones_abiertas");
      setCompetencia({
        ...competencia,
        estado: "inscripciones_abiertas",
      });
    } catch {
      setError("No se pudieron abrir las inscripciones.");
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function preparar() {
    if (!competencia) return;

    try {
      setPreparando(true);
      setError(null);
      setResultadoPreparacion(null);
      const resultado = await prepararCompetencia(competencia.id);
      setResultadoPreparacion(resultado);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo verificar la competencia.",
      );
    } finally {
      setPreparando(false);
    }
  }

  async function cerrarInscripciones() {
    if (!competencia || !resultadoPreparacion?.esValida) return;

    try {
      setCambiandoEstado(true);
      setError(null);
      await cambiarEstadoCompetencia(competencia.id, "inscripciones_cerradas");
      setCompetencia({
        ...competencia,
        estado: "inscripciones_cerradas",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cerrar las inscripciones.",
      );
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function copiarInforme() {
    if (!competencia || !resultadoPreparacion) return;

    setInformeCopiado(false);
    const resumen = resultadoPreparacion.resumen;

    const reglaCategoria =
      competencia.tipoReglaCategoria === "individual"
        ? `Categoría individual: ${competencia.valorReglaCategoria}ª`
        : `Suma de categorías: ${competencia.valorReglaCategoria}`;

    const parejasTexto =
      resultadoPreparacion.parejas.length === 0
        ? "No hay parejas registradas."
        : resultadoPreparacion.parejas
            .map(
              (pareja, index) =>
                `${index + 1}. ${pareja.jugador1} / ${pareja.jugador2}`,
            )
            .join("\n");

    const estadoValidacion = resultadoPreparacion.esValida
      ? "✓ COMPETENCIA LISTA PARA CERRAR INSCRIPCIONES"
      : "✗ HAY ERRORES QUE DEBEN CORREGIRSE";

    const erroresTexto =
      resultadoPreparacion.errores.length === 0
        ? ""
        : [
            "",
            "Errores:",
            ...resultadoPreparacion.errores.map((e) => `- ${e}`),
          ].join("\n");

    const informe = [
      "FOXREN — VERIFICACIÓN DE COMPETENCIA",
      "",
      `Competencia: ${competencia.nombre}`,
      `Género: ${competencia.genero}`,
      reglaCategoria,
      `Cupo: ${resumen.cantidadParejas} / ${resumen.cupoMaximo} parejas`,
      `Cupos disponibles: ${resumen.cupoMaximo - resumen.cantidadParejas}`,
      `Jugadores registrados: ${resumen.jugadores}`,
      "",
      estadoValidacion,
      erroresTexto,
      "",
      "PAREJAS INSCRIPTAS",
      parejasTexto,
      "",
      "Revisión realizada desde FOXREN.",
    ].join("\n");

    await navigator.clipboard.writeText(informe);
    setInformeCopiado(true);

    setTimeout(() => {
      setInformeCopiado(false);
    }, 3000);
  }

  /* ---------- Helpers ---------- */
  const nombreJugador = useCallback((jugadorId: string): string => {
    const jugador = jugadores.find((item) => item.id === jugadorId);
    if (!jugador) return "Jugador no encontrado";
    return `${jugador.nombre} ${jugador.apellido}`;
  }, [jugadores]);

  const nombrePareja = useCallback((parejaId: string | null): string => {
    if (!parejaId) return "Pareja por definir";
    const pareja = parejas.find((item) => item.id === parejaId);
    if (!pareja) return "Pareja no encontrada";
    return `${nombreJugador(pareja.jugador1Id)} / ${nombreJugador(
      pareja.jugador2Id,
    )}`;
  }, [parejas, nombreJugador]);

  const nombreZona = useCallback((zonaId?: string): string => {
    if (!zonaId) return "Sin zona";
    return (
      zonas.find((zona) => zona.id === zonaId)?.nombre ?? "Zona no encontrada"
    );
  }, [zonas]);

  const etiquetaEstadoPartido = useCallback((estado: Partido["estado"]): string => {
    const etiquetas: Record<Partido["estado"], string> = {
      pendiente: "Pendiente",
      en_juego: "En juego",
      finalizado: "Finalizado",
      walkover: "Walkover",
      abandono: "Abandono",
      suspendido: "Suspendido",
    };
    return etiquetas[estado];
  }, []);

  return {
    competencia,
    cargando,
    error,
    partidos,
    parejas,
    jugadores,
    zonas,
    resultados,
    cargandoPartidos,
    errorPartidos,
    cambiandoEstado,
    preparando,
    resultadoPreparacion,
    informeCopiado,
    actualizacionParejas,
    actualizacionPartidos,
    abrirInscripciones,
    preparar,
    cerrarInscripciones,
    copiarInforme,
    actualizarPartidos: useCallback(() => setActualizacionPartidos((a) => a + 1), []),
    actualizarParejas: useCallback(() => setActualizacionParejas((a) => a + 1), []),
    setCompetencia,
    nombreJugador,
    nombrePareja,
    nombreZona,
    etiquetaEstadoPartido,
  };
}
