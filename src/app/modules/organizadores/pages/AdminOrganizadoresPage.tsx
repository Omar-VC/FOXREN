import { useCallback, useEffect, useState } from "react";
import type { Organizador } from "../../../../domain/organizador/organizador.types";
import { organizadorEsValido } from "../../../../domain/organizador/organizador.rules";
import { organizadoresRepository } from "../../../../infrastructure/repositories/organizadoresRepository";

const CLASE_INPUT =
  "w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors";

export default function AdminOrganizadoresPage() {
  const [organizadores, setOrganizadores] = useState<Organizador[]>([]);
  const [nombre, setNombre] = useState("");
  const [contactoPublico, setContactoPublico] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setOrganizadores(await organizadoresRepository.obtenerOrganizadores());
      setError(null);
    } catch {
      setError("No se pudieron cargar los organizadores.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(cargar);
  }, [cargar]);

  async function crear(event: React.FormEvent) {
    event.preventDefault();
    const datos = { nombre, contactoPublico: contactoPublico || undefined, activo: true };
    if (!organizadorEsValido(datos)) {
      setError("Ingresá el nombre del organizador.");
      return;
    }
    try {
      setGuardando(true);
      setError(null);
      await organizadoresRepository.crearOrganizador(datos);
      setNombre("");
      setContactoPublico("");
      await cargar();
    } catch {
      setError("No se pudo crear el organizador.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="space-y-8">
      {/* Cabecera de la página */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight m-0">
          Administrar organizadores
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] m-0">
          Los organizadores son contactos asociados a eventos; no reciben acceso al sistema.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Formulario de creación integrado en bloque sutil */}
      <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white m-0 mb-4">Nuevo organizador</h3>
        <form onSubmit={crear} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-[var(--color-text-muted)] font-medium">
                Nombre
              </label>
              <input
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej: Juan Pérez"
                required
                className={CLASE_INPUT}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-[var(--color-text-muted)] font-medium">
                Contacto público (opcional)
              </label>
              <input
                value={contactoPublico}
                onChange={(event) => setContactoPublico(event.target.value)}
                placeholder="Ej: @instagram o teléfono"
                className={CLASE_INPUT}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-white/5">
            <button
              type="submit"
              disabled={guardando}
              className="fox-button-primary text-xs py-2.5 px-4 font-semibold transition-all w-full md:w-auto"
            >
              {guardando ? "Guardando..." : "Crear organizador"}
            </button>
          </div>
        </form>
      </div>

      {/* Listado de organizadores */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white m-0">Organizadores registrados</h3>
          {!cargando && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)]">
              Total: {organizadores.length}
            </span>
          )}
        </div>

        {cargando ? (
          <div className="py-12 text-center space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[var(--color-text-muted)] m-0">
              Cargando organizadores...
            </p>
          </div>
        ) : organizadores.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] py-8 text-center m-0">
            No hay organizadores registrados.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-0 m-0 list-none">
            {organizadores.map((item) => (
              <li
                key={item.id}
                className="bg-black/20 hover:bg-black/40 border border-white/5 hover:border-[var(--color-accent)]/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-white font-semibold text-sm group-hover:text-[var(--color-accent)] transition-colors">
                      {item.nombre}
                    </strong>
                    {!item.activo && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>

                  {item.contactoPublico && (
                    <p className="text-xs text-[var(--color-text-muted)] m-0 font-mono">
                      {item.contactoPublico}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}