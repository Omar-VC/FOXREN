import CircuitoList from "../components/CircuitoList";
import { useCircuitos } from "../hooks/useCircuitos";

export default function CircuitosPage() {
  const {
    circuitos,
    cargando,
    error,
  } = useCircuitos();

  if (cargando) {
    return <p>Cargando circuitos...</p>;
  }

  return (
    <section>
      <h1>Circuitos</h1>

      {error && <p>{error}</p>}

      <CircuitoList circuitos={circuitos} />
    </section>
  );
}