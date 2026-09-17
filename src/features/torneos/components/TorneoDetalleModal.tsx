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
  const formatearFecha = (fecha: any): string => {
    if (!fecha) return "A confirmar";
    if (typeof fecha === "string") return fecha;
    if (fecha?.toDate) return fecha.toDate().toLocaleDateString();
    if (fecha?.seconds)
      return new Date(fecha.seconds * 1000).toLocaleDateString();
    if (fecha instanceof Date) return fecha.toLocaleDateString();
    return "A confirmar";
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto relative text-white">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
        >
          ✕
        </button>

        {/* Encabezado con Banner / Badge */}
        <div className="mb-6 border-b border-slate-700 pb-4">
          <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            {torneo.estado ? torneo.estado.replace("_", " ") : "ACTIVO"}
          </span>
          <h2 className="text-3xl font-extrabold mt-3">{torneo.nombre}</h2>
          <p className="text-slate-400 text-sm mt-1">
            📍{" "}
            {torneo.sede ||
              torneo.clubSede ||
              torneo.club ||
              "Sede a confirmar"}
          </p>
        </div>

        {/* Información General del Torneo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block font-semibold">
              FECHA DE INICIO
            </span>
            <span className="text-base font-bold text-slate-200">
              📅 {formatearFecha(torneo.fechaInicio || torneo.fecha)}
            </span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block font-semibold">
              SEDE PRINCIPAL
            </span>
            <span className="text-base font-bold text-slate-200">
              🏟️ {torneo.sede || torneo.club || "A confirmar"}
            </span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block font-semibold">
              PREMIOS
            </span>
            <span className="text-base font-bold text-yellow-400">
              🏆 {torneo.premios || "Trofeos + Premios sponsors"}
            </span>
          </div>
        </div>

        {/* Descripción o Reglamento si existiera */}
        {torneo.descripcion && (
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/40 mb-6">
            <h4 className="text-sm font-bold text-slate-300 mb-1">
              Información Adicional
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {torneo.descripcion}
            </p>
          </div>
        )}

        {/* Lista de Categorías Habilitadas */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
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
                        {comp.categoria || comp.nombre}
                      </h4>
                      <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {comp.genero || "Libre"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Inscripción:{" "}
                      <strong className="text-green-400">
                        $
                        {comp.precio ||
                          comp.costo ||
                          comp.montoInscripcion ||
                          0}
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
