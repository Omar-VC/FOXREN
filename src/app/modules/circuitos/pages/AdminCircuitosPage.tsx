import CircuitoForm from "../components/CircuitoForm";
import CircuitoList from "../components/CircuitoList";
import { useCircuitos } from "../hooks/useCircuitos";

export default function AdminCircuitosPage() {
  const {
    circuitos,
    cargando,
    creando,
    error,
    crearCircuito,
  } = useCircuitos();

  if (cargando) {
    return <p>Cargando circuitos...</p>;
  }

  return (
    <section>
      <h1>Administrar circuitos</h1>

      {error && <p>{error}</p>}

      <CircuitoForm
        creando={creando}
        onCrear={crearCircuito}
      />

      <hr />

      <CircuitoList circuitos={circuitos} />
    </section>
  );
}