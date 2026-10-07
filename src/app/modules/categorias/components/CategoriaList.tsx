import type { Categoria } from "../../../../domain/categoria/categoria.types";

interface Props {
  categorias: Categoria[];
}

export default function CategoriaList({
  categorias,
}: Props) {
  if (categorias.length === 0) {
    return <p>No hay categorías registradas.</p>;
  }

  return (
    <ul>
      {categorias.map((categoria) => (
        <li key={categoria.id}>
          <strong>{categoria.nombre}</strong>
          {" — "}
          {categoria.estado}

          {categoria.descripcion && (
            <>
              {" — "}
              {categoria.descripcion}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}