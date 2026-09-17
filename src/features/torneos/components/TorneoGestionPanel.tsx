import React, { useState } from "react";
import { CompetenciaForm } from "../../competencias/components/CompetenciaForm";

interface TorneoGestionPanelProps {
  torneo: any;
  competencias: any[];
  parejas: any[];
  onClose: () => void;
}

export const TorneoGestionPanel: React.FC<TorneoGestionPanelProps> = ({
  torneo,
  competencias,
  parejas,
  onClose,
}) => {
  const [modoCrearCompetencia, setModoCrearCompetencia] = useState(false);
  const [categoriaExpandidaId, setCategoriaExpandidaId] = useState<string | null>(null);

  const competenciasDelTorneo = competencias.filter((c) => c.torneoId === torneo.id);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
        <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
          <div>
            <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
              Panel de Control Organizador
            </span>
            <h2 className="text-2xl font-bold mt-1">{torneo.nombre}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Categorías del Torneo
          </h3>
          <button
            onClick={() => setModoCrearCompetencia(!modoCrearCompetencia)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
          >
            {modoCrearCompetencia ? "Cancelar" : "➕ Nueva Categoría"}
          </button>
        </div>

        {modoCrearCompetencia && (
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 mb-4">
            <CompetenciaForm
              torneoId={torneo.id}
              onSuccess={() => setModoCrearCompetencia(false)}
            />
          </div>
        )}

        <div className="space-y-3">
          {competenciasDelTorneo.map((comp) => {
            const parejasCat = parejas.filter((p) => p.competenciaId === comp.id);
            const estaExpandida = categoriaExpandidaId === comp.id;

            return (
              <div key={comp.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div
                  onClick={() => setCategoriaExpandidaId(estaExpandida ? null : comp.id)}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-white">{comp.categoria || comp.nombre}</h4>
                    <span className="text-xs text-slate-400">
                      Inscriptos: {parejasCat.length} parejas | Inscripción: ${comp.precio || 0}
                    </span>
                  </div>
                  <span className="text-slate-400">{estaExpandida ? "▲" : "▼"}</span>
                </div>

                {estaExpandida && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60">
                    <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Lista de Parejas</h5>
                    {parejasCat.length === 0 ? (
                      <p className="text-xs text-slate-500">No hay parejas inscriptas aún.</p>
                    ) : (
                      <div className="space-y-2">
                        {parejasCat.map((p, idx) => (
                          <div key={p.id || idx} className="bg-slate-900/80 p-2.5 rounded-lg flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-200">
                                {p.jugador1?.nombre} {p.jugador1?.apellido} & {p.jugador2?.nombre} {p.jugador2?.apellido}
                              </span>
                              <span className="block text-[10px] text-slate-500">
                                Tel: {p.jugador1?.telefono || "N/A"} | Comp: {p.comprobantePago || "Sin comprobante"}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              p.estadoPago === "APROBADO" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {p.estadoPago || "PENDIENTE"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};