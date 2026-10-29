import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ZonasCompetenciaAdmin from "./ZonasCompetenciaAdmin";
import ParejasAdmin from "../components/ParejasAdmin";
import TablaZonaAdmin from "../components/TablaZonaAdmin";
import CuadroEliminacionDirecta from "../components/CuadroEliminacionDirecta";
import EncabezadoCompetencia from "../components/EncabezadoCompetencia";
import TarjetasEstadoInfo from "../components/TarjetasEstadoInfo";
import BloqueVerificacion from "../components/BloqueVerificacion";
import ListaPartidos from "../components/ListaPartidos";
import FormularioResultado from "../components/FormularioResultado";
import { useCompetenciaAdmin } from "../hooks/useCompetenciaAdmin";
import { useRegistroResultado } from "../hooks/useRegistroResultado";
import { generarLlavesEliminacionDirecta } from "../../../../application/competencias/generarLlavesEliminacionDirecta";

export default function CompetenciaAdminPage() {
  const { competenciaId } = useParams();

  const {
    competencia,
    cargando,
    error,
    partidos,
    zonas,
    resultados,
    cargandoPartidos,
    errorPartidos,
    cambiandoEstado,
    preparando,
    resultadoPreparacion,
    informeCopiado,
    actualizacionParejas,
    abrirInscripciones,
    preparar,
    cerrarInscripciones,
    copiarInforme,
    actualizarPartidos,
    actualizarParejas,
    nombrePareja,
    nombreZona,
    etiquetaEstadoPartido,
  } = useCompetenciaAdmin(competenciaId ?? "");

  const {
    partidoSeleccionadoId,
    tipoResultado,
    cantidadSets,
    marcadores,
    ganadorEspecialId,
    resultadoOficial,
    guardandoResultado,
    mensajeResultado,
    errorResultado,
    setPartidoSeleccionadoId,
    setTipoResultado,
    setCantidadSets,
    setMarcadores,
    setGanadorEspecialId,
    setResultadoOficial,
    setErrorResultado,
    setMensajeResultado,
    guardarResultado,
  } = useRegistroResultado({
    partidos,
    competencia,
    onExito: () => actualizarPartidos(),
  });

  const [llavesGeneradas, setLlavesGeneradas] = useState<boolean>(partidos.length > 0);
  const [generandoLlaves, setGenerandoLlaves] = useState<boolean>(false);
  const [errorLlaves, setErrorLlaves] = useState<string | null>(null);

  async function generarLlaves() {
    if (!competencia) return;
    setGenerandoLlaves(true);
    setErrorLlaves(null);
    try {
      await generarLlavesEliminacionDirecta(competencia.id);
      // Los partidos se cargarán reactivamente vía useCompetenciaAdmin
      // cuando actualizarPartidos dispare la recarga.
      actualizarPartidos();
    } catch (err) {
      setErrorLlaves(
        err instanceof Error ? err.message : "No se pudieron generar las llaves.",
      );
    } finally {
      setGenerandoLlaves(false);
    }
  }

  // Sincronizar llavesGeneradas con el estado real de partidos
  useEffect(() => {
    setLlavesGeneradas(partidos.length > 0);
  }, [partidos]);

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
      <EncabezadoCompetencia competencia={competencia} />

      <TarjetasEstadoInfo
        competencia={competencia}
        abrirInscripciones={abrirInscripciones}
        preparar={preparar}
        cambiandoEstado={cambiandoEstado}
        preparando={preparando}
      />

      <BloqueVerificacion
        resultadoPreparacion={resultadoPreparacion}
        copiarInforme={copiarInforme}
        cerrarInscripciones={cerrarInscripciones}
        cambiandoEstado={cambiandoEstado}
        informeCopiado={informeCopiado}
      />


        <div className="pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParejasAdmin
              competenciaId={competencia.id}
              onParejaRegistrada={() => {
                actualizarParejas();
              }}
            />

            <div>
              {competencia.formato === "eliminacion_directa" ? (
                <>
                  {!llavesGeneradas ? (
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
                      <h3 className="text-lg font-semibold mb-3 text-slate-100">
                        Cuadro de Eliminación Directa
                      </h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Generá el cuadro de llaves para comenzar a cargar
                        resultados. Se requiere una cantidad de parejas que sea
                        potencia de 2 (2, 4, 8, 16...).
                      </p>
                      <button
                        type="button"
                        onClick={generarLlaves}
                        disabled={generandoLlaves}
                        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {generandoLlaves ? "Generando..." : "Generar llaves de eliminación directa"}
                      </button>
                      {errorLlaves && (
                        <p className="mt-3 text-sm text-red-300">{errorLlaves}</p>
                      )}
                    </div>
                  ) : (
                    <CuadroEliminacionDirecta
                      partidos={partidos}
                      nombrePareja={nombrePareja}
                      actualizarPartidos={actualizarPartidos}
                    />
                  )}
                </>
              ) : (
                <>
                  <ZonasCompetenciaAdmin
                    competenciaId={competencia.id}
                    formato={competencia.formato}
                    inscripcionesCerradas={
                      competencia.estado === "inscripciones_cerradas"
                    }
                    actualizacion={actualizacionParejas}
                  />
                  {competencia.formato === "zonas_eliminacion_directa" && (
                    <TablaZonaAdmin
                      zonas={zonas}
                      partidos={partidos}
                      resultados={resultados}
                      parejasClasificanPorZona={
                        competencia.parejasClasificanPorZona ?? 2
                      }
                      reglamento={competencia.reglamento}
                      nombrePareja={nombrePareja}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <ListaPartidos
              partidos={partidos}
              actualizarPartidos={actualizarPartidos}
              cargandoPartidos={cargandoPartidos}
              errorPartidos={errorPartidos}
              nombrePareja={nombrePareja}
              nombreZona={nombreZona}
              etiquetaEstadoPartido={etiquetaEstadoPartido}
            />

            <FormularioResultado
              partidos={partidos}
              partidoSeleccionadoId={partidoSeleccionadoId}
              tipoResultado={tipoResultado}
              cantidadSets={cantidadSets}
              marcadores={marcadores}
              ganadorEspecialId={ganadorEspecialId}
              resultadoOficial={resultadoOficial}
              guardandoResultado={guardandoResultado}
              mensajeResultado={mensajeResultado}
              errorResultado={errorResultado}
              setPartidoSeleccionadoId={setPartidoSeleccionadoId}
              setTipoResultado={setTipoResultado}
              setCantidadSets={setCantidadSets}
              setMarcadores={setMarcadores}
              setGanadorEspecialId={setGanadorEspecialId}
              setResultadoOficial={setResultadoOficial}
              setErrorResultado={setErrorResultado}
              setMensajeResultado={setMensajeResultado}
              nombrePareja={nombrePareja}
              guardarResultado={guardarResultado}
            />
          </div>
        </div>
      </section>
    );
  }
