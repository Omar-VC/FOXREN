import type { RegistroHistorial } from "./historial.types";

export function registroHistorialEsValido(
  registro: RegistroHistorial
): boolean {
  return (
    registro.jugadorId.trim() !== "" &&
    registro.torneoId.trim() !== "" &&
    registro.competenciaId.trim() !== "" &&
    registro.parejaId.trim() !== "" &&
    registro.categoriaId.trim() !== ""
  );
}