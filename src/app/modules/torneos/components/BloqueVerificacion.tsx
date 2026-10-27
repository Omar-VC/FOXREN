interface Props {
  resultadoPreparacion: {
    esValida: boolean;
    resumen: {
      cantidadParejas: number;
      cupoMaximo: number;
      jugadores: number;
    };
    errores: string[];
  } | null;
  copiarInforme: () => void;
  cerrarInscripciones: () => void;
  cambiandoEstado: boolean;
  informeCopiado: boolean;
}

export default function BloqueVerificacion({
  resultadoPreparacion,
  copiarInforme,
  cerrarInscripciones,
  cambiandoEstado,
  informeCopiado,
}: Props) {
  if (!resultadoPreparacion) return null;

  const resumen = resultadoPreparacion.resumen;

  const estadoValidacion = resultadoPreparacion.esValida
    ? "✓ COMPETENCIA LISTA PARA CERRAR INSCRIPCIONES"
    : "✗ HAY ERRORES QUE DEBEN CORREGIRSE";

  const erroresTexto =
    resultadoPreparacion.errores.length === 0
      ? ""
      : [
          "",
          "Errores:",
          ...resultadoPreparacion.errores.map((e) => `- ${e}`),
        ].join("\n");

  return (
    <div
      className={`border rounded-[var(--border-radius)] p-5 ${
        resultadoPreparacion.esValida
          ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
          : "bg-red-950/30 border-red-500/40 text-red-200"
      }`}
    >
      <h2 className="text-lg font-bold mb-2">
        {resultadoPreparacion.esValida
          ? "✓ Competencia lista para cerrar inscripciones"
          : "✗ Problemas a corregir"}
      </h2>

      {resultadoPreparacion.esValida ? (
        <div className="space-y-3 text-sm">
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>
              Parejas: {resumen.cantidadParejas} / {resumen.cupoMaximo} parejas
            </li>
            <li>
              Cupos disponibles:{resumen.cupoMaximo - resumen.cantidadParejas}
            </li>
            <li>Jugadores registrados: {resumen.jugadores}</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="text-red-300">
            {estadoValidacion}
            {erroresTexto && (
              <>
                <br />
                <span className="block mt-1">{erroresTexto}</span>
              </>
            )}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-3">
        <button
          type="button"
          onClick={copiarInforme}
          disabled={cambiandoEstado}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {informeCopiado ? "¡Copiado!" : "Copiar informe"}
        </button>
        <button
          type="button"
          onClick={cerrarInscripciones}
          disabled={cambiandoEstado || !resultadoPreparacion.esValida}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            resultadoPreparacion.esValida
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-slate-800 text-slate-400 border border-slate-600"
          }`}
        >
          {cambiandoEstado ? "Cerrando..." : "Cerrar inscripciones"}
        </button>
      </div>
    </div>
  );
}