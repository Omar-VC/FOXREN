import { useState } from "react";

import { auth } from "../../../infrastructure/firebase/firebase";
import { enviarMailCambioPassword } from "../../../application/usuarios/accesos";

interface Props {
  className?: string;
}

/** Manda a quien está logueado un mail para elegir una contraseña nueva. */
export default function BotonCambiarPassword({ className }: Props) {
  const [estado, setEstado] = useState<"quieto" | "enviando" | "enviado" | "error">("quieto");

  async function enviar() {
    const email = auth.currentUser?.email;
    if (!email) return;
    try {
      setEstado("enviando");
      await enviarMailCambioPassword(email);
      setEstado("enviado");
    } catch {
      setEstado("error");
    }
  }

  const texto =
    estado === "enviando"
      ? "Enviando..."
      : estado === "enviado"
        ? "Revisá tu mail ✓"
        : estado === "error"
          ? "No se pudo enviar"
          : "Cambiar contraseña";

  return (
    <button
      type="button"
      onClick={() => void enviar()}
      disabled={estado === "enviando" || estado === "enviado"}
      className={
        className ??
        "px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-60"
      }
    >
      {texto}
    </button>
  );
}
