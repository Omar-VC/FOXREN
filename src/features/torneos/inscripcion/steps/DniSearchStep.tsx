import React from 'react';

interface DniSearchStepProps {
  dniJ1: string;
  dniJ2: string;
  onChangeDni1: (val: string) => void;
  onChangeDni2: (val: string) => void;
  onSearch: () => void;
  loading: boolean;
  onCancel: () => void;
}

export const DniSearchStep: React.FC<DniSearchStepProps> = ({
  dniJ1,
  dniJ2,
  onChangeDni1,
  onChangeDni2,
  onSearch,
  loading,
  onCancel,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-fox-bg/60 border border-fox-border p-3.5 rounded-xl text-xs text-slate-300">
        🔍 <strong>Paso 1:</strong> Ingresá los DNI de ambos integrantes para verificar si ya se encuentran registrados en el sistema.
      </div>

      <div>
        <label className="block text-xs text-fox-muted font-medium mb-1.5">
          DNI Jugador 1 (Capitán/a)
        </label>
        <input
          type="text"
          placeholder="Ej: 38123456"
          value={dniJ1}
          onChange={(e) => onChangeDni1(e.target.value.replace(/\D/g, ''))}
          maxLength={8}
          className="w-full bg-fox-bg border border-fox-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-fox-neon transition"
        />
      </div>

      <div>
        <label className="block text-xs text-fox-muted font-medium mb-1.5">
          DNI Jugador 2 (Compañero/a)
        </label>
        <input
          type="text"
          placeholder="Ej: 39123456"
          value={dniJ2}
          onChange={(e) => onChangeDni2(e.target.value.replace(/\D/g, ''))}
          maxLength={8}
          className="w-full bg-fox-bg border border-fox-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-fox-neon transition"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-fox-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-fox-muted hover:bg-fox-bg text-sm transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className="bg-fox-neon hover:bg-emerald-400 text-fox-bg font-bold px-5 py-2 rounded-xl text-sm transition cursor-pointer shadow-fox-glow disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Verificar Jugadores →'}
        </button>
      </div>
    </div>
  );
};