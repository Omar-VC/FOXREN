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
      {/* Detalle */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-slate-100">
          Información
        </h2>
        <div className="space-y-1.5 text-sm text-slate-300">
          <p>
            <span className="text-slate-400">Género:</span>{" "}
            {competencia.genero}
          </p>
          <p>
            <span className="text-slate-400">Cupo máximo:</span>{" "}
            {competencia.cupoMaximoParejas} parejas
          </p>
          <p>
            <span className="text-slate-400">Regla de Categoría:</span>{" "}
            {competencia.tipoReglaCategoria === "individual"
              ? `Categoría ${competencia.valorReglaCategoria}ª`
              : `Suma ${competencia.valorReglaCategoria}`}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg flex flex-col justify-center">
        <h2 className="text-lg font-semibold mb-3 text-slate-100">
          Acciones
        </h2>
        {competencia.estado === "borrador" && (
          <button
            type="button"
            onClick={abrirInscripciones}
            disabled={cambiandoEstado}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {cambiandoEstado ? "Abriendo..." : "Abrir inscripciones"}
          </button>
        )}

        {competencia.estado === "inscripciones_abiertas" && (
          <button
            type="button"
            onClick={preparar}
            disabled={preparando}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {preparando ? "Verificando..." : "Verificar competencia"}
          </button>
        )}

        {competencia.estado === "inscripciones_cerradas" && (
          <p className="text-emerald-400 text-sm font-medium">
            ✓ Inscripciones cerradas. La competencia se encuentra lista para
            el sorteo de zonas.
          </p>
        )}
      </div>
    </div>
  );
}