/**
 * Catálogo único de categorías de FOXREN. Es la fuente de verdad: formularios,
 * ranking y selectores salen de acá. Para agregar o renombrar una categoría
 * se cambia solo esta lista.
 */
export const CATALOGO_CATEGORIAS = [
  { nombre: "1ra", descripcion: "Primera categoría", declarable: false },
  { nombre: "2da", descripcion: "Segunda categoría", declarable: false },
  { nombre: "3ra", descripcion: "Tercera categoría", declarable: true },
  { nombre: "4ta", descripcion: "Cuarta categoría", declarable: true },
  { nombre: "5ta", descripcion: "Quinta categoría", declarable: true },
  { nombre: "6ta", descripcion: "Sexta categoría", declarable: true },
  { nombre: "7ma", descripcion: "Séptima categoría", declarable: true },
  { nombre: "8va", descripcion: "Octava categoría", declarable: true },
] as const;

export type NombreCategoria = (typeof CATALOGO_CATEGORIAS)[number]["nombre"];

/**
 * Categorías que un jugador puede declarar al registrarse (la más alta es la 3ra).
 * 1ra y 2da quedan fuera del formulario público: las asigna el administrador.
 */
export const CATEGORIAS_DECLARABLES = [
  "3ra",
  "4ta",
  "5ta",
  "6ta",
  "7ma",
  "8va",
] as const;

/** Categorías que puede asignar el administrador (incluye 1ra y 2da). */
export const CATEGORIAS_ASIGNABLES = [
  "1ra",
  "2da",
  ...CATEGORIAS_DECLARABLES,
] as const;

export type CategoriaDeclarable = (typeof CATEGORIAS_DECLARABLES)[number];

/** Descripción oficial de una categoría del catálogo, o undefined si no existe. */
export function descripcionDeCategoria(nombre: string): string | undefined {
  return CATALOGO_CATEGORIAS.find((categoria) => categoria.nombre === nombre)
    ?.descripcion;
}

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
