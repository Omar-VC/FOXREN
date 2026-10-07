import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { circuitosRepository } from "../../../../infrastructure/repositories/circuitosRepository";
import { useComplejosPorCircuito } from "../../complejos/hooks/useComplejosPorCircuito";
import type { Circuito } from "../../../../domain/circuito/circuito.types";
import ComplejosDelCircuito from "../../complejos/components/ComplejosDelCircuito";
import { useTorneosPorCircuito } from "../../torneos/hooks/useTorneosPorCircuito";
import TorneosDelCircuito from "../../torneos/components/TorneosDelCircuito";

export default function CircuitoDetallePage() {
  const { circuitoId } = useParams();

  const [circuito, setCircuito] = useState<Circuito | null>(null);

  const [cargandoCircuito, setCargandoCircuito] = useState(true);

  const {
    complejos,
    cargando: cargandoComplejos,
    error: errorComplejos,
  } = useComplejosPorCircuito(circuitoId ?? "");

  const {
    torneos,
    cargando: cargandoTorneos,
    error: errorTorneos,
  } = useTorneosPorCircuito(circuitoId ?? "");

  useEffect(() => {
    async function cargarCircuito() {
      if (!circuitoId) {
        setCargandoCircuito(false);
        return;
      }

      const datos = await circuitosRepository.obtenerCircuitoPorId(circuitoId);

      setCircuito(datos);
      setCargandoCircuito(false);
    }

    cargarCircuito();
  }, [circuitoId]);

  if (cargandoCircuito) {
    return <p>Cargando circuito...</p>;
  }

  if (!circuito) {
    return <p>Circuito no encontrado.</p>;
  }

  return (
    <section>
      <h1>{circuito.nombre}</h1>

      <p>Temporada: {circuito.temporada}</p>

      {circuito.descripcion && <p>{circuito.descripcion}</p>}

      <hr />

      <ComplejosDelCircuito
        complejos={complejos}
        cargando={cargandoComplejos}
        error={errorComplejos}
      />

      <hr />

      <TorneosDelCircuito
        torneos={torneos}
        cargando={cargandoTorneos}
        error={errorTorneos}
      />
    </section>
  );
}
