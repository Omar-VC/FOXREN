import React from 'react';
import type { Torneo } from '../../../domain/torneo/torneo.types';

interface Competencia {
  id: string;
  torneoId: string;
  nombre: string;
  categoriaId: string;
  genero: string;
  precioInscripcionBase: number;
  cupoMaximoParejas: number;
  descripcion?: string;
  estado?: string;
}

interface TorneoDetalleModalProps {
  torneo: Torneo & {
    contactoOrganizador?: string;
    telefonoOrganizador?: string;
    telefono?: string;
  };
  competencias?: Competencia[];
  onClose: () => void;
  onInscribirCompetencia?: (competencia: Competencia) => void;
}

export const TorneoDetalleModal: React.FC<TorneoDetalleModalProps> = ({
  torneo,
  competencias = [],
  onClose,
  onInscribirCompetencia,
}) => {
  const telefonoContacto =
    torneo.contactoOrganizador ||
    torneo.telefonoOrganizador ||
    torneo.telefono ||
    '';

  const numeroLimpio = telefonoContacto.replace(/\D/g, '');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-fox-surface border border-fox-border rounded-2xl max-w-3xl w-full text-slate-100 relative shadow-2xl overflow-hidden my-8">
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 bg-fox-bg/80 hover:bg-fox-border text-slate-300 hover:text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm z-10 transition cursor-pointer border border-fox-border/60"
        >
          ✕
        </button>

        {/* Header / Banner del Torneo */}
        <div className="relative bg-gradient-to-r from-emerald-950/40 via-fox-surface to-slate-900 p-6 border-b border-fox-border pt-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {torneo.validoParaRanking && (
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">
                🏆 Válido para Ranking
              </span>
            )}
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">
              🟢 {torneo.estado?.replace('_', ' ') || 'INSCRIPCION ABIERTA'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {torneo.nombre}
          </h2>
          <p className="text-sm text-fox-muted mt-1 flex items-center gap-1">
            📍 Sede: <span className="text-slate-200 font-semibold">{torneo.sede || 'A confirmar'}</span>
          </p>
        </div>

        {/* Contenido Modal */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                🎁 Premiación General
              </span>
              <p className="text-lg font-extrabold text-amber-200">
                {torneo.premios || 'A confirmar'}
              </p>
            </div>

            <div className="bg-fox-bg/60 border border-fox-border rounded-xl p-4 space-y-3">
              <div>
                <span className="text-xs text-fox-muted block font-medium">💳 Datos de Pago (Mercado Pago / Transf.)</span>
                {torneo.datosPago?.alias ? (
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    Alias: <span className="text-fox-neon font-mono">{torneo.datosPago.alias}</span>
                  </p>
                ) : (
                  <p className="text-xs text-fox-muted mt-0.5">Consultar al momento de transferir</p>
                )}
                {torneo.datosPago?.titular && (
                  <p className="text-xs text-fox-muted mt-0.5">Titular: {torneo.datosPago.titular}</p>
                )}
              </div>

              {/* 📞 Contacto Directo del Organizador */}
              <div className="pt-2 border-t border-fox-border/60">
                <span className="text-xs text-fox-muted block font-medium">📞 Contacto del Organizador</span>
                {telefonoContacto ? (
                  <a
                    href={`https://wa.me/${numeroLimpio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-fox-neon hover:underline mt-1 transition"
                  >
                    💬 WhatsApp: {telefonoContacto}
                  </a>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5">No especificado</p>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Categorías */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              🎾 Categorías Disponibles ({competencias.length})
            </h3>

            {competencias.length === 0 ? (
              <div className="bg-fox-bg/40 border border-fox-border rounded-xl p-6 text-center text-fox-muted text-sm">
                No hay categorías registradas en este torneo.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {competencias.map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-fox-bg/80 border border-fox-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-fox-subtle transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">{comp.nombre}</h4>
                        <span className="bg-fox-surface border border-fox-border text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono uppercase">
                          {comp.genero}
                        </span>
                      </div>
                      {comp.descripcion && (
                        <p className="text-xs text-fox-muted">{comp.descripcion}</p>
                      )}
                      <p className="text-xs text-fox-muted">
                        👥 Cupo máx: <span className="text-slate-200 font-medium">{comp.cupoMaximoParejas} parejas</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-fox-border/60">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-fox-muted block">Inscripción</span>
                        <span className="text-base font-extrabold text-fox-neon">
                          ${comp.precioInscripcionBase?.toLocaleString('es-AR')}
                        </span>
                      </div>

                      {onInscribirCompetencia && (
                        <button
                          type="button"
                          onClick={() => onInscribirCompetencia(comp)}
                          className="bg-fox-neon hover:bg-emerald-400 text-fox-bg font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-fox-glow"
                        >
                          📝 Inscribirme
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-fox-bg border-t border-fox-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-fox-muted hover:text-white hover:bg-fox-surface text-sm font-medium transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};