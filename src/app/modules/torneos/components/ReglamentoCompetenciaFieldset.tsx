import type {
  CriterioDesempateZona,
  ReglamentoCompetencia,
} from "../../../../domain/competencia/competencia.types";

interface Props {
  value: ReglamentoCompetencia;
  onChange: (reglamento: ReglamentoCompetencia) => void;
}

const etiquetas: Record<CriterioDesempateZona, string> = {
  victorias: "Victorias",
  diferencia_sets: "Diferencia de sets",
  diferencia_games: "Diferencia de games",
};

export default function ReglamentoCompetenciaFieldset({ value, onChange }: Props) {
  function cambiarCriterio(indice: number, criterio: CriterioDesempateZona) {
    const anterior = value.criteriosDesempate[indice];
    onChange({
      ...value,
      estado: value.origen === "foxren" ? "aprobado" : "pendiente_revision",
      criteriosDesempate: value.criteriosDesempate.map((actual, actualIndice) => {
        if (actualIndice === indice) return criterio;
        if (actual === criterio) return anterior;
        return actual;
      }),
    });
  }

  return (
    <fieldset className="space-y-3 rounded-lg border border-slate-700 p-4">
      <legend className="px-2 font-semibold">Reglamento deportivo</legend>
      <label className="block text-sm">
        Fuente de la regla
        <select
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2"
          value={value.origen}
          onChange={(event) => {
            const origen = event.target.value as ReglamentoCompetencia["origen"];
            onChange({
              ...value,
              origen,
              referencia: origen === "foxren" ? "Criterios base de FOXREN" : "",
              estado: origen === "foxren" ? "aprobado" : "pendiente_revision",
            });
          }}
        >
          <option value="foxren">Criterios base de FOXREN</option>
          <option value="reglamento_oficial">Reglamento oficial</option>
          <option value="propuesta_organizador">Propuesta de organizador</option>
        </select>
      </label>

      {value.origen !== "foxren" && (
        <label className="block text-sm">
          Referencia, versión o resumen de la propuesta
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2"
            maxLength={500}
            value={value.referencia}
            onChange={(event) => onChange({
              ...value,
              referencia: event.target.value,
              estado: "pendiente_revision",
            })}
            required
          />
        </label>
      )}

      <p className="text-xs text-slate-400">
        Orden de desempate por zona. Las propuestas quedan pendientes hasta que
        el administrador las revise y apruebe.
      </p>
      {value.criteriosDesempate.map((criterio, indice) => (
        <label className="block text-sm" key={indice}>
          Criterio {indice + 1}
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2"
            value={criterio}
            onChange={(event) => cambiarCriterio(
              indice,
              event.target.value as CriterioDesempateZona,
            )}
          >
            {value.criteriosDesempate.map((opcion) => (
              <option key={opcion} value={opcion}>{etiquetas[opcion]}</option>
            ))}
          </select>
        </label>
      ))}
      <label className="block text-sm">
        Resolución si persiste el empate en el corte
        <select
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2"
          value={value.empatePersistente}
          onChange={(event) => onChange({
            ...value,
            estado: value.origen === "foxren" ? "aprobado" : "pendiente_revision",
            empatePersistente: event.target.value as ReglamentoCompetencia["empatePersistente"],
          })}
        >
          <option value="partido_desempate">Partido de desempate</option>
          <option value="enfrentamiento_directo">Enfrentamiento directo</option>
          <option value="sorteo">Sorteo</option>
          <option value="resolucion_administrativa">Resolución administrativa</option>
        </select>
      </label>
      <p className="text-xs text-slate-400">
        La clasificación permanece bloqueada hasta resolver el empate. La
        automatización de esos procedimientos todavía requiere pruebas.
      </p>
    </fieldset>
  );
}
