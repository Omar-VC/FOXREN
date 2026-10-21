import type {
  CriterioDesempateZona,
  ReglamentoCompetencia,
} from "./competencia.types";

export const CRITERIOS_DESEMPATE_BASE: CriterioDesempateZona[] = [
  "victorias",
  "diferencia_sets",
  "diferencia_games",
];

export const REGLAMENTO_BASE_FOXREN: ReglamentoCompetencia = {
  origen: "foxren",
  referencia: "Criterios base de FOXREN",
  estado: "aprobado",
  criteriosDesempate: CRITERIOS_DESEMPATE_BASE,
  empatePersistente: "partido_desempate",
};

export function reglamentoCompetenciaEsValido(
  valor: unknown,
): valor is ReglamentoCompetencia {
  if (!valor || typeof valor !== "object") return false;
  const reglamento = valor as Record<string, unknown>;
  const criterios = reglamento.criteriosDesempate;
  const criteriosValidos = Array.isArray(criterios) &&
    criterios.length === 3 &&
    criterios.every((criterio) => CRITERIOS_DESEMPATE_BASE.includes(
      criterio as CriterioDesempateZona,
    )) &&
    new Set(criterios).size === CRITERIOS_DESEMPATE_BASE.length;

  return (
    (reglamento.origen === "foxren" ||
      reglamento.origen === "reglamento_oficial" ||
      reglamento.origen === "propuesta_organizador") &&
    typeof reglamento.referencia === "string" &&
    reglamento.referencia.trim().length > 0 &&
    reglamento.referencia.length <= 500 &&
    (reglamento.estado === "pendiente_revision" || reglamento.estado === "aprobado") &&
    criteriosValidos &&
    (reglamento.empatePersistente === "partido_desempate" ||
      reglamento.empatePersistente === "enfrentamiento_directo" ||
      reglamento.empatePersistente === "sorteo" ||
      reglamento.empatePersistente === "resolucion_administrativa") &&
    !(reglamento.origen === "foxren" && reglamento.estado !== "aprobado")
  );
}
