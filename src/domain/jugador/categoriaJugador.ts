/**
 * Categorías que un jugador puede declarar al registrarse (la más alta es la 3ra).
 * Las categorías superiores quedan fuera del formulario público: si hiciera falta
 * una, la asigna el administrador al aprobar la solicitud.
 */
export const CATEGORIAS_DECLARABLES = [
  "3ra",
  "4ta",
  "5ta",
  "6ta",
  "7ma",
  "8va",
] as const;

export type CategoriaDeclarable = (typeof CATEGORIAS_DECLARABLES)[number];

export function obtenerValorCategoriaJugador(
  categoriaDeclarada: string
): number | null {
  const coincidencia = categoriaDeclarada.trim().match(/\d+/);

  if (!coincidencia) {
    return null;
  }

  const valor = Number(coincidencia[0]);

  return Number.isInteger(valor) && valor > 0 ? valor : null;
}
