import { useParams } from "react-router-dom";
import ZonasCompetenciaAdmin from "./ZonasCompetenciaAdmin";
import ParejasAdmin from "../components/ParejasAdmin";
import TablaZonaAdmin from "../components/TablaZonaAdmin";
import EncabezadoCompetencia from "../components/EncabezadoCompetencia";
import TarjetasEstadoInfo from "../components/TarjetasEstadoInfo";
import BloqueVerificacion from "../components/BloqueVerificacion";
import ListaPartidos from "../components/ListaPartidos";
import FormularioResultado from "../components/FormularioResultado";
import { useCompetenciaAdmin } from "../hooks/useCompetenciaAdmin";
import { useRegistroResultado } from "../hooks/useRegistroResultado";

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
