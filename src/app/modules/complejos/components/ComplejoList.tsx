import type { Complejo } from "../../../../domain/complejo/complejo.types";

interface Props {
  complejos: Complejo[];
}

export default function ComplejoList({ complejos }: Props) {
  if (complejos.length === 0) {
    return <p>No hay complejos registrados.</p>;
  }

  return (
    <ul>
      {complejos.map((complejo) => (
        <li key={complejo.id}>
          {complejo.nombre} — {complejo.ciudad} — {complejo.provincia}
        </li>
      ))}
    </ul>
  );
}