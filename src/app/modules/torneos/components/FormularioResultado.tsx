import type { Dispatch, SetStateAction } from "react";
import type { FormatoPartido, Partido } from "../../../../domain/partido/partido.types";
import type { TipoResultado } from "../../../../domain/resultado/resultado.types";
import { partidoListoParaJugar } from "../../../../domain/competencia/competencia.playoff.rules";
import {
  MARCADOR_SET_VACIO,
  requiereTieBreak,
} from "../../../../domain/resultado/resultado.marcador";
import type {
  MarcadorSetTexto,
  TipoTercerSet,
} from "../../../../domain/resultado/resultado.marcador";
import type { VistaPreviaMarcador } from "../hooks/useRegistroResultado";

interface Props {
  partidos: Partido[];
  partidoSeleccionadoId: string;
  tipoResultado: TipoResultado;
  formato: FormatoPartido;
  setsVisibles: 1 | 2 | 3;
  marcadores: MarcadorSetTexto[];
  tipoTercerSet: TipoTercerSet;
  vistaPrevia: VistaPreviaMarcador | null;
  hayMarcadorCargado: boolean;
  ganadorEspecialId: string;
  resultadoOficial: boolean;
  guardandoResultado: boolean;
  mensajeResultado: string | null;
  errorResultado: string | null;
  setPartidoSeleccionadoId: (id: string) => void;
  setTipoResultado: (tipo: TipoResultado) => void;
  setTipoTercerSet: (tipo: TipoTercerSet) => void;
  setMarcadores: Dispatch<SetStateAction<MarcadorSetTexto[]>>;
  setGanadorEspecialId: (id: string) => void;
  setResultadoOficial: (oficial: boolean) => void;
  setErrorResultado: (mensaje: string | null) => void;
  setMensajeResultado: (mensaje: string | null) => void;
  nombrePareja: (parejaId: string) => string;
  /** Texto que identifica al partido en la lista: zona o fase de la llave. */
  etiquetaPartido: (partido: Partido) => string;
  guardarResultado: () => Promise<void>;
}

const ESTADOS_CERRADOS: Partido["estado"][] = ["finalizado", "walkover", "abandono"];

const CLASE_INPUT =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors";
const CLASE_SELECT =
  "w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors";

