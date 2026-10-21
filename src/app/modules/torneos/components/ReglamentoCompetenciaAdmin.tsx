import { useState } from "react";

import type { ReglamentoCompetencia } from "../../../../domain/competencia/competencia.types";
import { REGLAMENTO_BASE_FOXREN } from "../../../../domain/competencia/competencia.reglamento.rules";
import { competenciasRepository } from "../../../../infrastructure/repositories/competenciasRepository";
import ReglamentoCompetenciaFieldset from "./ReglamentoCompetenciaFieldset";

interface Props {
  competenciaId: string;
  inicial?: ReglamentoCompetencia;
  onActualizado: (reglamento: ReglamentoCompetencia) => void;
}

export default function ReglamentoCompetenciaAdmin({
  competenciaId,
  inicial,
  onActualizado,
}: Props) {
  const [reglamento, setReglamento] = useState<ReglamentoCompetencia>(inicial ?? {
    ...REGLAMENTO_BASE_FOXREN,
    criteriosDesempate: [...REGLAMENTO_BASE_FOXREN.criteriosDesempate],
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function guardar() {
    const siguiente = {
      ...reglamento,
      estado: reglamento.origen === "foxren" ? "aprobado" as const : "pendiente_revision" as const,
    };
    try {
      setGuardando(true);
      setError(null);
      setMensaje(null);
      await competenciasRepository.guardarReglamento(competenciaId, siguiente);
      setReglamento(siguiente);
      onActualizado(siguiente);
      setMensaje(siguiente.estado === "aprobado"
        ? "Reglamento FOXREN guardado y activo."
        : "Reglamento guardado como pendiente de revisión.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el reglamento.");
    } finally {
      setGuardando(false);
    }
  }

  async function aprobar() {
    try {
      setGuardando(true);
      setError(null);
      setMensaje(null);
      const pendiente = { ...reglamento, estado: "pendiente_revision" as const };
      await competenciasRepository.guardarReglamento(competenciaId, pendiente);
      await competenciasRepository.aprobarReglamento(competenciaId);
      const aprobado = { ...pendiente, estado: "aprobado" as const };
      setReglamento(aprobado);
      onActualizado(aprobado);
      setMensaje("Reglamento revisado y aprobado para esta competencia.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo aprobar el reglamento.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="mt-5 space-y-3">
      {!inicial && (
        <p className="text-sm text-amber-300" role="status">
          Esta competencia histórica no tiene un reglamento registrado. El formulario muestra los criterios base de FOXREN como propuesta local; guardalos y aprobá la configuración antes de continuar.
        </p>
      )}
      <ReglamentoCompetenciaFieldset value={reglamento} onChange={setReglamento} />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void guardar()} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar regla"}
        </button>
        {reglamento.origen !== "foxren" && reglamento.estado === "pendiente_revision" && (
          <button type="button" onClick={() => void aprobar()} disabled={guardando || !reglamento.referencia.trim()}>
            Aprobar regla para esta competencia
          </button>
        )}
      </div>
      {reglamento.origen !== "foxren" && (
        <p className="text-sm" role="status">
          Estado: {reglamento.estado === "aprobado" ? "Aprobado por el administrador" : "Pendiente de revisión"}
        </p>
      )}
      {mensaje && <p className="text-sm text-emerald-300" role="status">{mensaje}</p>}
      {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
    </section>
  );
}
