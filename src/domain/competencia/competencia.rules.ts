import type { Competencia } from "./competencia.types";
import type { Jugador } from "../jugador/jugador.types";
import { obtenerValorCategoriaJugador } from "../jugador/categoriaJugador";
// ---------------------------------------------
// Verificaciones de estado
// ---------------------------------------------

export function competenciaAceptaInscripciones(
  competencia: Competencia,
): boolean {
  return competencia.estado === "inscripciones_abiertas";
}

export function competenciaEstaEnCurso(competencia: Competencia): boolean {
  return competencia.estado === "en_curso";
}

export function competenciaEstaFinalizada(competencia: Competencia): boolean {
  return competencia.estado === "finalizada";
}

// ---------------------------------------------
// Validación de datos
// ---------------------------------------------

export interface ValidacionCompetenciaResultado {
  esValido: boolean;
  errores: string[];
}

export function validarDatosCompetencia(
  datos: Partial<Competencia>,
): ValidacionCompetenciaResultado {
  const errores: string[] = [];

  if (!datos.nombre || datos.nombre.trim().length === 0) {
    errores.push("El nombre de la competencia es obligatorio.");
  }

  if (!datos.torneoId || datos.torneoId.trim().length === 0) {
    errores.push("La competencia debe pertenecer a un torneo.");
  }

  if (!datos.tipoReglaCategoria) {
    errores.push("Debes seleccionar el tipo de regla de categoría.");
  }

  if (
    datos.tipoReglaCategoria === "individual" &&
    (!datos.categoriaId || datos.categoriaId.trim().length === 0)
  ) {
    errores.push("Debes seleccionar una categoría oficial.");
  }

  if (
    datos.tipoReglaCategoria === "individual" &&
    (datos.valorReglaCategoria === undefined || datos.valorReglaCategoria <= 0)
  ) {
    errores.push("La categoría individual debe tener un valor válido.");
  }

  if (
    datos.tipoReglaCategoria === "suma" &&
    (datos.valorReglaCategoria === undefined || datos.valorReglaCategoria <= 0)
  ) {
    errores.push("La suma de categorías debe ser mayor a 0.");
  }

  if (!datos.genero) {
    errores.push(
      "Debes seleccionar el género/rama: Masculino, Femenino o Mixto.",
    );
  }

  if (datos.cupoMaximoParejas === undefined || datos.cupoMaximoParejas <= 0) {
    errores.push("El cupo máximo debe ser mayor a 0 parejas.");
  }

  if (
    datos.precioInscripcionPorPareja === undefined ||
    datos.precioInscripcionPorPareja < 0
  ) {
    errores.push("El precio de inscripción no puede ser un valor negativo.");
  }

  return {
    esValido: errores.length === 0,
    errores,
  };
}

export function categoriaCumpleReglaIndividual(
  categoriaJugador: number,
  categoriaCompetencia: number,
): boolean {
  return categoriaJugador >= categoriaCompetencia;
}

export function parejaCumpleReglaSuma(
  categoriaJugador1: number,
  categoriaJugador2: number,
  sumaObjetivo: number,
): boolean {
  return categoriaJugador1 + categoriaJugador2 === sumaObjetivo;
}

export function jugadorCumpleReglaCategoria(
  categoriaJugador: number,
  competencia: Competencia,
): boolean {
  if (competencia.tipoReglaCategoria === "individual") {
    return categoriaCumpleReglaIndividual(
      categoriaJugador,
      competencia.valorReglaCategoria,
    );
  }

  return true;
}

export function jugadorPuedeParticiparEnCompetencia(
  jugador: Jugador,
  competencia: Competencia,
): boolean {
  const categoriaJugador = obtenerValorCategoriaJugador(
    jugador.categoriaDeclarada,
  );

  if (categoriaJugador === null) {
    return false;
  }

  return jugadorCumpleReglaCategoria(categoriaJugador, competencia);
}

export function parejaPuedeParticiparEnCompetencia(
  jugador1: Jugador,
  jugador2: Jugador,
  competencia: Competencia,
): boolean {
  const categoriaJugador1 = obtenerValorCategoriaJugador(
    jugador1.categoriaDeclarada,
  );

  const categoriaJugador2 = obtenerValorCategoriaJugador(
    jugador2.categoriaDeclarada,
  );

  if (categoriaJugador1 === null || categoriaJugador2 === null) {
    return false;
  }

  if (competencia.tipoReglaCategoria === "individual") {
    return (
      jugadorCumpleReglaCategoria(categoriaJugador1, competencia) &&
      jugadorCumpleReglaCategoria(categoriaJugador2, competencia)
    );
  }

  return parejaCumpleReglaSuma(
    categoriaJugador1,
    categoriaJugador2,
    competencia.valorReglaCategoria,
  );
}
