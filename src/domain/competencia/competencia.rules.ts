import type { Competencia } from "./competencia.types";
import type { Jugador } from "../jugador/jugador.types";
import type { Pareja } from "../pareja/pareja.types";
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

export function competenciaPuedePasarA(
  competencia: Competencia,
  nuevoEstado: Competencia["estado"],
): boolean {
  const estadoActual = competencia.estado;

  if (
    estadoActual === "borrador" &&
    nuevoEstado === "inscripciones_abiertas"
  ) {
    return true;
  }

  if (
    estadoActual === "inscripciones_abiertas" &&
    nuevoEstado === "inscripciones_cerradas"
  ) {
    return true;
  }

  if (
    estadoActual === "inscripciones_cerradas" &&
    nuevoEstado === "en_curso"
  ) {
    return true;
  }

  if (
    estadoActual === "en_curso" &&
    nuevoEstado === "finalizada"
  ) {
    return true;
  }

  return false;
}


export interface ValidacionPreparacionCompetenciaResultado {
  esValido: boolean;
  errores: string[];
}

export function validarPreparacionCompetencia(
  competencia: Competencia,
  parejas: Pareja[],
): ValidacionPreparacionCompetenciaResultado {
  const errores: string[] = [];

  if (competencia.estado !== "inscripciones_abiertas") {
    errores.push(
      "La competencia debe tener las inscripciones abiertas para poder prepararse.",
    );
  }

  const parejasActivas = parejas.filter(
    (pareja) => pareja.estado === "activa",
  );

  if (parejasActivas.length === 0) {
    errores.push(
      "La competencia debe tener al menos una pareja registrada.",
    );
  }

  if (parejasActivas.length > competencia.cupoMaximoParejas) {
    errores.push(
      "La cantidad de parejas activas supera el cupo máximo de la competencia.",
    );
  }

  const jugadoresRegistrados = new Set<string>();

  for (const pareja of parejasActivas) {
    if (jugadoresRegistrados.has(pareja.jugador1Id)) {
      errores.push(
        "Un jugador aparece en más de una pareja.",
      );
    }

    if (jugadoresRegistrados.has(pareja.jugador2Id)) {
      errores.push(
        "Un jugador aparece en más de una pareja.",
      );
    }

    jugadoresRegistrados.add(pareja.jugador1Id);
    jugadoresRegistrados.add(pareja.jugador2Id);
  }

  return {
    esValido: errores.length === 0,
    errores,
  };
}

export function validarParejasDeCompetencia(
  competencia: Competencia,
  parejas: Pareja[],
  jugadores: Jugador[],
): string[] {
  const errores: string[] = [];

  const jugadoresPorId = new Map(
    jugadores.map((jugador) => [jugador.id, jugador]),
  );

  const parejasActivas = parejas.filter(
    (pareja) => pareja.estado === "activa",
  );

  for (const pareja of parejasActivas) {
    const jugador1 = jugadoresPorId.get(pareja.jugador1Id);
    const jugador2 = jugadoresPorId.get(pareja.jugador2Id);

    if (!jugador1 || !jugador2) {
      errores.push(
        `La pareja ${pareja.id} tiene un jugador que no existe.`,
      );
      continue;
    }

    if (
      !jugadorPuedeParticiparEnCompetencia(
        jugador1,
        competencia,
      )
    ) {
      errores.push(
        `El jugador ${jugador1.nombre} ${jugador1.apellido} ya no cumple la regla de categoría.`,
      );
    }

    if (
      !jugadorPuedeParticiparEnCompetencia(
        jugador2,
        competencia,
      )
    ) {
      errores.push(
        `El jugador ${jugador2.nombre} ${jugador2.apellido} ya no cumple la regla de categoría.`,
      );
    }

    if (
      !parejaPuedeParticiparEnCompetencia(
        jugador1,
        jugador2,
        competencia,
      )
    ) {
      errores.push(
        `La pareja formada por ${jugador1.nombre} ${jugador1.apellido} y ${jugador2.nombre} ${jugador2.apellido} ya no cumple la regla de categoría.`,
      );
    }
  }

  return errores;
}
