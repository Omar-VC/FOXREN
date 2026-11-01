/**
 * Compatibilidad: mantiene el nombre anterior para que CompetenciaAdminPage siga
 * compilando. La implementación real está en generarPlayoffCompetencia.
 *
 * El avance del ganador ya no vive acá: lo hace cerrarPartidoConResultado dentro
 * de la transacción del resultado. Cuando CompetenciaAdminPage importe
 * generarPlayoffCompetencia directamente, este archivo se puede borrar.
 */
export { generarPlayoffCompetencia as generarLlavesEliminacionDirecta } from "./generarPlayoffCompetencia";
export type { ResultadoGeneracionPlayoff as ResultadoGeneracionLlaves } from "./generarPlayoffCompetencia";
