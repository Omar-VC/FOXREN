import { resultadoRepository } from "../../infrastructure/repositories/resultadoRepository";
import type { Resultado } from "../../domain/resultado/resultado.types";
import { cerrarPartidoConResultado } from "./cerrarPartidoConResultado";

interface DatosResultado {
  partidoId: string;
  torneoId: string;
  competenciaId: string;
  categoriaId: string;
}

/**
 * Registra el resultado de un partido (zona o llave). Las reglas del marcador,
 * el avance del ganador y el cierre de la competencia se resuelven dentro de la
 * misma transacción en `cerrarPartidoConResultado`.
 */
export async function registrarResultado(
  resultado: Omit<Resultado, "id">,
  datos: DatosResultado,
): Promise<string> {
  if (resultado.partidoId !== datos.partidoId) {
    throw new Error("El resultado no coincide con el partido seleccionado.");
  }
  // Compatibilidad con resultados antiguos cuyo ID no era el ID del partido.
  if ((await resultadoRepository.obtenerPorPartido(datos.partidoId)).length > 0) {
    throw new Error("El partido ya tiene un resultado registrado.");
  }

  return cerrarPartidoConResultado(resultado, "registrar", datos);
}
