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
  return (
    <div>
      <Link
        to={`/admin/torneos`}
        className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors inline-block mb-3"
      >
        ← Volver a torneos
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">{competencia.nombre}</h1>
          <p className="admin-page-description">
            Centro operativo de la competencia.
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            competencia.estado === "inscripciones_cerradas"
              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
              : competencia.estado === "inscripciones_abiertas"
                ? "bg-sky-950 text-sky-300 border border-sky-800"
                : "bg-slate-800 text-slate-300 border border-slate-700"
          }`}
        >
          {competencia.estado.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}