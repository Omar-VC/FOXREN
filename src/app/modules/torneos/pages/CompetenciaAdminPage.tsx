import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ZonasCompetenciaAdmin from "./ZonasCompetenciaAdmin";
import type { Competencia } from "../../../../domain/competencia/competencia.types";
import ParejasAdmin from "../components/ParejasAdmin";
import { competenciasRepository } from "../../../../infrastructure/repositories/competenciasRepository";
import { cambiarEstadoCompetencia } from "../../../../application/competencias/cambiarEstadoCompetencia";
import { prepararCompetencia } from "../../../../application/competencias/prepararCompetencia";
import type { ResultadoPreparacionCompetencia } from "../../../../application/competencias/prepararCompetencia";

import type { Partido } from "../../../../domain/partido/partido.types";
import type { Pareja } from "../../../../domain/pareja/pareja.types";
import type { Jugador } from "../../../../domain/jugador/jugador.types";
import type { Zona } from "../../../../domain/competencia/competencia.zonas.types";

import { partidosRepository } from "../../../../infrastructure/repositories/partidosRepository";
import { parejasRepository } from "../../../../infrastructure/repositories/parejasRepository";
import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";
import { zonasRepository } from "../../../../infrastructure/repositories/zonasRepository";
import { registrarResultado } from "../../../../application/resultados/registrarResultado";
import type { TipoResultado } from "../../../../domain/resultado/resultado.types";
import type { SetResultado } from "../../../../domain/partido/partido.types";

