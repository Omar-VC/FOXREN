/** Las 24 jurisdicciones de Argentina, con los nombres oficiales (Georef). */
export const PROVINCIAS: readonly string[] = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Ciudad Autónoma de Buenos Aires",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
  "Tucumán",
];

/** Para comparar textos: sin tildes, sin mayúsculas y con espacios normalizados. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Devuelve la opción oficial que coincide con lo escrito ("cordoba" -> "Córdoba"), o null. */
export function buscarCoincidencia(
  valor: string,
  opciones: readonly string[],
): string | null {
  const buscado = normalizarTexto(valor);
  if (!buscado) return null;
  return opciones.find((opcion) => normalizarTexto(opcion) === buscado) ?? null;
}

const PALABRAS_MENORES = new Set(["de", "del", "la", "las", "los", "el", "y", "e"]);

/** "ALTA  GRACIA" -> "Alta Gracia"; deja "de", "del", "la"... en minúscula. */
export function formatearNombreLugar(texto: string): string {
  return texto
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((palabra, indice) =>
      indice > 0 && PALABRAS_MENORES.has(palabra)
        ? palabra
        : palabra.charAt(0).toUpperCase() + palabra.slice(1),
    )
    .join(" ");
}
