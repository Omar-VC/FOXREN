import CategoriaForm from "../components/CategoriaForm";
import CategoriaList from "../components/CategoriaList";

import { useCategorias } from "../hooks/useCategorias";

export default function AdminCategoriasPage() {
  const {
    categorias,
    cargando,
    creando,
    error,
    crearCategoria,
  } = useCategorias();

  if (cargando) {
    return <p>Cargando categorías...</p>;
  }

  return (
    <section>
      <h1 className="admin-page-title">
        Administrar categorías
      </h1>

      <p className="admin-page-description">
        Creá y administrá las categorías de FOXREN.
      </p>

      {error && <p>{error}</p>}

      <CategoriaForm
        creando={creando}
        onCrear={crearCategoria}
      />

      <hr />

      <h2>Categorías registradas</h2>

      <CategoriaList
        categorias={categorias}
      />
    </section>
  );
}