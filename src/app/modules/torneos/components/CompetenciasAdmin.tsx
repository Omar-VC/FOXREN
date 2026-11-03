import { useState } from "react";
import { Link } from "react-router-dom";
import CompetenciaForm from "./CompetenciaForm";
import { useCompetenciasPorTorneo } from "../hooks/useCompetenciasPorTorneo";

interface Props {
  torneoId: string;
}

export default function CompetenciasAdmin({ torneoId }: Props) {
  const { competencias, cargando, creando, error, crearCompetencia } =
    useCompetenciasPorTorneo(torneoId);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <section className="space-y-6">
      {/* Cabecera limpia y minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white m-0 tracking-tight">
            Competencias
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] m-0 mt-0.5">
            {competencias.length} {competencias.length === 1 ? "competencia registrada" : "competencias registradas"}
          </p>
        </div>

        <button
          type="button"
          className="fox-button-primary text-xs py-2 px-4 self-start sm:self-auto"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? "✕ Cerrar formulario" : "＋ Nueva Competencia"}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs font-medium m-0">⚠️ {error}</p>
      )}

      {/* Formulario desplegable limpio sin recuadros exagerados */}
      {mostrarFormulario && (
        <div className="py-4 border-b border-[var(--color-border)]/40 animate-fadeIn">
          <CompetenciaForm
            torneoId={torneoId}
            creando={creando}
            onCrear={async (datos) => {
              await crearCompetencia(datos);
              setMostrarFormulario(false);
            }}
          />
        </div>
      )}

      {/* Indicador de carga */}
      {cargando && (
        <p className="text-xs text-[var(--color-text-muted)] py-6 text-center m-0">
          Cargando competencias...
        </p>
      )}

      {/* Estado vacío minimalista */}
      {!cargando && competencias.length === 0 && (
        <p className="text-xs text-[var(--color-text-muted)] py-8 text-center m-0">
          No hay competencias registradas en este torneo todavía.
        </p>
      )}

      {/* Listado en grilla limpio y liviano */}
      {!cargando && competencias.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-0 m-0 list-none">
          {competencias.map((competencia) => (
            <li
              key={competencia.id}
              className="bg-black/20 hover:bg-black/40 border border-white/5 hover:border-[var(--color-accent)]/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/admin/torneos/${torneoId}/competencias/${competencia.id}`}
                    className="text-white font-semibold text-sm group-hover:text-[var(--color-accent)] transition-colors no-underline line-clamp-1"
                  >
                    {competencia.nombre}
                  </Link>
                  <span className="text-[10px] font-mono text-[var(--color-accent)] uppercase tracking-wider">
                    {competencia.estado}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] m-0">
                  {competencia.genero}
                </p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <Link
                  to={`/admin/torneos/${torneoId}/competencias/${competencia.id}`}
                  className="text-xs text-[var(--color-accent)] font-medium hover:underline no-underline flex items-center gap-1"
                >
                  Gestionar <span>→</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}