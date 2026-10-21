import { useCallback, useEffect, useState } from "react";

import type { Organizador } from "../../../../domain/organizador/organizador.types";
import { organizadorEsValido } from "../../../../domain/organizador/organizador.rules";
import { organizadoresRepository } from "../../../../infrastructure/repositories/organizadoresRepository";

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

  useEffect(() => { void Promise.resolve().then(cargar); }, [cargar]);

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
    <section>
      <h1>Administrar organizadores</h1>
      <p>Los organizadores son contactos asociados a eventos; no reciben acceso al sistema.</p>
      {error && <p role="alert">{error}</p>}
      <form className="fox-form" onSubmit={crear}>
        <label>Nombre<input value={nombre} onChange={(event) => setNombre(event.target.value)} required /></label>
        <label>Contacto público (opcional)<input value={contactoPublico} onChange={(event) => setContactoPublico(event.target.value)} /></label>
        <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Crear organizador"}</button>
      </form>
      <h2>Organizadores registrados</h2>
      {cargando ? <p>Cargando...</p> : organizadores.length === 0
        ? <p>No hay organizadores registrados.</p>
        : <ul className="fox-card-grid">{organizadores.map((item) => (
          <li className="fox-card" key={item.id}>
            <strong>{item.nombre}</strong>
            {item.contactoPublico && <p className="fox-card-meta">{item.contactoPublico}</p>}
            {!item.activo && <p className="fox-card-meta">Inactivo</p>}
          </li>
        ))}</ul>}
    </section>
  );
}
