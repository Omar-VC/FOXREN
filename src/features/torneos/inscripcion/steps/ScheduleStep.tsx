import React from 'react';

interface JugadorData {
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
  existe: boolean | null;
}

interface ScheduleStepProps {
  j1: JugadorData;
  j2: JugadorData;
  onChangeJ1: (field: keyof JugadorData, val: string) => void;
  onChangeJ2: (field: keyof JugadorData, val: string) => void;
  restriccionHoraria: string;
  onChangeRestriccion: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
  j1,
  j2,
  onChangeJ1,
  onChangeJ2,
  restriccionHoraria,
  onChangeRestriccion,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-fox-bg/60 border border-fox-border p-3.5 rounded-xl text-xs text-slate-300">
        📅 <strong>Paso 2:</strong> Confirmá los datos de contacto y especificá restricciones de horarios para el armado de zonas y partidos.
      </div>

      {/* Jugador 1 */}
      <div className="bg-fox-bg/80 p-3.5 rounded-xl border border-fox-border space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-fox-neon">Jugador 1 (DNI: {j1.dni})</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j1.existe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {j1.existe ? 'En Padrón ✓' : 'Nuevo Registro'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Nombre"
            value={j1.nombre}
            disabled={!!j1.existe}
            onChange={(e) => onChangeJ1('nombre', e.target.value)}
            className="bg-fox-surface border border-fox-border rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-60"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={j1.apellido}
            disabled={!!j1.existe}
            onChange={(e) => onChangeJ1('apellido', e.target.value)}
            className="bg-fox-surface border border-fox-border rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-60"
          />
        </div>
        <input
          type="text"
          placeholder="WhatsApp de Contacto"
          value={j1.telefono}
          onChange={(e) => onChangeJ1('telefono', e.target.value.replace(/\D/g, ''))}
          className="w-full bg-fox-surface border border-fox-border rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>

      {/* Jugador 2 */}
      <div className="bg-fox-bg/80 p-3.5 rounded-xl border border-fox-border space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-fox-neon">Jugador 2 (DNI: {j2.dni})</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j2.existe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {j2.existe ? 'En Padrón ✓' : 'Nuevo Registro'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Nombre"
            value={j2.nombre}
            disabled={!!j2.existe}
            onChange={(e) => onChangeJ2('nombre', e.target.value)}
            className="bg-fox-surface border border-fox-border rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-60"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={j2.apellido}
            disabled={!!j2.existe}
            onChange={(e) => onChangeJ2('apellido', e.target.value)}
            className="bg-fox-surface border border-fox-border rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-60"
          />
        </div>
        <input
          type="text"
          placeholder="WhatsApp de Contacto"
          value={j2.telefono}
          onChange={(e) => onChangeJ2('telefono', e.target.value.replace(/\D/g, ''))}
          className="w-full bg-fox-surface border border-fox-border rounded-lg px-3 py-1.5 text-xs text-white"
        />
      </div>

      {/* Restricción de Horarios */}
      <div className="bg-fox-bg p-3.5 rounded-xl border border-fox-border">
        <label className="block text-xs font-medium text-fox-muted mb-1">
          Disponibilidad u Horarios Restringidos (Opcional)
        </label>
        <textarea
          rows={2}
          placeholder="Ej: 'Viernes a partir de las 19hs' o 'Sábado únicamente por la tarde'"
          value={restriccionHoraria}
          onChange={(e) => onChangeRestriccion(e.target.value)}
          className="w-full bg-fox-surface border border-fox-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-fox-neon resize-none"
        />
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-fox-border">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-fox-muted hover:text-white underline transition"
        >
          ← Volver al DNI
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-fox-neon hover:bg-emerald-400 text-fox-bg font-bold px-5 py-2 rounded-xl text-xs transition shadow-fox-glow"
        >
          Ir al Pago y Confirmación →
        </button>
      </div>
    </div>
  );
};