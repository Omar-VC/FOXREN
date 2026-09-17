import React from "react";

interface TorneoDetalleModalProps {
  torneo: any;
  competencias: any[];
  onClose: () => void;
  onInscribirse: (competencia: any) => void;
}

export const TorneoDetalleModal: React.FC<TorneoDetalleModalProps> = ({
  torneo,
  competencias,
  onClose,
  onInscribirse,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
        {/* Cabecera del Torneo */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
          <div>
            <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase">
              {torneo.estado ? torneo.estado.replace("_", " ") : "INSCRIPCION ABIERTA"}
            </span>
            <h2 className="text-2xl font-bold mt-2 text-white">{torneo.nombre}</h2>
            <p className="text-xs text-slate-400 mt-0.5">📍 {torneo.sede || "Sede a confirmar"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Premios y Detalles del Evento */}
        <div className="space-y-4 mb-6">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">
              🏆 Premios
            </h4>
            <p className="text-sm text-slate-300 whitespace-pre-line">
              {torneo.premios || "A confirmar por la organización"}
            </p>
          </div>
        </div>

        {/* Categorías / Competencias Disponibles */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
            🏷️ Categorías Disponibles
          </h3>

          {competencias.length === 0 ? (
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 text-center text-slate-400">
              Aún no hay categorías publicadas para este torneo.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competencias.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-slate-900 border border-slate-700 hover:border-blue-500 rounded-xl p-4 flex flex-col justify-between transition group"
                >
                  <div className="mb-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
                        {comp.nombre || comp.categoria}
                      </h4>
                      <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {comp.genero || "Libre"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mt-1">
                      Inscripción:{" "}
                      <strong className="text-green-400">
                        ${comp.precioInscripcionBase || comp.precio || comp.costo || 0}
                      </strong>
                    </p>
                  </div>

                  <button
                    onClick={() => onInscribirse(comp)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
                  >
                    📝 Inscribirme en esta categoría
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};