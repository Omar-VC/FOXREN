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
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white";
const CLASE_SELECT =
  "w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white";

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

  // Solo se ofrecen partidos que se pueden jugar: con las dos parejas definidas,
  // que no sean un bye y que no estén cerrados.
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
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
      <h4 className="text-lg font-semibold text-slate-100 mb-4">
        Registrar resultado
      </h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Partido</label>
          <select
            value={partidoSeleccionadoId}
            onChange={(e) => setPartidoSeleccionadoId(e.target.value)}
            className={CLASE_SELECT}
          >
            <option value="">Seleccionar partido</option>
            {partidosJugables.map((item) => (
              <option key={item.id} value={item.id}>
                {item.estado === "suspendido" ? "Resolver suspensión: " : ""}
                {etiquetaPartido(item)} — {nombrePareja(item.pareja1Id ?? "")} vs.{" "}
                {nombrePareja(item.pareja2Id ?? "")}
              </option>
            ))}
          </select>
          {partidosJugables.length === 0 && (
            <p className="mt-1 text-xs text-slate-500">
              No hay partidos listos para cargar resultado.
            </p>
          )}
        </div>

        {partido && (
          <p className="text-xs text-slate-400">
            Formato:{" "}
            <span className="font-semibold text-slate-200">
              {formato === "un_set" ? "Un set" : "Mejor de 3"}
            </span>{" "}
            {formato === "un_set"
              ? "(a 6 games; en 6-6, tie-break a 7 puntos)"
              : "(gana quien gane 2 sets; con 1-1, tercer set o súper tie-break a 10)"}
          </p>
        )}

        <div>
          <label className="block text-sm text-slate-300 mb-1">
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

        {tipoResultado === "normal" && partido && (
          <>
            {Array.from({ length: setsVisibles }, (_, indice) => {
              const marcador = marcadores[indice] ?? MARCADOR_SET_VACIO;
              const esTercero = indice === 2;
              const esSuper = esTercero && tipoTercerSet === "super_tiebreak";

              return (
                <div
                  key={indice}
                  className="rounded-lg border border-slate-700 p-3 space-y-3"
                >
                  <p className="text-sm font-semibold text-slate-200">
                    {esSuper ? "Súper tie-break (a 10 puntos)" : `Set ${indice + 1}`}
                  </p>

                  {esTercero && (
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Cómo se define el tercer set
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
                      <label className="text-xs text-slate-400">
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
                      <label className="text-xs text-slate-400">
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
                        <label className="text-xs text-slate-400">
                          {nombre1}
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
                        <label className="text-xs text-slate-400">
                          {nombre2}
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
                        <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                          <p className="text-sm font-medium text-amber-300">
                            Tie-break (a 7 puntos, diferencia de 2)
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="text-xs text-slate-400">
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
                            <label className="text-xs text-slate-400">
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
                            <p className="text-xs text-slate-400">
                              El set se completa solo como 7-6 para quien gane el tie-break.
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
              <p className="text-sm font-semibold text-emerald-300">
                Ganador: {vistaPrevia.ganador === 1 ? nombre1 : nombre2}
              </p>
            )}
            {vistaPrevia && !vistaPrevia.ok && hayMarcadorCargado && (
              <p className="text-xs text-slate-400">{vistaPrevia.error}</p>
            )}
          </>
        )}

        {(tipoResultado === "walkover" || tipoResultado === "abandono") && partido && (
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Pareja ganadora
            </label>
            <select
              value={ganadorEspecialId}
              onChange={(e) => setGanadorEspecialId(e.target.value)}
              className={CLASE_SELECT}
            >
              <option value="">Seleccionar pareja</option>
              {partido.pareja1Id && (
                <option value={partido.pareja1Id}>{nombre1}</option>
              )}
              {partido.pareja2Id && (
                <option value={partido.pareja2Id}>{nombre2}</option>
              )}
            </select>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={resultadoOficial}
            onChange={(e) => setResultadoOficial(e.target.checked)}
            className="accent-emerald-500"
          />
          Resultado oficial (genera historial)
        </label>

        {errorResultado && (
          <p className="text-sm text-red-300">{errorResultado}</p>
        )}

        {mensajeResultado && (
          <p className="text-sm text-emerald-300">{mensajeResultado}</p>
        )}

        <button
          type="button"
          onClick={() => {
            setMensajeResultado(null);
            void guardarResultado();
          }}
          disabled={guardandoResultado || !partidoSeleccionadoId}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {guardandoResultado ? "Guardando..." : "Guardar resultado"}
        </button>
      </div>
    </div>
  );
}
