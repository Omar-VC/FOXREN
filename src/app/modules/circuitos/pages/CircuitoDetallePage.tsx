import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { circuitosRepository } from "../../../../infrastructure/repositories/circuitosRepository";
import { useComplejosPorCircuito } from "../../complejos/hooks/useComplejosPorCircuito";
import type { Circuito } from "../../../../domain/circuito/circuito.types";
import { useTorneosPorCircuito } from "../../torneos/hooks/useTorneosPorCircuito";

export default function CircuitoDetallePage() {
  const { circuitoId } = useParams();

  const [circuito, setCircuito] = useState<Circuito | null>(null);
  const [cargandoCircuito, setCargandoCircuito] = useState(true);

  const {
    complejos,
    cargando: cargandoComplejos,
    error: errorComplejos,
  } = useComplejosPorCircuito(circuitoId ?? "");

  const {
    torneos,
    cargando: cargandoTorneos,
    error: errorTorneos,
  } = useTorneosPorCircuito(circuitoId ?? "");

  useEffect(() => {
    async function cargarCircuito() {
      if (!circuitoId) {
        setCargandoCircuito(false);
        return;
      }
      const datos = await circuitosRepository.obtenerCircuitoPorId(circuitoId);
      setCircuito(datos);
      setCargandoCircuito(false);
    }
    cargarCircuito();
  }, [circuitoId]);

  if (cargandoCircuito) {
    return (
      <section className="p-8 text-center">
        <p className="text-muted">Cargando información del circuito...</p>
      </section>
    );
  }

  if (!circuito) {
    return (
      <section className="p-8 text-center space-y-4">
        <p className="text-muted">Circuito no encontrado.</p>
        <Link to="/circuitos" className="fox-button-primary inline-block">
          Volver a Circuitos
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner / Foto central relacionada a la región */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-2xl bg-[#211b25] min-h-[16rem] flex flex-col justify-end p-6 md:p-8">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/60 to-transparent" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)] text-white shadow">
              Temporada {circuito.temporada}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)]">
              Circuito Oficial
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white m-0 tracking-tight">
            {circuito.nombre}
          </h1>

          {circuito.descripcion && (
            <p className="text-sm md:text-base text-[var(--color-text-muted)] max-w-2xl m-0 leading-relaxed">
              {circuito.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* SECCIÓN 1: Complejos Asociados */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <h2 className="text-xl font-bold text-white m-0 flex items-center gap-2">
            <span>📍</span> Complejos Adheridos
          </h2>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">
            {complejos.length} {complejos.length === 1 ? "complejo" : "complejos"}
          </span>
        </div>

        {cargandoComplejos && <p className="text-muted text-sm">Cargando complejos...</p>}
        {errorComplejos && <p className="text-red-500 text-sm">{errorComplejos}</p>}

        {!cargandoComplejos && complejos.length === 0 && (
          <div className="fox-card text-center py-6">
            <p className="text-muted text-sm m-0">No hay complejos asociados a este circuito todavía.</p>
          </div>
        )}

        {complejos.length > 0 && (
          <div className="fox-card-grid">
            {complejos.map((complejo) => (
              <article key={complejo.id} className="fox-card space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-full h-28 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-3xl mb-3 bg-gradient-to-br from-[#2b2530] to-[#181818]">
                    🏟️
                  </div>
                  <h3 className="text-base font-bold text-white m-0">{complejo.nombre}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                    <span>📍</span> {complejo.ciudad}, {complejo.provincia}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] flex items-center justify-between">
                  <span>Canchas disponibles:</span>
                  <strong className="text-white font-mono">{complejo.cantidadCanchas ?? "N/D"}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: Torneos del Circuito */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <h2 className="text-xl font-bold text-white m-0 flex items-center gap-2">
            <span>🏆</span> Torneos del Circuito
          </h2>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">
            {torneos.length} {torneos.length === 1 ? "torneo" : "torneos"}
          </span>
        </div>

        {cargandoTorneos && <p className="text-muted text-sm">Cargando torneos...</p>}
        {errorTorneos && <p className="text-red-500 text-sm">{errorTorneos}</p>}

        {!cargandoTorneos && torneos.length === 0 && (
          <div className="fox-card text-center py-6">
            <p className="text-muted text-sm m-0">No hay torneos programados para este circuito.</p>
          </div>
        )}

        {torneos.length > 0 && (
          <div className="fox-card-grid">
            {torneos.map((torneo) => {
              // Manejo seguro de la fecha por si es un objeto Date o string
              const fechaTexto = torneo.fechaInicio
                ? typeof torneo.fechaInicio === "string"
                  ? torneo.fechaInicio
                  : torneo.fechaInicio instanceof Date
                  ? torneo.fechaInicio.toLocaleDateString()
                  : String(torneo.fechaInicio)
                : "A confirmar";

              return (
                <Link
                  key={torneo.id}
                  to={`/torneos/${torneo.id}`}
                  className="fox-card group block no-underline transition-all hover:border-[var(--color-accent)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white group-hover:text-[var(--color-accent)] transition-colors m-0">
                      {torneo.nombre}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)] shrink-0">
                      {torneo.estado ?? "Activo"}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] m-0">
                    📅 Fecha de inicio: <strong className="text-white">{fechaTexto}</strong>
                  </p>

                  <div className="pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-accent)] font-semibold flex items-center justify-between">
                    <span>Ver competencias y zonas</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}