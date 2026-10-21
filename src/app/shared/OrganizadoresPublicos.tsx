interface OrganizadorPublico {
  idPublico: string;
  nombre: string;
  contactoPublico?: string;
}

interface Props {
  organizadores: OrganizadorPublico[];
}

export default function OrganizadoresPublicos({ organizadores }: Props) {
  if (organizadores.length === 0) {
    return null;
  }

  return (
    <section aria-label="Organizadores">
      <h2>Organización</h2>
      <ul>{organizadores.map((item) => (
        <li key={item.idPublico}>
          {item.nombre}{item.contactoPublico ? ` — ${item.contactoPublico}` : ""}
        </li>
      ))}</ul>
    </section>
  );
}
