import { useState } from "react";
import { Link } from "react-router-dom";
import TorneoForm from "../components/TorneoForm";
import { useTorneos } from "../hooks/useTorneos";

export default function AdminTorneosPage() {
  const { torneos, cargando, creando, error, crearTorneo } = useTorneos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  if (cargando) {
    return (
      <section className="p-8 text-center">
        <p className="text-muted">Cargando torneos...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Cabecera de la sección de administración */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="admin-page-title m-0">Administrar Torneos</h1>
          <p className="admin-page-description mt-1">
            Creá, configurá y gestiona los torneos de la plataforma FOXREN.
          </p>
        </div>
        <button
          type="button"
          className="fox-button-primary self-start sm:self-auto flex items-center gap-2"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <span>
            {mostrarFormulario ? "✕ Cerrar formulario" : "＋ Nuevo Torneo"}
          </span>
        </button>
      </div>

      {error && <p className="text-red-500 font-medium">{error}</p>}

      {/* Formulario desplegable bajo demanda */}
      {mostrarFormulario && (
        <div className="fox-card border-[var(--color-accent)]/50 animate-fadeIn space-y-4">
          <div className="border-b border-[var(--color-border)] pb-3">
            <h2 className="text-base font-bold text-white m-0">
              Registrar Nuevo Torneo
            </h2>
          </div>
          <TorneoForm
            creando={creando}
            onCrear={async (datos) => {
              await crearTorneo(datos);
              setMostrarFormulario(false);
            }}
          />
        </div>
      )}

      {/* Listado limpio de Torneos Registrados */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <h2 className="text-xl font-bold text-white m-0 flex items-center gap-2">
            <span>🏆</span> Torneos Registrados
          </h2>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">
            Total: {torneos.length}
          </span>
        </div>

        {torneos.length === 0 ? (
          <div className="fox-card text-center py-10">
            <p className="text-muted m-0">
              No hay torneos registrados en el sistema.
            </p>
          </div>
        ) : (
          <div className="fox-card-grid">
            {torneos.map((torneo) => {
              const fechaInicioTexto = torneo.fechaInicio
                ? typeof torneo.fechaInicio === "string"
                  ? torneo.fechaInicio
                  : (torneo.fechaInicio as any)?.toDate
                    ? (torneo.fechaInicio as any)
                        .toDate()
                        .toLocaleDateString("es-AR", { timeZone: "UTC" })
                    : torneo.fechaInicio instanceof Date
                      ? torneo.fechaInicio.toLocaleDateString("es-AR", { timeZone: "UTC" })
                      : String(torneo.fechaInicio)
                : "A confirmar";

              return (
                <article
                  key={torneo.id}
                  className="fox-card flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-white m-0">
                        {torneo.nombre}
                      </h3>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)] shrink-0">
                        {torneo.estado ?? "Activo"}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-muted)] m-0">
                      📅 Inicio:{" "}
                      <strong className="text-white">{fechaInicioTexto}</strong>{" "}
                      | Modalidad:{" "}
                      <strong className="text-white">
                        {torneo.modalidad || "General"}
                      </strong>
                    </p>
                  </div>

                  {/* Botón de acceso exclusivo a la gestión de competencias del torneo */}
                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Gestión interna
                    </span>
                    <Link
                      to={`/admin/torneos/${torneo.id}`}
                      className="py-1.5 px-3 rounded-[0.7rem] bg-[var(--color-primary)] text-white font-semibold text-xs transition-all hover:brightness-110 no-underline"
                    >
                      Administrar Competencias →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
