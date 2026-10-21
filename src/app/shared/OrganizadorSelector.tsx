import { useEffect, useState } from "react";

import type { Organizador } from "../../domain/organizador/organizador.types";
import { organizadoresRepository } from "../../infrastructure/repositories/organizadoresRepository";

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  label?: string;
}

export default function OrganizadorSelector({
  value,
  onChange,
  disabled = false,
  label = "Organizadores específicos",
}: Props) {
  const [organizadores, setOrganizadores] = useState<Organizador[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    organizadoresRepository.obtenerOrganizadores()
      .then(setOrganizadores)
      .catch(() => setError("No se pudieron cargar los organizadores."));
  }, []);

  function alternar(id: string) {
    onChange(value.includes(id)
      ? value.filter((actual) => actual !== id)
      : [...value, id]);
  }

  return (
    <fieldset disabled={disabled}>
      <legend>{label}</legend>
      {error && <p role="alert">{error}</p>}
      {!error && organizadores.length === 0 && (
        <p>No hay organizadores registrados. Podés crearlos desde Administración → Organizadores.</p>
      )}
      {organizadores.filter((item) => item.activo).map((organizador) => (
        <label key={organizador.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.includes(organizador.id)}
            onChange={() => alternar(organizador.id)}
          />
          {organizador.nombre}
          {organizador.contactoPublico ? ` — ${organizador.contactoPublico}` : ""}
        </label>
      ))}
    </fieldset>
  );
}
