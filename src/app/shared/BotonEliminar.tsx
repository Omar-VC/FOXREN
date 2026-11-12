import { useState } from "react";

interface Props {
  /** Texto que hay que escribir para confirmar (normalmente el nombre). */
  nombre: string;
  /** Qué se va a perder, en una frase. */
  advertencia: string;
  onConfirmar: () => Promise<void>;
  etiqueta?: string;
}

/** Eliminación con confirmación escrita, para borrados que no se pueden deshacer. */
export default function BotonEliminar({
  nombre,
  advertencia,
  onConfirmar,
  etiqueta = "Eliminar",
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coincide =
    texto.trim().toLowerCase() === nombre.trim().toLowerCase() && texto.trim() !== "";

  function cerrar() {
    setAbierto(false);
    setTexto("");
    setError(null);
  }

  async function confirmar() {
    if (!coincide) return;
    try {
      setEliminando(true);
      setError(null);
      await onConfirmar();
      cerrar();
    } catch (causa) {
      setError(
        causa instanceof Error ? causa.message : "No se pudo eliminar.",
      );
    } finally {
      setEliminando(false);
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-bold transition-colors"
      >
        {etiqueta}
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      className="w-full space-y-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
    >
      <p className="m-0">{advertencia}</p>
      <p className="m-0">
        Para confirmar, escribí: <strong className="text-white">{nombre}</strong>
      </p>
      <input
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        disabled={eliminando}
        autoFocus
        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-white focus:border-red-400 focus:outline-none"
      />
      {error && <p className="m-0 font-semibold text-red-300">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={cerrar}
          disabled={eliminando}
          className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-semibold"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void confirmar()}
          disabled={!coincide || eliminando}
          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold disabled:opacity-40"
        >
          {eliminando ? "Eliminando..." : "Eliminar definitivamente"}
        </button>
      </div>
    </div>
  );
}
