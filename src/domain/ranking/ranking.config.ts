/**
 * CONFIGURACIÓN DEL RANKING
 *
 * Todos los números del ranking viven acá. Para ajustar el sistema alcanza con
 * cambiar estos valores (no hay que tocar la lógica de cálculo).
 *
 * Categorías de FOXREN: 1 = la más alta, 8 = la más baja. Son categorías propias
 * de FOXREN, independientes de la federación.
 */
export interface ConfigRanking {
  /** Puntos base por resultado en una competencia (antes del multiplicador de categoría). */
  puntosBase: {
    participacion: number;
    /** Por cada partido de zona ganado. */
    victoriaZona: number;
    /** Ronda más alta alcanzada en la llave: no se suman, vale la mejor. */
    dieciseisavos: number;
    octavos: number;
    cuartos: number;
    semifinal: number;
    finalista: number;
    campeon: number;
  };
  /** Multiplicador según la categoría de la competencia. */
  multiplicadorCategoria: Record<number, number>;
  /** Puntos con los que arranca un jugador según su categoría confirmada. */
  puntosIniciales: Record<number, number>;
  /** Cuántos mejores resultados por temporada cuentan. */
  mejoresResultados: number;
}

export const CONFIG_RANKING: ConfigRanking = {
  puntosBase: {
    participacion: 10,
    victoriaZona: 5,
    dieciseisavos: 15,
    octavos: 20,
    cuartos: 30,
    semifinal: 50,
    finalista: 80,
    campeon: 120,
  },
  multiplicadorCategoria: {
    1: 2,
    2: 1.75,
    3: 1.5,
    4: 1.25,
    5: 1,
    6: 0.75,
    7: 0.5,
    8: 0.25,
  },
  puntosIniciales: {
    1: 600,
    2: 450,
    3: 320,
    4: 220,
    5: 140,
    6: 80,
    7: 40,
    8: 15,
  },
  mejoresResultados: 8,
};