export default function CompetenciaAdminPage() {
  const { torneoId, competenciaId } = useParams();
  const [competencia, setCompetencia] = useState<Competencia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [preparando, setPreparando] = useState(false);
  const [resultadoPreparacion, setResultadoPreparacion] =
    useState<ResultadoPreparacionCompetencia | null>(null);
  const [informeCopiado, setInformeCopiado] = useState(false);
  const [actualizacionParejas, setActualizacionParejas] = useState(0);

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [parejas, setParejas] = useState<Pareja[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cargandoPartidos, setCargandoPartidos] = useState(true);
  const [errorPartidos, setErrorPartidos] = useState<string | null>(null);
  const [actualizacionPartidos, setActualizacionPartidos] = useState(0);
  const [partidoSeleccionadoId, setPartidoSeleccionadoId] = useState("");
  const [tipoResultado, setTipoResultado] = useState<TipoResultado>("normal");
  const [cantidadSets, setCantidadSets] = useState<2 | 3>(2);
  const [marcadores, setMarcadores] = useState([
    {
      juegosPareja1: "",
      juegosPareja2: "",
      tieBreakPareja1: "",
      tieBreakPareja2: "",
    },
    {
      juegosPareja1: "",
      juegosPareja2: "",
      tieBreakPareja1: "",
      tieBreakPareja2: "",
    },
    {
      juegosPareja1: "",
      juegosPareja2: "",
      tieBreakPareja1: "",
      tieBreakPareja2: "",
    },
  ]);
  const [ganadorEspecialId, setGanadorEspecialId] = useState("");
  const [resultadoOficial, setResultadoOficial] = useState(true);
  const [guardandoResultado, setGuardandoResultado] = useState(false);
  const [mensajeResultado, setMensajeResultado] = useState<string | null>(null);
  const [errorResultado, setErrorResultado] = useState<string | null>(null);

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

        const [
          partidosCargados,
          parejasCargadas,
          jugadoresCargados,
          zonasCargadas,
        ] = await Promise.all([
          partidosRepository.getByCompetencia(competenciaId),
          parejasRepository.obtenerPorCompetenciaId(competenciaId),
          jugadoresRepository.obtenerJugadores(),
          zonasRepository.obtenerPorCompetenciaId(competenciaId),
        ]);

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
      } catch {
        if (!cancelado) {
          setErrorPartidos(
            "No se pudieron cargar los partidos de la competencia.",
          );
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
  }, [competenciaId, actualizacionPartidos]);

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

  function nombreJugador(jugadorId: string): string {
    const jugador = jugadores.find((item) => item.id === jugadorId);

    if (!jugador) return "Jugador no encontrado";

    return `${jugador.nombre} ${jugador.apellido}`;
  }

  function nombrePareja(parejaId: string): string {
    const pareja = parejas.find((item) => item.id === parejaId);

    if (!pareja) return "Pareja no encontrada";

    return `${nombreJugador(pareja.jugador1Id)} / ${nombreJugador(
      pareja.jugador2Id,
    )}`;
  }

  function nombreZona(zonaId?: string): string {
    if (!zonaId) return "Sin zona";

    return (
      zonas.find((zona) => zona.id === zonaId)?.nombre ?? "Zona no encontrada"
    );
  }

  function etiquetaEstadoPartido(estado: Partido["estado"]): string {
    const etiquetas: Record<Partido["estado"], string> = {
      pendiente: "Pendiente",
      en_juego: "En juego",
      finalizado: "Finalizado",
      walkover: "Walkover",
      abandono: "Abandono",
      suspendido: "Suspendido",
    };

    return etiquetas[estado];
  }

  if (cargando) {
    return (
      <div className="py-8 text-center text-slate-400">
        Cargando competencia...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-950/50 border border-red-500/40 text-red-200 rounded-xl mb-4">
        {error}
      </div>
    );
  }

  if (!competencia) {
    return <p className="text-slate-400">Competencia no encontrada.</p>;
  }

  async function guardarResultado() {
    if (!competencia) return;

    const partido = partidos.find((item) => item.id === partidoSeleccionadoId);

    if (!partido) {
      setErrorResultado("Seleccioná un partido válido.");
      return;
    }

    setGuardandoResultado(true);
    setErrorResultado(null);
    setMensajeResultado(null);

    try {
      let sets: SetResultado[] = [];
      let ganadorParejaId: string | undefined;

      if (tipoResultado === "normal") {
        sets = marcadores.slice(0, cantidadSets).map((marcador, indice) => {
          const tieBreakActivo =
            marcador.juegosPareja1 === "6" && marcador.juegosPareja2 === "6";

          const tieBreakCompleto =
            marcador.tieBreakPareja1 !== "" && marcador.tieBreakPareja2 !== "";

          if (tieBreakActivo && !tieBreakCompleto) {
            throw new Error(
              `Completá los puntos del tie-break del set ${indice + 1}.`,
            );
          }

          const puntosTieBreakPareja1 = Number(marcador.tieBreakPareja1);
          const puntosTieBreakPareja2 = Number(marcador.tieBreakPareja2);

          const tieBreakValido =
            tieBreakCompleto &&
            puntosTieBreakPareja1 !== puntosTieBreakPareja2 &&
            Math.max(puntosTieBreakPareja1, puntosTieBreakPareja2) >= 7 &&
            Math.abs(puntosTieBreakPareja1 - puntosTieBreakPareja2) >= 2;

          if (tieBreakActivo && !tieBreakValido) {
            throw new Error(
              `El tie-break del set ${indice + 1} debe ganarse por al menos dos puntos.`,
            );
          }

          const juegosPareja1 = tieBreakActivo
            ? puntosTieBreakPareja1 > puntosTieBreakPareja2
              ? 7
              : 6
            : Number(marcador.juegosPareja1);

          const juegosPareja2 = tieBreakActivo
            ? puntosTieBreakPareja2 > puntosTieBreakPareja1
              ? 7
              : 6
            : Number(marcador.juegosPareja2);

          const set: SetResultado = {
            setNumero: indice + 1,
            juegosPareja1,
            juegosPareja2,
          };

          if (tieBreakActivo) {
            set.tieBreakPareja1 = puntosTieBreakPareja1;
            set.tieBreakPareja2 = puntosTieBreakPareja2;
          }

          return set;
        });

        const setsGanadosPareja1 = sets.filter(
          (set) => set.juegosPareja1 > set.juegosPareja2,
        ).length;

        ganadorParejaId =
          setsGanadosPareja1 >= 2 ? partido.pareja1Id : partido.pareja2Id;
      } else if (tipoResultado === "walkover" || tipoResultado === "abandono") {
        if (!ganadorEspecialId) {
          throw new Error("Seleccioná la pareja ganadora.");
        }

        ganadorParejaId = ganadorEspecialId;
      }

      await registrarResultado(
        {
          partidoId: partido.id,
          tipo: tipoResultado,
          sets,
          ganadorParejaId,
          oficial: resultadoOficial,
          fechaRegistro: new Date(),
        },
        {
          partidoId: partido.id,
          torneoId: competencia.torneoId,
          competenciaId: competencia.id,
          categoriaId: competencia.categoriaId,
        },
      );

      setMensajeResultado("Resultado registrado correctamente.");
      setPartidoSeleccionadoId("");
      setGanadorEspecialId("");
      setCantidadSets(2);
      setMarcadores([
        {
          juegosPareja1: "",
          juegosPareja2: "",
          tieBreakPareja1: "",
          tieBreakPareja2: "",
        },
        {
          juegosPareja1: "",
          juegosPareja2: "",
          tieBreakPareja1: "",
          tieBreakPareja2: "",
        },
        {
          juegosPareja1: "",
          juegosPareja2: "",
          tieBreakPareja1: "",
          tieBreakPareja2: "",
        },
      ]);
      setActualizacionPartidos((actual) => actual + 1);
    } catch (err) {
      setErrorResultado(
        err instanceof Error ? err.message : "No se pudo guardar el resultado.",
      );
    } finally {
      setGuardandoResultado(false);
    }
  }

  return (
    <section className="space-y-6">
      {/* Encabezado y Regreso */}
      <div>
        <Link
          to={torneoId ? `/admin/torneos` : "/admin/torneos"}
          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors inline-block mb-3"
        >
          ← Volver a torneos
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="admin-page-title">{competencia.nombre}</h1>
            <p className="admin-page-description">
              Centro operativo de la competencia.
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              competencia.estado === "inscripciones_cerradas"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : competencia.estado === "inscripciones_abiertas"
                  ? "bg-sky-950 text-sky-300 border border-sky-800"
                  : "bg-slate-800 text-slate-300 border border-slate-700"
            }`}
          >
            {competencia.estado.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Tarjetas superiores de Estado e Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detalle */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-3 text-slate-100">
            Información
          </h2>
          <div className="space-y-1.5 text-sm text-slate-300">
            <p>
              <span className="text-slate-400">Género:</span>{" "}
              {competencia.genero}
            </p>
            <p>
              <span className="text-slate-400">Cupo máximo:</span>{" "}
              {competencia.cupoMaximoParejas} parejas
            </p>
            <p>
              <span className="text-slate-400">Regla de Categoría:</span>{" "}
              {competencia.tipoReglaCategoria === "individual"
                ? `Categoría ${competencia.valorReglaCategoria}ª`
                : `Suma ${competencia.valorReglaCategoria}`}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg flex flex-col justify-center">
          <h2 className="text-lg font-semibold mb-3 text-slate-100">
            Acciones
          </h2>
          {competencia.estado === "borrador" && (
            <button
              type="button"
              onClick={abrirInscripciones}
              disabled={cambiandoEstado}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {cambiandoEstado ? "Abriendo..." : "Abrir inscripciones"}
            </button>
          )}

          {competencia.estado === "inscripciones_abiertas" && (
            <button
              type="button"
              onClick={preparar}
              disabled={preparando}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {preparando ? "Verificando..." : "Verificar competencia"}
            </button>
          )}

          {competencia.estado === "inscripciones_cerradas" && (
            <p className="text-emerald-400 text-sm font-medium">
              ✓ Inscripciones cerradas. La competencia se encuentra lista para
              el sorteo de zonas.
            </p>
          )}
        </div>
      </div>

      {/* Bloque de Verificación (si está activo) */}
      {resultadoPreparacion && (
        <div
          className={`border rounded-[var(--border-radius)] p-5 ${
            resultadoPreparacion.esValida
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/30 border-red-500/40 text-red-200"
          }`}
        >
          <h2 className="text-lg font-bold mb-2">
            {resultadoPreparacion.esValida
              ? "✓ Competencia lista para cerrar inscripciones"
              : "✗ Problemas a corregir"}
          </h2>

          {resultadoPreparacion.esValida ? (
            <div className="space-y-3 text-sm">
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>
                  Parejas: {resultadoPreparacion.resumen.cantidadParejas} /{" "}
                  {resultadoPreparacion.resumen.cupoMaximo} (Libres:{" "}
                  {resultadoPreparacion.resumen.cupoMaximo -
                    resultadoPreparacion.resumen.cantidadParejas}
                  )
                </li>
                <li>Jugadores: {resultadoPreparacion.resumen.jugadores}</li>
                <li>✓ Datos, parejas y reglas validadas correctamente</li>
              </ul>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={copiarInforme}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-medium text-xs py-2 px-3 rounded-lg transition-colors"
                >
                  {informeCopiado ? "✓ Copiado a WhatsApp" : "Copiar informe"}
                </button>

                <button
                  type="button"
                  onClick={cerrarInscripciones}
                  disabled={cambiandoEstado}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cambiandoEstado ? "Cerrando..." : "Cerrar inscripciones"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <p className="mb-2">Corregí las siguientes inconsistencias:</p>
              <ul className="list-disc list-inside space-y-1">
                {resultadoPreparacion.errores.map((err, idx) => (
                  <li key={idx}>✗ {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Módulos de Operación */}
      <div className="pt-2">
        <h2 className="text-xl font-semibold mb-4 text-slate-100 border-b border-[var(--color-border)] pb-2">
          Operación
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-slate-200">
              Parejas
            </h3>
            <ParejasAdmin
              competenciaId={competencia.id}
              onParejaRegistrada={() => {
                setActualizacionParejas((actual) => actual + 1);
              }}
            />
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Zonas</h3>
            <ZonasCompetenciaAdmin
              competenciaId={competencia.id}
              inscripcionesCerradas={
                competencia.estado === "inscripciones_cerradas"
              }
              actualizacion={actualizacionParejas}
            />
          </div>
        </div>
      </div>

      {/* Partidos y Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-100">Partidos</h4>
              <p className="text-xs text-slate-400 mt-1">
                {partidos.length} partido{partidos.length === 1 ? "" : "s"}{" "}
                generado
                {partidos.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActualizacionPartidos((actual) => actual + 1)}
              disabled={cargandoPartidos}
              className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
            >
              {cargandoPartidos ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {cargandoPartidos ? (
            <p className="text-sm text-slate-400">Cargando partidos...</p>
          ) : errorPartidos ? (
            <p className="text-sm text-red-300">{errorPartidos}</p>
          ) : partidos.length === 0 ? (
            <p className="text-sm text-slate-400">
              Todavía no hay partidos generados para esta competencia.
            </p>
          ) : (
            <div className="space-y-3">
              {partidos.map((partido) => (
                <article
                  key={partido.id}
                  className="rounded-xl border border-[var(--color-border)] bg-slate-950/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                      {nombreZona(partido.zonaId)}
                    </span>

                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        partido.estado === "finalizado"
                          ? "bg-emerald-950 text-emerald-300"
                          : partido.estado === "en_juego"
                            ? "bg-sky-950 text-sky-300"
                            : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {etiquetaEstadoPartido(partido.estado)}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-100 font-medium">
                        {nombrePareja(partido.pareja1Id)}
                      </p>
                      {partido.ganadorParejaId === partido.pareja1Id && (
                        <span className="text-xs text-emerald-400">
                          Ganadora
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-500">VS</p>

                    <div>
                      <p className="text-slate-100 font-medium">
                        {nombrePareja(partido.pareja2Id)}
                      </p>
                      {partido.ganadorParejaId === partido.pareja2Id && (
                        <span className="text-xs text-emerald-400">
                          Ganadora
                        </span>
                      )}
                    </div>
                  </div>

                  {partido.sets.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="text-xs text-slate-400 mb-1">Resultado</p>
                      <div className="flex flex-wrap gap-2">
                        {partido.sets.map((set) => (
                          <span
                            key={set.setNumero}
                            className="text-sm font-semibold text-slate-200"
                          >
                            {set.juegosPareja1}-{set.juegosPareja2}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(partido.fechaHora || partido.cancha) && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                      {partido.fechaHora && (
                        <p>
                          Fecha:{" "}
                          {new Date(partido.fechaHora).toLocaleString("es-AR")}
                        </p>
                      )}
                      {partido.cancha && <p>Cancha: {partido.cancha}</p>}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
          <h4 className="text-lg font-semibold text-slate-100 mb-4">
            Registrar resultado
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Partido
              </label>
              <select
                value={partidoSeleccionadoId}
                onChange={(e) => {
                  setPartidoSeleccionadoId(e.target.value);
                  setErrorResultado(null);
                  setMensajeResultado(null);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
              >
                <option value="">Seleccionar partido</option>
                {partidos
                  .filter(
                    (partido) =>
                      ![
                        "finalizado",
                        "walkover",
                        "abandono",
                        "suspendido",
                      ].includes(partido.estado),
                  )
                  .map((partido) => (
                    <option key={partido.id} value={partido.id}>
                      {nombrePareja(partido.pareja1Id)} vs.{" "}
                      {nombrePareja(partido.pareja2Id)}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Tipo de resultado
              </label>
              <select
                value={tipoResultado}
                onChange={(e) => {
                  setTipoResultado(e.target.value as TipoResultado);
                  setErrorResultado(null);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
              >
                <option value="normal">Partido normal</option>
                <option value="walkover">Walkover</option>
                <option value="abandono">Abandono</option>
                <option value="suspension">Suspensión</option>
              </select>
            </div>

            {tipoResultado === "normal" && (
              <>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Cantidad de sets
                  </label>
                  <select
                    value={cantidadSets}
                    onChange={(e) =>
                      setCantidadSets(Number(e.target.value) as 2 | 3)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
                  >
                    <option value={2}>Dos sets</option>
                    <option value={3}>Tres sets</option>
                  </select>
                </div>

                {marcadores.slice(0, cantidadSets).map((marcador, indice) => (
                  <div
                    key={indice}
                    className="rounded-lg border border-slate-700 p-3 space-y-3"
                  >
                    <p className="text-sm font-semibold text-slate-200">
                      Set {indice + 1}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs text-slate-400">
                        {nombrePareja(
                          partidos.find((p) => p.id === partidoSeleccionadoId)
                            ?.pareja1Id ?? "",
                        )}
                        <input
                          type="number"
                          min="0"
                          max="7"
                          value={marcador.juegosPareja1}
                          onChange={(e) =>
                            setMarcadores((actual) =>
                              actual.map((item, i) =>
                                i === indice
                                  ? { ...item, juegosPareja1: e.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                        />
                      </label>

                      <label className="text-xs text-slate-400">
                        {nombrePareja(
                          partidos.find((p) => p.id === partidoSeleccionadoId)
                            ?.pareja2Id ?? "",
                        )}
                        <input
                          type="number"
                          min="0"
                          max="7"
                          value={marcador.juegosPareja2}
                          onChange={(e) =>
                            setMarcadores((actual) =>
                              actual.map((item, i) =>
                                i === indice
                                  ? { ...item, juegosPareja2: e.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                        />
                      </label>
                    </div>

                    {Number(marcador.juegosPareja1) === 6 &&
                      Number(marcador.juegosPareja2) === 6 && (
                        <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                          <p className="text-sm font-medium text-amber-300">
                            Tie-break
                          </p>

                          <p className="text-xs text-slate-400">
                            Ingresá los puntos del desempate. El set se
                            completará automáticamente como 7-6 para la pareja
                            ganadora.
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            <label className="text-xs text-slate-400">
                              Puntos pareja 1
                              <input
                                type="number"
                                min="0"
                                value={marcador.tieBreakPareja1}
                                onChange={(e) =>
                                  setMarcadores((actual) =>
                                    actual.map((item, i) =>
                                      i === indice
                                        ? {
                                            ...item,
                                            tieBreakPareja1: e.target.value,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                              />
                            </label>

                            <label className="text-xs text-slate-400">
                              Puntos pareja 2
                              <input
                                type="number"
                                min="0"
                                value={marcador.tieBreakPareja2}
                                onChange={(e) =>
                                  setMarcadores((actual) =>
                                    actual.map((item, i) =>
                                      i === indice
                                        ? {
                                            ...item,
                                            tieBreakPareja2: e.target.value,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                              />
                            </label>
                          </div>

                          {marcador.tieBreakPareja1 !== "" &&
                            marcador.tieBreakPareja2 !== "" &&
                            Number(marcador.tieBreakPareja1) !==
                              Number(marcador.tieBreakPareja2) &&
                            Math.max(
                              Number(marcador.tieBreakPareja1),
                              Number(marcador.tieBreakPareja2),
                            ) >= 7 &&
                            Math.abs(
                              Number(marcador.tieBreakPareja1) -
                                Number(marcador.tieBreakPareja2),
                            ) >= 2 && (
                              <p className="text-sm font-semibold text-emerald-300">
                                Resultado del set:{" "}
                                {Number(marcador.tieBreakPareja1) >
                                Number(marcador.tieBreakPareja2)
                                  ? "7-6 para la pareja 1"
                                  : "6-7 para la pareja 2"}
                              </p>
                            )}
                        </div>
                      )}
                  </div>
                ))}
              </>
            )}

            {(tipoResultado === "walkover" || tipoResultado === "abandono") && (
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Pareja ganadora
                </label>
                <select
                  value={ganadorEspecialId}
                  onChange={(e) => setGanadorEspecialId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
                >
                  <option value="">Seleccionar pareja</option>
                  {(() => {
                    const partido = partidos.find(
                      (p) => p.id === partidoSeleccionadoId,
                    );
                    if (!partido) return null;
                    return (
                      <>
                        <option value={partido.pareja1Id}>
                          {nombrePareja(partido.pareja1Id)}
                        </option>
                        <option value={partido.pareja2Id}>
                          {nombrePareja(partido.pareja2Id)}
                        </option>
                      </>
                    );
                  })()}
                </select>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={resultadoOficial}
                onChange={(e) => setResultadoOficial(e.target.checked)}
                className="accent-emerald-500"
              />
              Resultado oficial (genera historial)
            </label>

            {errorResultado && (
              <p className="text-sm text-red-300">{errorResultado}</p>
            )}

            {mensajeResultado && (
              <p className="text-sm text-emerald-300">{mensajeResultado}</p>
            )}

            <button
              type="button"
              onClick={guardarResultado}
              disabled={guardandoResultado || !partidoSeleccionadoId}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {guardandoResultado ? "Guardando..." : "Guardar resultado"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
