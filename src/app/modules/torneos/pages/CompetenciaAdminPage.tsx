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
    if (!competencia) {
      return;
    }

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
    if (!competencia) {
      return;
    }

    try {
      setPreparando(true);
      setError(null);
      setResultadoPreparacion(null);

      const resultado = await prepararCompetencia(competencia.id);

      setResultadoPreparacion(resultado);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo verificar la competencia.",
      );
    } finally {
      setPreparando(false);
    }
  }

  async function cerrarInscripciones() {
    if (!competencia || !resultadoPreparacion?.esValida) {
      return;
    }

    try {
      setCambiandoEstado(true);
      setError(null);

      await cambiarEstadoCompetencia(competencia.id, "inscripciones_cerradas");

      setCompetencia({
        ...competencia,
        estado: "inscripciones_cerradas",
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cerrar las inscripciones.",
      );
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function copiarInforme() {
    if (!competencia || !resultadoPreparacion) {
      return;
    }

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
            ...resultadoPreparacion.errores.map((error) => `- ${error}`),
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

  if (cargando) {
    return <p>Cargando competencia...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!competencia) {
    return <p>Competencia no encontrada.</p>;
  }

  return (
    <section>
      <p>
        <Link to={torneoId ? `/admin/torneos` : "/admin/torneos"}>
          ← Volver a torneos
        </Link>
      </p>
      <h1 className="admin-page-title">{competencia.nombre}</h1>
      <p className="admin-page-description">
        Centro operativo de la competencia.
      </p>
      <hr />
      <h2>Información</h2>
      <p>Estado: {competencia.estado}</p>
      {competencia.estado === "borrador" && (
        <button
          type="button"
          onClick={abrirInscripciones}
          disabled={cambiandoEstado}
        >
          {cambiandoEstado ? "Abriendo..." : "Abrir inscripciones"}
        </button>
      )}
      {competencia.estado === "inscripciones_abiertas" && (
        <button type="button" onClick={preparar} disabled={preparando}>
          {preparando ? "Verificando..." : "Verificar competencia"}
        </button>
      )}
      {resultadoPreparacion && (
        <>
          <hr />

          <h2>Verificación de competencia</h2>

          {resultadoPreparacion.esValida ? (
            <>
              <p>La competencia está lista para cerrar las inscripciones.</p>

              <h3>Resumen</h3>

              <ul>
                <li>
                  Parejas: {resultadoPreparacion.resumen.cantidadParejas} /{" "}
                  {resultadoPreparacion.resumen.cupoMaximo}
                </li>

                <li>
                  Cupos disponibles:{" "}
                  {resultadoPreparacion.resumen.cupoMaximo -
                    resultadoPreparacion.resumen.cantidadParejas}
                </li>

                <li>Jugadores: {resultadoPreparacion.resumen.jugadores}</li>

                <li>✓ Datos de competencia válidos</li>
                <li>✓ Parejas registradas válidas</li>
                <li>✓ Jugadores válidos</li>
                <li>✓ Reglas de categoría verificadas</li>
                <li>✓ Cupo disponible</li>
              </ul>

              <h3>Parejas inscriptas</h3>

              {resultadoPreparacion.parejas.length === 0 ? (
                <p>No hay parejas registradas.</p>
              ) : (
                <ol>
                  {resultadoPreparacion.parejas.map((pareja, index) => (
                    <li key={index}>
                      {pareja.jugador1} / {pareja.jugador2}
                    </li>
                  ))}
                </ol>
              )}

              <button type="button" onClick={copiarInforme}>
                Copiar informe
              </button>

              {informeCopiado && (
                <p>✓ Informe copiado. Ya podés pegarlo en WhatsApp.</p>
              )}

              <button
                type="button"
                onClick={cerrarInscripciones}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado ? "Cerrando..." : "Cerrar inscripciones"}
              </button>
            </>
          ) : (
            <>
              <p>
                Se encontraron problemas que deben corregirse antes de cerrar
                las inscripciones.
              </p>

              <ul>
                {resultadoPreparacion.errores.map((error, index) => (
                  <li key={index}>✗ {error}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      <p>Género: {competencia.genero}</p>
      <p>Cupo máximo: {competencia.cupoMaximoParejas} parejas</p>
      <hr />
      <h2>Operación</h2>
      <div>
        <h3>Parejas</h3>

        <ParejasAdmin
          competenciaId={competencia.id}
          onParejaRegistrada={() => {
            setActualizacionParejas((actual) => actual + 1);
          }}
        />
      </div>

      <ZonasCompetenciaAdmin
        competenciaId={competencia.id}
        inscripcionesCerradas={competencia.estado === "inscripciones_cerradas"}
        actualizacion={actualizacionParejas}
      />

      <div>
        <h3>Partidos</h3>
        <p>Próximo paso: generar y administrar partidos.</p>
      </div>
      <div>
        <h3>Resultados</h3>
        <p>Próximo paso: cargar y validar resultados.</p>
      </div>
    </section>
  );
}
