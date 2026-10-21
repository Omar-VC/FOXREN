import type { Organizador } from "./organizador.types";

export function organizadorEsValido(
  organizador: Omit<Organizador, "id" | "fechaCreacion">,
): boolean {
  return organizador.nombre.trim().length > 0 &&
    (!organizador.contactoPublico || organizador.contactoPublico.trim().length > 0);
}

export function combinarOrganizadorIds(...listas: Array<string[] | undefined>): string[] {
  return [...new Set(listas.flatMap((lista) => lista ?? []).filter(Boolean))];
}
