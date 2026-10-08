import { useEffect, useState } from "react";

import type { Pareja } from "../../../../domain/pareja/pareja.types";
import { parejasRepository } from "../../../../infrastructure/repositories/parejasRepository";

interface Props {
  competenciaId: string;
}

export default function ParejasAdmin({
  competenciaId,
}: Props) {
  const [parejas, setParejas] = useState<Pareja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarParejas() {
      try {
        setError(null);

        const datos =
          await parejasRepository.obtenerPorCompetenciaId(
            competenciaId
          );

        setParejas(datos);
      } catch {
        setError(
          "No se pudieron cargar las parejas."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarParejas();
  }, [competenciaId]);

  if (cargando) {
    return <p>Cargando parejas...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <h2>Parejas</h2>

      {parejas.length === 0 ? (
        <p>
          Todavía no hay parejas registradas.
        </p>
      ) : (
        <ul>
          {parejas.map((pareja) => (
            <li key={pareja.id}>
              {pareja.jugador1Id} /{" "}
              {pareja.jugador2Id}
              {" — "}
              {pareja.estado}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}