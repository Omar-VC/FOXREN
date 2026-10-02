import React from 'react';

interface PaymentStepProps {
  precio: number;
  alias: string;
  aliasCopiado: boolean;
  onCopiarAlias: () => void;
  comprobante: string;
  onChangeComprobante: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  precio,
  alias,
  aliasCopiado,
  onCopiarAlias,
  comprobante,
  onChangeComprobante,
  onSubmit,
  onBack,
  loading,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="bg-fox-bg border border-fox-border rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-fox-muted font-medium">Monto Total Pareja:</span>
          <span className="text-xl font-black text-fox-neon">
            ${precio?.toLocaleString('es-AR')}
          </span>
        </div>

        <div className="pt-2 border-t border-fox-border/60 flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <span className="text-[11px] text-fox-muted block">Alias de transferencia:</span>
            <span className="text-xs font-mono font-bold text-amber-300 truncate block">
              {alias}
            </span>
          </div>
          <button
            type="button"
            onClick={onCopiarAlias}
            className="px-3 py-1 bg-fox-surface hover:bg-fox-border border border-fox-border rounded-lg text-xs text-slate-200 transition shrink-0 cursor-pointer"
          >
            {aliasCopiado ? '¡Copiado! ✓' : 'Copiar Alias'}
          </button>
        </div>
      </div>

      <div className="bg-fox-bg p-4 rounded-xl border border-fox-border">
        <label className="block text-xs font-bold text-fox-neon mb-1">
          Número de Comprobante / Transacción
        </label>
        <input
          type="text"
          value={comprobante}
          onChange={(e) => onChangeComprobante(e.target.value)}
          placeholder="Ej: 9812739123 o 'Transferido desde MP'"
          className="w-full bg-fox-surface border border-fox-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fox-neon"
        />
        <span className="text-[11px] text-fox-muted block mt-1">
          Ingresá la referencia del pago para agilizar la aprobación del organizador.
        </span>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-fox-border">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-fox-muted hover:text-white underline transition"
        >
          ← Volver a Horarios
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-fox-neon hover:bg-emerald-400 text-fox-bg font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-fox-glow disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Finalizar Inscripción'}
        </button>
      </div>
    </form>
  );
};