import ComplejoForm from "../components/ComplejoForm";
import ComplejoList from "../components/ComplejoList";
import { useComplejos } from "../hooks/useComplejos";

export default function AdminComplejosPage() {
  const {
    complejos,
    cargando,
    creando,
    error,
    crearComplejo,
  } = useComplejos();

  if (cargando) {
    return <p>Cargando complejos...</p>;
  }

  return (
    <section>
      <h1>Administrar complejos</h1>

      {error && <p>{error}</p>}

      <ComplejoForm
        creando={creando}
        onCrear={crearComplejo}
      />

      <hr />

      <ComplejoList complejos={complejos} />
    </section>
  );
}