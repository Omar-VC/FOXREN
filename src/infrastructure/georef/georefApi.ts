import {
  formatearNombreLugar,
  normalizarTexto,
} from "../../domain/ubicacion/ubicacion";

// API pública y gratuita del Estado argentino para normalizar unidades territoriales.
const BASE = "https://apis.datos.gob.ar/georef/api";
const TIEMPO_MAXIMO_MS = 8000;

const cache = new Map<string, string[]>();

/**
 * Ciudades y localidades de una provincia, ordenadas y sin repetidas.
 * Si la API no responde lanza un error: el formulario sigue funcionando con texto libre.
 */
export async function obtenerLocalidades(provincia: string): Promise<string[]> {
  const clave = normalizarTexto(provincia);
  const guardadas = cache.get(clave);
  if (guardadas) return guardadas;

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  try {
    const respuesta = await fetch(
      `${BASE}/localidades?provincia=${encodeURIComponent(provincia)}&campos=nombre&orden=nombre&max=5000`,
      { signal: controlador.signal },
    );
    if (!respuesta.ok) throw new Error(`Georef respondió ${respuesta.status}`);

    const datos = (await respuesta.json()) as { localidades?: { nombre?: string }[] };
    const nombres = (datos.localidades ?? [])
      .map((item) => item.nombre ?? "")
      .filter(Boolean)
      // Algunas entradas llegan en mayúsculas: se unifican con el resto.
      .map((nombre) => (nombre === nombre.toUpperCase() ? formatearNombreLugar(nombre) : nombre));

    const lista = [...new Set(nombres)].sort((a, b) => a.localeCompare(b, "es"));
    cache.set(clave, lista);
    return lista;
  } finally {
    clearTimeout(temporizador);
  }
}
