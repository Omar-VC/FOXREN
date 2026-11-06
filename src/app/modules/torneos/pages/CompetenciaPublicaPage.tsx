import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import TablaZonaAdmin from "../components/TablaZonaAdmin";
import CuadroEliminacionDirecta from "../components/CuadroEliminacionDirecta";
import { useCompetenciaPublica } from "../hooks/useCompetenciaPublica";
import { etiquetaFase } from "../../../../domain/competencia/competencia.playoff.rules";
import type { Partido, SetResultado } from "../../../../domain/partido/partido.types";

type Pestana = "zonas" | "partidos" | "cuadro" | "parejas";

const ETIQUETA_ESTADO: Record<string, string> = {
  borrador: "Borrador",
  inscripciones_abiertas: "Inscripciones abiertas",
  inscripciones_cerradas: "Inscripciones cerradas",
  en_curso: "En juego",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const ETIQUETA_PARTIDO: Record<Partido["estado"], string> = {
  pendiente: "Pendiente",
  en_juego: "En juego",
  finalizado: "Finalizado",
  walkover: "Walkover",
  abandono: "Abandono",
  suspendido: "Suspendido",
};

function textoSets(sets: SetResultado[], lado: 1 | 2): string {
  return sets
    .map((s) => {
      const propios = lado === 1 ? s.juegosPareja1 : s.juegosPareja2;
      const tb = lado === 1 ? s.tieBreakPareja1 : s.tieBreakPareja2;
      if (s.tipo === "super_tiebreak") return `[${tb ?? propios}]`;
      return tb !== undefined && tb !== null ? `${propios}(${tb})` : `${propios}`;
    })
    .join(" ");
}

export default function CompetenciaPublicaPage() {
  const { torneoId, competenciaId } = useParams();
  const [pestana, setPestana] = useState<Pestana | null>(null);

  const {
    competencia,
    partidos,
    zonas,
    parejas,
    resultados,
    cargando,
    error,
    ultimaActualizacion,
    nombrePareja,
    nombreZona,
  } = useCompetenciaPublica(competenciaId ?? "");

  const partidosZona = useMemo(
    () => partidos.filter((p) => p.tipoPartido !== "eliminacion_directa"),
    [partidos],
  );
  const partidosLlave = useMemo(
    () => partidos.filter((p) => p.tipoPartido === "eliminacion_directa"),
    [partidos],
  );

  if (cargando) {
    return <p className="p-8 text-center text-muted">Cargando competencia...</p>;
  }
  if (error && !competencia) {
    return <p className="p-8 text-center text-red-500 font-medium">{error}</p>;
  }
  if (!competencia) {
    return (
      <section className="p-8 text-center space-y-4">
        <p className="text-muted">Competencia no encontrada.</p>
        <Link to="/torneos" className="fox-button-primary inline-block">
          Volver a Torneos
        </Link>
      </section>
    );
  }

  const conZonas = competencia.formato !== "eliminacion_directa";
  const hayLlave = partidosLlave.length > 0;

  const pestanas: { id: Pestana; texto: string; visible: boolean }[] = [
    { id: "zonas", texto: "Zonas", visible: conZonas },
    { id: "partidos", texto: "Partidos", visible: true },
    { id: "cuadro", texto: "Cuadro", visible: hayLlave },
    { id: "parejas", texto: "Parejas", visible: true },
  ];
  const visibles = pestanas.filter((p) => p.visible);
  const activa: Pestana =
    pestana && visibles.some((p) => p.id === pestana)
      ? pestana
      : hayLlave
        ? "cuadro"
        : conZonas
          ? "zonas"
          : "partidos";

  const enJuego = partidos.filter((p) => p.estado === "en_juego").length;
  const campeonId = partidosLlave.find((p) => p.fase === "final")?.ganadorParejaId;

  function tarjetaPartido(partido: Partido, etiqueta: string) {
    const pareja1 = partido.pareja1Id ? nombrePareja(partido.pareja1Id) : "Por definir";
    const pareja2 = partido.pareja2Id ? nombrePareja(partido.pareja2Id) : "Por definir";
    return (
      <article key={partido.id} className="fox-card space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>{etiqueta}</span>
          <span
            className={
              partido.estado === "en_juego"
                ? "font-bold text-[var(--color-accent)]"
                : partido.estado === "finalizado"
                  ? "text-emerald-300"
                  : ""
            }
          >
            {partido.estado === "en_juego" && "● "}
            {ETIQUETA_PARTIDO[partido.estado]}
          </span>
        </div>
        {([1, 2] as const).map((lado) => {
          const id = lado === 1 ? partido.pareja1Id : partido.pareja2Id;
          const gana = !!id && partido.ganadorParejaId === id;
          return (
            <div key={lado} className="flex items-center justify-between gap-3 text-sm">
              <span className={`truncate ${gana ? "font-bold text-white" : "text-slate-200"}`}>
                {gana && <span className="text-emerald-400">✓ </span>}
                {lado === 1 ? pareja1 : pareja2}
              </span>
              <span className="shrink-0 font-mono text-xs text-slate-300">
                {textoSets(partido.sets, lado)}
              </span>
            </div>
          );
        })}
        {(partido.fechaHora || partido.cancha) && (
          <p className="text-xs text-[var(--color-text-muted)] m-0">
            {partido.fechaHora instanceof Date &&
              partido.fechaHora.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
            {partido.cancha ? ` · ${partido.cancha}` : ""}
          </p>
        )}
      </article>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={torneoId ? `/torneos/${torneoId}` : "/torneos"}
          className="text-xs text-[var(--color-accent)] no-underline"
        >
          ← Volver al torneo
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[#211b25] p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)] text-white">
            {ETIQUETA_ESTADO[competencia.estado] ?? competencia.estado}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)]">
            {competencia.genero}
          </span>
          {enJuego > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/80 text-white">
              ● {enJuego} en juego
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold text-white m-0">{competencia.nombre}</h1>
        {campeonId && (
          <p className="m-0 text-amber-200 font-semibold">🏆 Campeón: {nombrePareja(campeonId)}</p>
        )}
        {ultimaActualizacion && (
          <p className="m-0 text-xs text-[var(--color-text-muted)]">
            Se actualiza en vivo · última novedad{" "}
            {ultimaActualizacion.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <nav className="flex gap-2 overflow-x-auto" aria-label="Secciones de la competencia">
        {visibles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPestana(p.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border ${
              activa === p.id
                ? "bg-[var(--color-primary)] text-white border-transparent"
                : "border-[var(--color-border)] text-slate-300"
            }`}
          >
            {p.texto}
          </button>
        ))}
      </nav>

      {activa === "zonas" && (
        zonas.length === 0 ? (
          <div className="fox-card text-center py-8">
            <p className="text-muted m-0">Las zonas todavía no fueron armadas.</p>
          </div>
        ) : (
          <TablaZonaAdmin
            zonas={zonas}
            partidos={partidosZona}
            resultados={resultados}
            parejasClasificanPorZona={competencia.parejasClasificanPorZona ?? 2}
            formatoPartidoZona={competencia.formatoPartidoZona ?? "mejor_de_3"}
            reglamento={competencia.reglamento}
            nombrePareja={nombrePareja}
          />
        )
      )}

      {activa === "partidos" && (
        partidos.length === 0 ? (
          <div className="fox-card text-center py-8">
            <p className="text-muted m-0">Todavía no hay partidos.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hayLlave && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-white m-0">Playoff</h2>
                <div className="fox-card-grid">
                  {[...partidosLlave]
                    .filter((p) => !p.esBye)
                    .sort(
                      (a, b) =>
                        Number(b.ronda ?? 0) - Number(a.ronda ?? 0) ||
                        (a.partidoNumero ?? 0) - (b.partidoNumero ?? 0),
                    )
                    .map((p) =>
                      tarjetaPartido(p, `${etiquetaFase(p.fase ?? "")} ${p.partidoNumero ?? ""}`.trim()),
                    )}
                </div>
              </section>
            )}
            {[...zonas]
              .sort((a, b) => a.orden - b.orden)
              .map((zona) => {
                const lista = partidosZona
                  .filter((p) => p.zonaId === zona.id)
                  .sort((a, b) => a.orden - b.orden);
                if (lista.length === 0) return null;
                return (
                  <section key={zona.id} className="space-y-3">
                    <h2 className="text-lg font-bold text-white m-0">{zona.nombre}</h2>
                    <div className="fox-card-grid">
                      {lista.map((p) => tarjetaPartido(p, nombreZona(p.zonaId)))}
                    </div>
                  </section>
                );
              })}
          </div>
        )
      )}

      {activa === "cuadro" && (
        <CuadroEliminacionDirecta partidos={partidos} nombrePareja={nombrePareja} />
      )}

      {activa === "parejas" && (
        parejas.length === 0 ? (
          <div className="fox-card text-center py-8">
            <p className="text-muted m-0">Todavía no hay parejas inscriptas.</p>
          </div>
        ) : (
          <ol className="fox-card space-y-2 list-decimal pl-8 m-0">
            {parejas
              .filter((p) => p.estado === "activa")
              .map((p) => (
                <li key={p.id} className="text-slate-200 text-sm">
                  {nombrePareja(p.id)}
                </li>
              ))}
          </ol>
        )
      )}
    </div>
  );
}
