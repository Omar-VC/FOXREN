import React, { useState } from "react";
import type { Partido, SetResultado, EstadoPartido } from "../../../domain/partido/partido.types";

interface ResultadoPartidoModalProps {
  partido: Partido;
  onGuardar: (
    partidoId: string,
    sets: SetResultado[],
    ganadorId: string,
    estado: EstadoPartido
  ) => Promise<void>;
  onClose: () => void;
}

export const ResultadoPartidoModal: React.FC<ResultadoPartidoModalProps> = ({
  partido,
  onGuardar,
  onClose,
}) => {
  const set1 = partido.sets?.[0];
  const set2 = partido.sets?.[1];
  const set3 = partido.sets?.[2];

  const [set1P1, setSet1P1] = useState<string>(set1?.juegosPareja1?.toString() || "");
  const [set1P2, setSet1P2] = useState<string>(set1?.juegosPareja2?.toString() || "");

  const [set2P1, setSet2P1] = useState<string>(set2?.juegosPareja1?.toString() || "");
  const [set2P2, setSet2P2] = useState<string>(set2?.juegosPareja2?.toString() || "");

  const [set3P1, setSet3P1] = useState<string>(set3?.juegosPareja1?.toString() || "");
  const [set3P2, setSet3P2] = useState<string>(set3?.juegosPareja2?.toString() || "");

  const [esSuperTieBreak, setEsSuperTieBreak] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nombrePareja1 = partido.nombrePareja1 || "Pareja 1";
  const nombrePareja2 = partido.nombrePareja2 || "Pareja 2";

  const validarSet = (
    p1: number,
    p2: number,
    esTercero = false
  ): { valido: boolean; ganador: 1 | 2 | null; msg?: string } => {
    if (isNaN(p1) || isNaN(p2))
      return { valido: false, ganador: null, msg: "Completá los puntos de ambos lados." };

    if (esTercero && esSuperTieBreak) {
      if ((p1 >= 10 || p2 >= 10) && Math.abs(p1 - p2) >= 2) {
        return { valido: true, ganador: p1 > p2 ? 1 : 2 };
      }
      return {
        valido: false,
        ganador: null,
        msg: "El Super Tie-Break requiere al menos 10 puntos y diferencia de 2.",
      };
    }

    // Reglas set estándar de Pádel (6-0 a 6-4, 7-5, 7-6)
    if ((p1 === 6 && p2 <= 4) || (p1 === 7 && (p2 === 5 || p2 === 6)))
      return { valido: true, ganador: 1 };
    if ((p2 === 6 && p1 <= 4) || (p2 === 7 && (p1 === 5 || p1 === 6)))
      return { valido: true, ganador: 2 };

    return {
      valido: false,
      ganador: null,
      msg: "Resultado de set no válido (ejemplos válidos: 6-4, 7-5, 7-6).",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const s1P1 = parseInt(set1P1, 10);
    const s1P2 = parseInt(set1P2, 10);
    const s2P1 = parseInt(set2P1, 10);
    const s2P2 = parseInt(set2P2, 10);

    const resSet1 = validarSet(s1P1, s1P2);
    if (!resSet1.valido) {
      setErrorMsg(`Set 1 inválido: ${resSet1.msg}`);
      return;
    }

    const resSet2 = validarSet(s2P1, s2P2);
    if (!resSet2.valido) {
      setErrorMsg(`Set 2 inválido: ${resSet2.msg}`);
      return;
    }

    const nuevosSets: SetResultado[] = [
      { setNumero: 1, juegosPareja1: s1P1, juegosPareja2: s1P2 },
      { setNumero: 2, juegosPareja1: s2P1, juegosPareja2: s2P2 },
    ];

    let ganadorFinalId = "";

    // Si empatan en sets (1-1)
    if (resSet1.ganador !== resSet2.ganador) {
      const s3P1Num = parseInt(set3P1, 10);
      const s3P2Num = parseInt(set3P2, 10);

      const resSet3 = validarSet(s3P1Num, s3P2Num, true);
      if (!resSet3.valido) {
        setErrorMsg(`Set 3 requerido por empate 1-1: ${resSet3.msg}`);
        return;
      }

      nuevosSets.push({ setNumero: 3, juegosPareja1: s3P1Num, juegosPareja2: s3P2Num });
      ganadorFinalId = resSet3.ganador === 1 ? partido.pareja1Id : partido.pareja2Id;
    } else {
      ganadorFinalId = resSet1.ganador === 1 ? partido.pareja1Id : partido.pareja2Id;
    }

    setLoading(true);

    try {
      await onGuardar(partido.id, nuevosSets, ganadorFinalId, "FINALIZADO");
      onClose();
    } catch (err) {
      console.error("Error al guardar resultado:", err);
      setErrorMsg("Ocurrió un error al guardar el resultado.");
    } finally {
      setLoading(false);
    }
  };

  const limpiarSoloNumeros = (val: string) => val.replace(/\D/g, "");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 text-white max-w-md w-full relative shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold cursor-pointer"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold mb-1">Cargar / Editar Resultado</h3>
        <p className="text-xs text-slate-400 mb-4">Partido de Torneo</p>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl mb-4">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            {/* Cabecera Tabla */}
            <div className="grid grid-cols-12 text-[11px] text-slate-400 font-semibold border-b border-slate-800 pb-2 text-center">
              <span className="col-span-6 text-left">Pareja</span>
              <span className="col-span-2">Set 1</span>
              <span className="col-span-2">Set 2</span>
              <span className="col-span-2">Set 3</span>
            </div>

            {/* Pareja 1 */}
            <div className="grid grid-cols-12 items-center text-xs gap-1">
              <span className="col-span-6 font-bold text-blue-400 truncate">
                {nombrePareja1}
              </span>
              <div className="col-span-2">
                <input
                  type="text"
                  maxLength={2}
                  value={set1P1}
                  onChange={(e) => setSet1P1(limpiarSoloNumeros(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-center rounded-lg py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  maxLength={2}
                  value={set2P1}
                  onChange={(e) => setSet2P1(limpiarSoloNumeros(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-center rounded-lg py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  maxLength={2}
                  value={set3P1}
                  onChange={(e) => setSet3P1(limpiarSoloNumeros(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-center rounded-lg py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Pareja 2 */}
            <div className="grid grid-cols-12 items-center text-xs gap-1">
              <span className="col-span-6 font-bold text-amber-400 truncate">
                {nombrePareja2}
              </span>
              <div className="col-span-2">
                <input
                  type="text"
                  maxLength={2}
                  value={set1P2}
                  onChange={(e) => setSet1P2(limpiarSoloNumeros(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-center rounded-lg py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  maxLength={2}
                  value={set2P2}
                  onChange={(e) => setSet2P2(limpiarSoloNumeros(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-center rounded-lg py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  maxLength={2}
                  value={set3P2}
                  onChange={(e) => setSet3P2(limpiarSoloNumeros(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-center rounded-lg py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="superTieBreak"
              checked={esSuperTieBreak}
              onChange={(e) => setEsSuperTieBreak(e.target.value === "true")}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
            />
            <label htmlFor="superTieBreak" className="text-xs text-slate-300">
              El 3er set se definió por Super Tie-Break (a 10 puntos)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Resultado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};