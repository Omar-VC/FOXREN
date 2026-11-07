import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ZonasCompetenciaAdmin from "./ZonasCompetenciaAdmin";
import ParejasAdmin from "../components/ParejasAdmin";
import TablaZonaAdmin from "../components/TablaZonaAdmin";
import CuadroEliminacionDirecta from "../components/CuadroEliminacionDirecta";
import EncabezadoCompetencia from "../components/EncabezadoCompetencia";
import TarjetasEstadoInfo from "../components/TarjetasEstadoInfo";
import BloqueVerificacion from "../components/BloqueVerificacion";
import ListaPartidos from "../components/ListaPartidos";
import FormularioResultado from "../components/FormularioResultado";
import GeneracionPlayoff from "../components/GeneracionPlayoff";
import FormatoPartidosAdmin from "../components/FormatoPartidosAdmin";
import { useCompetenciaAdmin } from "../hooks/useCompetenciaAdmin";
import { useRegistroResultado } from "../hooks/useRegistroResultado";
import { generarPlayoffCompetencia } from "../../../../application/competencias/generarPlayoffCompetencia";
import { actualizarRankingsDeCompetencia } from "../../../../application/ranking/actualizarRankingsCircuito";
import { planificarPlayoff } from "../../../../domain/competencia/competencia.playoff.preparacion";
import type { PlanPlayoff } from "../../../../domain/competencia/competencia.playoff.preparacion";
import {
  etiquetaFase,
  semillaDesdeTexto,
} from "../../../../domain/competencia/competencia.playoff.rules";
import type { Partido } from "../../../../domain/partido/partido.types";

export default function CompetenciaAdminPage() {
  const { competenciaId } = useParams();

  const {
    competencia,
    cargando,
    error,
    partidos,
    parejas,
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
    recargarCompetencia,
    nombrePareja,
    nombreZona,
    etiquetaEstadoPartido,
  } = useCompetenciaAdmin(competenciaId ?? "");

  const registro = useRegistroResultado({
    partidos,
    competencia,
    onExito: () => {
      actualizarPartidos();
      recargarCompetencia();
      // El ranking público se recalcula en segundo plano: si falla, no bloquea la carga.
      if (competenciaId) {
        void actualizarRankingsDeCompetencia(competenciaId).catch((err) =>
          console.error("No se pudo actualizar el ranking público:", err),
        );
      }
    },
  });

  const [generandoPlayoff, setGenerandoPlayoff] = useState(false);
  const [errorPlayoff, setErrorPlayoff] = useState<string | null>(null);

  const partidosLlave = useMemo(
    () => partidos.filter((p) => p.tipoPartido === "eliminacion_directa"),
    [partidos],
  );
  const partidosZona = useMemo(
    () => partidos.filter((p) => p.tipoPartido !== "eliminacion_directa"),
    [partidos],
  );

  const llaveGenerada = competencia?.playoffGenerado === true || partidosLlave.length > 0;

  // Llaves de versiones anteriores (sin enlaces entre partidos): no avanzan solas.
  const llaveSinEnlaces = partidosLlave.some(
    (p) => p.fase !== "final" && !p.partidoSiguienteId,
  );

  // Vista previa del playoff con los datos actuales (la misma función que genera la llave).
  const plan = useMemo<PlanPlayoff | null>(() => {
    if (!competencia || llaveGenerada) return null;
    const esDirecta = competencia.formato === "eliminacion_directa";
    if (!esDirecta && !competencia.zonasGeneradas) return null;
    if (esDirecta && competencia.estado !== "inscripciones_cerradas") return null;

    try {
      return planificarPlayoff({
        competenciaId: competencia.id,
        formato: competencia.formato,
        parejaIdsActivas: parejas.filter((p) => p.estado === "activa").map((p) => p.id),
        zonas,
        partidos: partidosZona,
        resultados,
        parejasClasificanPorZona: competencia.parejasClasificanPorZona ?? 2,
        formatoPartidoZona: competencia.formatoPartidoZona ?? "mejor_de_3",
        criteriosDesempate: competencia.reglamento?.criteriosDesempate,
        // En directa el sorteo real se hace al generar: acá la vista previa es solo orientativa.
        semilla: semillaDesdeTexto(competencia.id),
      });
    } catch (err) {
      return {
        ok: false,
        bloqueos: [err instanceof Error ? err.message : "No se pudo calcular el playoff."],
      };
    }
  }, [competencia, llaveGenerada, parejas, zonas, partidosZona, resultados]);

  async function generarPlayoff() {
    if (!competencia) return;
    setGenerandoPlayoff(true);
    setErrorPlayoff(null);
    try {
      await generarPlayoffCompetencia(competencia.id);
      actualizarPartidos();
      recargarCompetencia();
    } catch (err) {
      setErrorPlayoff(
        err instanceof Error ? err.message : "No se pudo generar el playoff.",
      );
    } finally {
      setGenerandoPlayoff(false);
    }
  }

  function etiquetaPartido(partido: Partido): string {
    if (partido.tipoPartido === "eliminacion_directa") {
      return `${etiquetaFase(partido.fase ?? "")} ${partido.partidoNumero ?? ""}`.trim();
    }
    return nombreZona(partido.zonaId);
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

  const esDirecta = competencia.formato === "eliminacion_directa";
  const conZonas = competencia.formato === "zonas_eliminacion_directa";

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

      <FormatoPartidosAdmin
        competencia={competencia}
        onGuardado={recargarCompetencia}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ParejasAdmin
          competenciaId={competencia.id}
          onParejaRegistrada={() => {
            actualizarParejas();
          }}
        />

        {!esDirecta && (
          <div>
            <ZonasCompetenciaAdmin
              competenciaId={competencia.id}
              formato={competencia.formato}
              inscripcionesCerradas={competencia.estado === "inscripciones_cerradas"}
              actualizacion={actualizacionParejas}
            />
            {conZonas && (
              <TablaZonaAdmin
                zonas={zonas}
                partidos={partidosZona}
                resultados={resultados}
                parejasClasificanPorZona={competencia.parejasClasificanPorZona ?? 2}
                formatoPartidoZona={competencia.formatoPartidoZona ?? "mejor_de_3"}
                reglamento={competencia.reglamento}
                nombrePareja={nombrePareja}
              />
            )}
          </div>
        )}
      </div>

      <GeneracionPlayoff
        competencia={competencia}
        plan={plan}
        zonas={zonas}
        nombrePareja={nombrePareja}
        generando={generandoPlayoff}
        error={errorPlayoff}
        onGenerar={() => void generarPlayoff()}
      />

      {llaveSinEnlaces && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          Esta llave se generó con una versión anterior y no tiene enlaces entre partidos:
          los ganadores no avanzan solos. Eliminá los partidos de la llave y generala de nuevo.
        </div>
      )}

      {llaveGenerada && (
        <CuadroEliminacionDirecta
          partidos={partidos}
          nombrePareja={nombrePareja}
          partidoSeleccionadoId={registro.partidoSeleccionadoId}
          onSeleccionarPartido={registro.setPartidoSeleccionadoId}
          actualizarPartidos={actualizarPartidos}
        />
      )}

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
          {...registro}
          partidos={partidos}
          nombrePareja={nombrePareja}
          etiquetaPartido={etiquetaPartido}
        />
      </div>
    </section>
  );
}
