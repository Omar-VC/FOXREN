import { Link } from "react-router-dom";

interface Props {
  competencia: {
    id: string;
    nombre: string;
    estado: string;
  };
}

export default function EncabezadoCompetencia({
  competencia,
}: Props) {
  // Función auxiliar para formatear bonitamente el estado y darle color dinámico
  const obtenerEstiloEstado = (estado: string) => {
    switch (estado) {
      case "en_curso":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "inscripciones_cerradas":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "inscripciones_abiertas":
        return "bg-sky-500/10 text-sky-300 border-sky-500/30";
      case "finalizada":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-3">
      <Link
        to={`/admin/torneos`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[var(--color-accent)] transition-colors bg-white/[0.03] hover:bg-white/[0.06] border border-[var(--color-border)] px-3 py-1.5 rounded-lg w-fit"
      >
        <span>←</span> Volver a torneos
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {competencia.nombre}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Centro operativo y gestión general de la competencia.
          </p>
        </div>

        <div className="flex items-center self-start md:self-auto">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${obtenerEstiloEstado(
              competencia.estado
            )}`}
          >
            ● {competencia.estado.replaceAll("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}