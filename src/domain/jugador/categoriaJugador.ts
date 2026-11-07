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

/**
 * Categorías que puede asignar el administrador. Incluye 1ra y 2da, que no se
 * ofrecen en el formulario público.
 */
export const CATEGORIAS_ASIGNABLES = [
  "1ra",
  "2da",
  ...CATEGORIAS_DECLARABLES,
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
