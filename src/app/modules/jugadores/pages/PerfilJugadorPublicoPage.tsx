import { Link, useParams } from "react-router-dom";

import { usePerfilPublico } from "../hooks/usePerfilPublico";

const NOMBRE_GENERO: Record<string, string> = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
  MIXTO: "Mixto",
};

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <div className="bg-black/20 border border-white/5 rounded-2xl p-4 text-center">
      <p className="text-2xl font-bold text-white m-0">{valor}</p>
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] m-0 mt-1">
        {etiqueta}
      </p>
    </div>
  );
}

export default function PerfilJugadorPublicoPage() {
  const { idPublico } = useParams();
  const { perfil, cargando, error } = usePerfilPublico(idPublico);

  if (cargando) {
    return (
      <p className="py-12 text-center text-xs text-[var(--color-text-muted)]">
        Cargando perfil...
      </p>
    );
  }

  if (error || !perfil) {
    return (
      <section className="space-y-3 py-8 text-center">
        <p className="text-sm text-slate-300 m-0">
          {error ?? "Este perfil no está disponible."}
        </p>
        <Link to="/ranking" className="text-xs text-[var(--color-accent)]">
          ← Volver al ranking
        </Link>
      </section>
    );
  }

  const { estadisticas } = perfil;
  const datosPersonales = [
    perfil.ciudad,
    perfil.provincia,
    perfil.edad !== undefined ? `${perfil.edad} años` : undefined,
  ].filter(Boolean);

  return (
    <section className="space-y-8">
      <Link to="/ranking" className="text-xs text-[var(--color-accent)]">
        ← Volver al ranking
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight m-0">
          {perfil.nombre} {perfil.apellido}
          {perfil.apodo && (
            <span className="ml-3 text-base font-normal text-[var(--color-text-muted)]">
              “{perfil.apodo}”
            </span>
          )}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
          {perfil.categoria && (
            <span className="rounded-full border border-[var(--color-border)] bg-[#32113d] px-2.5 py-0.5 font-mono font-bold text-[var(--color-accent)]">
              {perfil.categoria}
            </span>
          )}
          {datosPersonales.length > 0 && <span>{datosPersonales.join(" · ")}</span>}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato etiqueta="Partidos" valor={estadisticas.partidosJugados} />
        <Dato etiqueta="Ganados" valor={estadisticas.partidosGanados} />
        <Dato etiqueta="Efectividad" valor={`${estadisticas.efectividad}%`} />
        <Dato etiqueta="Títulos" valor={estadisticas.titulos} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white m-0">Ranking</h2>
        {perfil.posiciones.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] m-0">Sin posiciones todavía.</p>
        ) : (
          <ul className="space-y-2 p-0 m-0 list-none">
            {perfil.posiciones.map((posicion) => (
              <li
                key={`${posicion.circuitoNombre}-${posicion.genero}`}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3 text-sm"
              >
                <span className="text-slate-200">
                  {posicion.circuitoNombre} · {NOMBRE_GENERO[posicion.genero] ?? posicion.genero}
                </span>
                <span className="font-mono text-[var(--color-accent)]">
                  #{posicion.posicion} · {posicion.puntos} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white m-0">Historial</h2>
        {perfil.participaciones.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] m-0">
            Todavía no jugó competencias.
          </p>
        ) : (
          <ul className="space-y-2 p-0 m-0 list-none">
            {perfil.participaciones.map((participacion) => (
              <li
                key={participacion.competenciaId}
                className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white m-0">
                      {participacion.torneoNombre}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] m-0">
                      {participacion.competenciaNombre} · {participacion.circuitoNombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--color-accent)] m-0">
                      {participacion.resultado}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] m-0">
                      {participacion.partidosGanados}/{participacion.partidosJugados} partidos ·{" "}
                      {participacion.puntos} pts
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
