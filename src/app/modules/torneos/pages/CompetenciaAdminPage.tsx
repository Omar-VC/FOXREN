import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ZonasCompetenciaAdmin from "./ZonasCompetenciaAdmin";
import type { Competencia } from "../../../../domain/competencia/competencia.types";
import ParejasAdmin from "../components/ParejasAdmin";
import { competenciasRepository } from "../../../../infrastructure/repositories/competenciasRepository";
import { cambiarEstadoCompetencia } from "../../../../application/competencias/cambiarEstadoCompetencia";
import { prepararCompetencia } from "../../../../application/competencias/prepararCompetencia";
import type { ResultadoPreparacionCompetencia } from "../../../../application/competencias/prepararCompetencia";

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
          : "No se pudo verificar la competencia."
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
          : "No se pudieron cerrar las inscripciones."
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
                `${index + 1}. ${pareja.jugador1} / ${pareja.jugador2}`
            )
            .join("\n");

    const estadoValidacion = resultadoPreparacion.esValida
      ? "✓ COMPETENCIA LISTA PARA CERRAR INSCRIPCIONES"
      : "✗ HAY ERRORES QUE DEBEN CORREGIRSE";

    const erroresTexto =
      resultadoPreparacion.errores.length === 0
        ? ""
        : ["", "Errores:", ...resultadoPreparacion.errores.map((e) => `- ${e}`)].join(
            "\n"
          );

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
          <h2 className="text-lg font-semibold mb-3 text-slate-100">Información</h2>
          <div className="space-y-1.5 text-sm text-slate-300">
            <p><span className="text-slate-400">Género:</span> {competencia.genero}</p>
            <p><span className="text-slate-400">Cupo máximo:</span> {competencia.cupoMaximoParejas} parejas</p>
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
          <h2 className="text-lg font-semibold mb-3 text-slate-100">Acciones</h2>
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
              ✓ Inscripciones cerradas. La competencia se encuentra lista para el sorteo de zonas.
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
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Parejas</h3>
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
        <div className="bg-slate-900/60 border border-dashed border-slate-700 rounded-[var(--border-radius)] p-4 text-slate-400">
          <h4 className="font-medium text-slate-200 mb-1">Partidos</h4>
          <p className="text-xs">Próximo paso: generar y administrar partidos.</p>
        </div>

        <div className="bg-slate-900/60 border border-dashed border-slate-700 rounded-[var(--border-radius)] p-4 text-slate-400">
          <h4 className="font-medium text-slate-200 mb-1">Resultados</h4>
          <p className="text-xs">Próximo paso: cargar y validar resultados.</p>
        </div>
      </div>
    </section>
  );
}