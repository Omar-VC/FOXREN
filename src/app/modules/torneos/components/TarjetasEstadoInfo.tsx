interface Props {
  competencia: {
    id: string;
    genero: string;
    cupoMaximoParejas: number;
    tipoReglaCategoria: string;
    valorReglaCategoria: number;
    estado: string;
  };
  abrirInscripciones: () => void;
  preparar: () => void;
  cambiandoEstado: boolean;
  preparando: boolean;
}

export default function TarjetasEstadoInfo({
  competencia,
  abrirInscripciones,
  preparar,
  cambiandoEstado,
  preparando,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Tarjeta de Información limpia */}
      <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] m-0">
          Información General
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1 border-b border-white/5">
            <span className="text-[var(--color-text-muted)]">Género</span>
            <span className="text-white font-medium">{competencia.genero}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-white/5">
            <span className="text-[var(--color-text-muted)]">Cupo máximo</span>
            <span className="text-white font-medium font-mono">
              {competencia.cupoMaximoParejas} parejas
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[var(--color-text-muted)]">Regla de Categoría</span>
            <span className="text-white font-medium">
              {competencia.tipoReglaCategoria === "individual"
                ? `Categoría ${competencia.valorReglaCategoria}ª`
                : `Suma ${competencia.valorReglaCategoria}`}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Acciones */}
      <div className="bg-black/20 border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] m-0">
          Acciones de Estado
        </h3>

        <div className="flex flex-col justify-center flex-1">
          {competencia.estado === "borrador" && (
            <button
              type="button"
              onClick={abrirInscripciones}
              disabled={cambiandoEstado}
              className="fox-button-primary w-full text-xs py-2.5 px-4 font-semibold transition-all"
            >
              {cambiandoEstado ? "Abriendo..." : "Abrir inscripciones"}
            </button>
          )}

          {competencia.estado === "inscripciones_abiertas" && (
            <button
              type="button"
              onClick={preparar}
              disabled={preparando}
              className="fox-button-primary w-full text-xs py-2.5 px-4 font-semibold transition-all"
            >
              {preparando ? "Verificando..." : "Verificar competencia"}
            </button>
          )}

          {competencia.estado === "inscripciones_cerradas" && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium">
              <span>✓</span>
              <span>Inscripciones cerradas. Lista para el sorteo de zonas.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}