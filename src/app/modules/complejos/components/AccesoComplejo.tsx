import { useState } from "react";

import { passwordDesdeBytes } from "../../../../domain/usuario/usuario.acceso";
import { useAccesosComplejo } from "../hooks/useAccesosComplejo";

const CLASE_INPUT =
  "w-full rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none";
const CLASE_BOTON =
  "px-2.5 py-1 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-[11px] font-semibold disabled:opacity-40";

interface Props {
  complejoId: string;
}

/** Cuentas de acceso del complejo. Solo se monta en el panel del superadmin. */
export default function AccesoComplejo({ complejoId }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    cuentas, cargando, trabajando, error, mensaje,
    crearAcceso, alternarActivo, enviarMailPassword,
  } = useAccesosComplejo(complejoId, abierto);

  function generarPassword() {
    setPassword(passwordDesdeBytes(globalThis.crypto.getRandomValues(new Uint8Array(12))));
  }

  async function crear(event: React.FormEvent) {
    event.preventDefault();
    if (await crearAcceso(email, password)) {
      setEmail("");
      setPassword("");
    }
  }

  return (
    <div className="pt-2 border-t border-[var(--color-border)] space-y-3">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
      >
        {abierto ? "Ocultar accesos" : "🔑 Accesos de este complejo"}
      </button>

      {abierto && (
        <div className="space-y-3">
          {error && <p className="m-0 text-xs font-semibold text-red-400">⚠️ {error}</p>}
          {mensaje && <p className="m-0 text-xs font-semibold text-emerald-300">{mensaje}</p>}

          {cargando ? (
            <p className="m-0 text-xs text-slate-400">Cargando accesos...</p>
          ) : cuentas.length === 0 ? (
            <p className="m-0 text-xs text-slate-400">Todavía no tiene accesos.</p>
          ) : (
            <ul className="m-0 list-none space-y-2 p-0">
              {cuentas.map((cuenta) => (
                <li
                  key={cuenta.uid}
                  className="rounded-lg border border-white/5 bg-black/20 p-2.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white break-all">
                      {cuenta.email ?? cuenta.uid}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        cuenta.activo ? "text-emerald-300" : "text-red-400"
                      }`}
                    >
                      {cuenta.activo ? "Activo" : "Desactivado"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={CLASE_BOTON}
                      disabled={trabajando}
                      onClick={() => void alternarActivo(cuenta)}
                    >
                      {cuenta.activo ? "Desactivar" : "Activar"}
                    </button>
                    {cuenta.email && (
                      <button
                        type="button"
                        className={CLASE_BOTON}
                        disabled={trabajando}
                        onClick={() => void enviarMailPassword(cuenta.email as string)}
                      >
                        Enviar mail de contraseña
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={crear} className="space-y-2">
            <p className="m-0 text-xs font-bold text-white">Nuevo acceso</p>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email de la persona"
              required
              className={CLASE_INPUT}
            />
            <div className="flex gap-2">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Contraseña inicial (mín. 8)"
                required
                className={CLASE_INPUT}
              />
              <button type="button" className={CLASE_BOTON} onClick={generarPassword}>
                Generar
              </button>
            </div>
            <button
              type="submit"
              disabled={trabajando}
              className="fox-button-primary text-xs py-2 px-3 font-semibold"
            >
              {trabajando ? "Creando..." : "Crear acceso"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
