import React, { useState } from "react";
import type { Partido, SetResultado, EstadoPartido } from "../../../domain/partido/partido.types";

interface ResultadoPartidoModalProps {
  partido: Partido;
  onGuardar: (partidoId: string, sets: SetResultado[], ganadorId: string, estado: EstadoPartido) => Promise<void>;
  onClose: () => void;
}

export const ResultadoPartidoModal: React.FC<ResultadoPartidoModalProps> = ({
  partido,
  onGuardar,
  onClose,
}) => {
  const [set1P1, setSet1P1] = useState(partido.sets[0]?.juegosPareja1 ?? 0);
  const [set1P2, setSet1P2] = useState(partido.sets[0]?.juegosPareja2 ?? 0);
  
  const [set2P1, setSet2P1] = useState(partido.sets[1]?.juegosPareja1 ?? 0);
  const [set2P2, setSet2P2] = useState(partido.sets[1]?.juegosPareja2 ?? 0);

  const [set3P1, setSet3P1] = useState(partido.sets[2]?.juegosPareja1 ?? 0);
  const [set3P2, setSet3P2] = useState(partido.sets[2]?.juegosPareja2 ?? 0);

  const [esTercerSet, setEsTercerSet] = useState((partido.sets.length > 2));
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const sets: SetResultado[] = [
        { setNumero: 1, juegosPareja1: Number(set1P1), juegosPareja2: Number(set1P2) },
        { setNumero: 2, juegosPareja1: Number(set2P1), juegosPareja2: Number(set2P2) },
      ];

      if (esTercerSet) {
        sets.push({ setNumero: 3, juegosPareja1: Number(set3P1), juegosPareja2: Number(set3P2) });
      }

      // Determinar ganador por suma de sets
      let setsGanadosP1 = 0;
      let setsGanadosP2 = 0;

      sets.forEach((s) => {
        if (s.juegosPareja1 > s.juegosPareja2) setsGanadosP1++;
        if (s.juegosPareja2 > s.juegosPareja1) setsGanadosP2++;
      });

      const ganadorId = setsGanadosP1 > setsGanadosP2 ? partido.pareja1Id : partido.pareja2Id;

      await onGuardar(partido.id, sets, ganadorId, "FINALIZADO");
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full text-white space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm">Cargar Resultado de Partido</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="font-bold text-blue-400">{partido.nombrePareja1 || "Pareja 1"}</span>
            <span className="text-slate-500 font-mono">VS</span>
            <span className="font-bold text-emerald-400">{partido.nombrePareja2 || "Pareja 2"}</span>
          </div>

          {/* Set 1 */}
          <div className="grid grid-cols-3 gap-2 items-center bg-slate-800/40 p-2 rounded-lg">
            <span className="font-bold text-slate-300">Set 1:</span>
            <input
              type="number"
              min="0"
              max="15"
              value={set1P1}
              onChange={(e) => setSet1P1(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-blue-400"
            />
            <input
              type="number"
              min="0"
              max="15"
              value={set1P2}
              onChange={(e) => setSet1P2(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-emerald-400"
            />
          </div>

          {/* Set 2 */}
          <div className="grid grid-cols-3 gap-2 items-center bg-slate-800/40 p-2 rounded-lg">
            <span className="font-bold text-slate-300">Set 2:</span>
            <input
              type="number"
              min="0"
              max="15"
              value={set2P1}
              onChange={(e) => setSet2P1(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-blue-400"
            />
            <input
              type="number"
              min="0"
              max="15"
              value={set2P2}
              onChange={(e) => setSet2P2(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-emerald-400"
            />
          </div>

          {/* Habilitar Set 3 */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="tercerSet"
              checked={esTercerSet}
              onChange={(e) => setEsTercerSet(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-500"
            />
            <label htmlFor="tercerSet" className="text-slate-400 text-[11px] cursor-pointer">
              ¿Se jugó un 3er set / Super Tie-Break?
            </label>
          </div>

          {esTercerSet && (
            <div className="grid grid-cols-3 gap-2 items-center bg-slate-800/40 p-2 rounded-lg">
              <span className="font-bold text-slate-300">Set 3:</span>
              <input
                type="number"
                min="0"
                max="15"
                value={set3P1}
                onChange={(e) => setSet3P1(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-blue-400"
              />
              <input
                type="number"
                min="0"
                max="15"
                value={set3P2}
                onChange={(e) => setSet3P2(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-emerald-400"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs"
          >
            Cancelar
          </button>
          <button
            disabled={guardando}
            onClick={handleGuardar}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "✓ Confirmar Resultado"}
          </button>
        </div>
      </div>
    </div>
  );
};