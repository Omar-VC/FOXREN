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

  const [llavesGeneradas, setLlavesGeneradas] = useState<boolean>(
    partidos.length > 0,
  );
  const [generandoLlaves, setGenerandoLlaves] = useState<boolean>(false);
  const [errorLlaves, setErrorLlaves] = useState<string | null>(null);

  async function generarLlaves() {
    if (!competencia) return;
    setGenerandoLlaves(true);
    setErrorLlaves(null);
    try {
      await generarLlavesEliminacionDirecta(competencia.id);
      actualizarPartidos();
    } catch (err) {
      setErrorLlaves(
        err instanceof Error
          ? err.message
          : "No se pudieron generar las llaves.",
      );
    } finally {
      setGenerandoLlaves(false);
    }
  }

  useEffect(() => {
    setLlavesGeneradas(partidos.length > 0);
  }, [partidos]);

  if (cargando) {
    return (
      <div className="py-12 text-center text-slate-400 font-medium">
        Cargando panel de competencia...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 rounded-xl mb-4 text-sm">
        {error}
      </div>
    );
  }

  if (!competencia) {
    return <p className="text-slate-400 text-center py-8">Competencia no encontrada.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Panel Superior Unificado (Header + Estado + Verificación) */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <EncabezadoCompetencia competencia={competencia} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--color-border)]">
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
        </div>
      </div>

      {/* Sección Principal de Gestión: Parejas, Zonas y Cuadros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl">
          <ParejasAdmin
            competenciaId={competencia.id}
            onParejaRegistrada={() => {
              actualizarParejas();
            }}
          />
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl space-y-6">
          {competencia.formato === "eliminacion_directa" ? (
            <>
              {!llavesGeneradas ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-100">
                    Cuadro de Eliminación Directa
                  </h3>
                  <p className="text-sm text-slate-400">
                    Generá el cuadro de llaves para comenzar a cargar resultados. Se requiere una cantidad de parejas que sea potencia de 2 (2, 4, 8, 16...).
                  </p>
                  <button
                    type="button"
                    onClick={generarLlaves}
                    disabled={generandoLlaves}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-900/20"
                  >
                    {generandoLlaves
                      ? "Generando..."
                      : "Generar llaves de eliminación directa"}
                  </button>
                  {errorLlaves && (
                    <p className="text-sm text-red-400 font-medium">{errorLlaves}</p>
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
            <div className="space-y-6">
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
                  formatoPartidoZona={
                    competencia.formatoPartidoZona ?? "mejor_de_3"
                  } 
                  reglamento={competencia.reglamento}
                  nombrePareja={nombrePareja}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sección Operativa de Partidos y Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-4">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl">
          <ListaPartidos
            partidos={partidos}
            actualizarPartidos={actualizarPartidos}
            cargandoPartidos={cargandoPartidos}
            errorPartidos={errorPartidos}
            nombrePareja={nombrePareja}
            nombreZona={nombreZona}
            etiquetaEstadoPartido={etiquetaEstadoPartido}
          />
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl">
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
    </div>
  );
}
