import type { Complejo } from "../../../../domain/complejo/complejo.types";

interface Props {
  complejos: Complejo[];
}

export default function ComplejoList({ complejos }: Props) {
  if (complejos.length === 0) {
    return <p>No hay complejos registrados.</p>;
  }

  return (
    <ul className="fox-card-grid">
      {complejos.map((complejo) => (
        <li className="fox-card" key={complejo.id}>
          <strong>{complejo.nombre}</strong>
          <p className="fox-card-meta">{complejo.ciudad} · {complejo.provincia}</p>
        </li>
      ))}
    </ul>
  );
}
