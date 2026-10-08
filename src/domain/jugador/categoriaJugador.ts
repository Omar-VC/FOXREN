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