export default function FormularioResultado({
  partidos,
  partidoSeleccionadoId,
  tipoResultado,
  formato,
  setsVisibles,
  marcadores,
  tipoTercerSet,
  vistaPrevia,
  hayMarcadorCargado,
  ganadorEspecialId,
  resultadoOficial,
  guardandoResultado,
  mensajeResultado,
  errorResultado,
  setPartidoSeleccionadoId,
  setTipoResultado,
  setTipoTercerSet,
  setMarcadores,
  setGanadorEspecialId,
  setResultadoOficial,
  setErrorResultado,
  setMensajeResultado,
  nombrePareja,
  etiquetaPartido,
  guardarResultado,
}: Props) {
  const partido = partidos.find((item) => item.id === partidoSeleccionadoId);
  const esSuspendido = partido?.estado === "suspendido";

  const partidosJugables = partidos.filter(
    (item) =>
      partidoListoParaJugar({
        pareja1Id: item.pareja1Id,
        pareja2Id: item.pareja2Id,
        esBye: item.esBye === true,
      }) && !ESTADOS_CERRADOS.includes(item.estado),
  );

  const nombre1 = partido?.pareja1Id ? nombrePareja(partido.pareja1Id) : "Pareja 1";
  const nombre2 = partido?.pareja2Id ? nombrePareja(partido.pareja2Id) : "Pareja 2";

  function actualizarMarcador(
    indice: number,
    campo: keyof MarcadorSetTexto,
    valor: string,
  ) {
    setMarcadores((actual) =>
      actual.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)),
    );
  }

  return (
    <div className="bg-black/20 border border-white/5 rounded-2xl p-6 space-y-6">
      {/* Cabecera */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white m-0">Registrar resultado</h3>
        <p className="text-xs text-[var(--color-text-muted)] m-0">
          Selecciona un partido habilitado para cargar el marcador o definir incidencias.
        </p>
      </div>

      <div className="space-y-4">
        {/* Selección de partido */}
        <div className="space-y-1.5">
          <label className="block text-xs text-[var(--color-text-muted)] font-medium">
            Partido
          </label>
          <select
            value={partidoSeleccionadoId}
            onChange={(e) => setPartidoSeleccionadoId(e.target.value)}
            className={CLASE_SELECT}
          >
            <option value="">Seleccionar partido...</option>
            {partidosJugables.map((item) => (
              <option key={item.id} value={item.id}>
                {item.estado === "suspendido" ? "Resolver suspensión: " : ""}
                {etiquetaPartido(item)} — {nombrePareja(item.pareja1Id ?? "")} vs.{" "}
                {nombrePareja(item.pareja2Id ?? "")}
              </option>
            ))}
          </select>
          {partidosJugables.length === 0 && (
            <p className="text-[11px] text-[var(--color-text-muted)] m-0">
              No hay partidos listos para cargar resultado.
            </p>
          )}
        </div>

        {partido && (
          <div className="text-xs text-[var(--color-text-muted)] bg-white/5 border border-white/5 p-3 rounded-xl">
            Formato:{" "}
            <span className="font-semibold text-white">
              {formato === "un_set" ? "Un set" : "Mejor de 3"}
            </span>{" "}
            <span className="opacity-80">
              {formato === "un_set"
                ? "(a 6 games; tie-break en 6-6)"
                : "(gana quien gane 2 sets)"}
            </span>
          </div>
        )}

        {/* Tipo de resultado */}
        <div className="space-y-1.5">
          <label className="block text-xs text-[var(--color-text-muted)] font-medium">
            Tipo de resultado
          </label>
          <select
            value={tipoResultado}
            onChange={(e) => {
              setTipoResultado(e.target.value as TipoResultado);
              setErrorResultado(null);
            }}
            className={CLASE_SELECT}
          >
            <option value="normal">Partido normal</option>
            <option value="walkover">Walkover</option>
            <option value="abandono">Abandono</option>
            {!esSuspendido && <option value="suspension">Suspensión</option>}
          </select>
        </div>

        {/* Sets (modo normal) */}
        {tipoResultado === "normal" && partido && (
          <div className="space-y-4 pt-2">
            {Array.from({ length: setsVisibles }, (_, indice) => {
              const marcador = marcadores[indice] ?? MARCADOR_SET_VACIO;
              const esTercero = indice === 2;
              const esSuper = esTercero && tipoTercerSet === "super_tiebreak";

              return (
                <div
                  key={indice}
                  className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {esSuper ? "Súper tie-break (a 10 puntos)" : `Set ${indice + 1}`}
                    </span>
                  </div>

                  {esTercero && (
                    <div className="space-y-1">
                      <label className="block text-[11px] text-[var(--color-text-muted)]">
                        Definición del tercer set
                      </label>
                      <select
                        value={tipoTercerSet}
                        onChange={(e) => setTipoTercerSet(e.target.value as TipoTercerSet)}
                        className={CLASE_SELECT}
                      >
                        <option value="set">Set completo</option>
                        <option value="super_tiebreak">Súper tie-break a 10 puntos</option>
                      </select>
                    </div>
                  )}

                  {esSuper ? (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs text-[var(--color-text-muted)]">
                        Puntos de {nombre1}
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={marcador.tieBreakPareja1}
                          onChange={(e) => actualizarMarcador(indice, "tieBreakPareja1", e.target.value)}
                          className={CLASE_INPUT}
                        />
                      </label>
                      <label className="text-xs text-[var(--color-text-muted)]">
                        Puntos de {nombre2}
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={marcador.tieBreakPareja2}
                          onChange={(e) => actualizarMarcador(indice, "tieBreakPareja2", e.target.value)}
                          className={CLASE_INPUT}
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-xs text-[var(--color-text-muted)]">
                          Juegos de {nombre1}
                          <input
                            type="number"
                            min="0"
                            max="7"
                            inputMode="numeric"
                            value={marcador.juegosPareja1}
                            onChange={(e) => actualizarMarcador(indice, "juegosPareja1", e.target.value)}
                            className={CLASE_INPUT}
                          />
                        </label>
                        <label className="text-xs text-[var(--color-text-muted)]">
                          Juegos de {nombre2}
                          <input
                            type="number"
                            min="0"
                            max="7"
                            inputMode="numeric"
                            value={marcador.juegosPareja2}
                            onChange={(e) => actualizarMarcador(indice, "juegosPareja2", e.target.value)}
                            className={CLASE_INPUT}
                          />
                        </label>
                      </div>

                      {requiereTieBreak(marcador) && (
                        <div className="space-y-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-3">
                          <p className="text-xs font-semibold text-[var(--color-accent)] m-0">
                            Tie-break (a 7 puntos, diferencia de 2)
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="text-xs text-[var(--color-text-muted)]">
                              Puntos de {nombre1}
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={marcador.tieBreakPareja1}
                                onChange={(e) => actualizarMarcador(indice, "tieBreakPareja1", e.target.value)}
                                className={CLASE_INPUT}
                              />
                            </label>
                            <label className="text-xs text-[var(--color-text-muted)]">
                              Puntos de {nombre2}
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={marcador.tieBreakPareja2}
                                onChange={(e) => actualizarMarcador(indice, "tieBreakPareja2", e.target.value)}
                                className={CLASE_INPUT}
                              />
                            </label>
                          </div>
                          {marcador.juegosPareja1 === "6" && marcador.juegosPareja2 === "6" && (
                            <p className="text-[11px] text-[var(--color-text-muted)] m-0">
                              El set se completa como 7-6 automáticamente para el ganador del tie-break.
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {vistaPrevia?.ok && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                ✓ Ganador proyectado: {vistaPrevia.ganador === 1 ? nombre1 : nombre2}
              </div>
            )}
            {vistaPrevia && !vistaPrevia.ok && hayMarcadorCargado && (
              <p className="text-xs text-amber-300/80 m-0">{vistaPrevia.error}</p>
            )}
          </div>
        )}

        {/* Walkover o Abandono */}
        {(tipoResultado === "walkover" || tipoResultado === "abandono") && partido && (
          <div className="space-y-1.5">
            <label className="block text-xs text-[var(--color-text-muted)] font-medium">
              Pareja ganadora
            </label>
            <select
              value={ganadorEspecialId}
              onChange={(e) => setGanadorEspecialId(e.target.value)}
              className={CLASE_SELECT}
            >
              <option value="">Seleccionar pareja...</option>
              {partido.pareja1Id && (
                <option value={partido.pareja1Id}>{nombre1}</option>
              )}
              {partido.pareja2Id && (
                <option value={partido.pareja2Id}>{nombre2}</option>
              )}
            </select>
          </div>
        )}

        {/* Checkbox de resultado oficial */}
        <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={resultadoOficial}
            onChange={(e) => setResultadoOficial(e.target.checked)}
            className="rounded border-white/20 bg-black/40 text-[var(--color-accent)] focus:ring-0 w-4 h-4"
          />
          Resultado oficial (genera historial de puntos y estadísticas)
        </label>

        {/* Alertas de error o éxito */}
        {errorResultado && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            ⚠️ {errorResultado}
          </div>
        )}
        {mensajeResultado && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            ✓ {mensajeResultado}
          </div>
        )}

        {/* Botón de guardar */}
        <div className="flex justify-end pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              setMensajeResultado(null);
              void guardarResultado();
            }}
            disabled={guardandoResultado || !partidoSeleccionadoId}
            className="fox-button-primary text-xs py-2.5 px-4 font-semibold transition-all w-full md:w-auto"
          >
            {guardandoResultado ? "Guardando..." : "Guardar resultado"}
          </button>
        </div>
      </div>
    </div>
  );
}