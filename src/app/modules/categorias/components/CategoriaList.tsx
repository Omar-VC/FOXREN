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
    <ul className="fox-card-grid">
      {categorias.map((categoria) => (
        <li className="fox-card" key={categoria.id}>
          <strong>{categoria.nombre}</strong>
          <p className="fox-card-meta">Estado: {categoria.estado}</p>

          {categoria.descripcion && (
            <p>{categoria.descripcion}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
