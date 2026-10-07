import type { Resultado } from "../resultado/resultado.types";
import type { RegistroHistorial } from "./historial.types";

interface DatosParejaHistorial {
  parejaId: string;
  jugador1Id: string;
  jugador2Id: string;
}

interface DatosHistorial {
  torneoId: string;
  competenciaId: string;
  categoriaId: string;
  pareja1: DatosParejaHistorial;
  pareja2: DatosParejaHistorial;
}

export function crearHistorialDesdeResultado(
  resultado: Resultado,
  datos: DatosHistorial
): RegistroHistorial[] {
  return [
    crearRegistro(
      resultado,
      datos,
      datos.pareja1,
      datos.pareja1.jugador1Id
    ),
    crearRegistro(
      resultado,
      datos,
      datos.pareja1,
      datos.pareja1.jugador2Id
    ),
    crearRegistro(
      resultado,
      datos,
      datos.pareja2,
      datos.pareja2.jugador1Id
    ),
    crearRegistro(
      resultado,
      datos,
      datos.pareja2,
      datos.pareja2.jugador2Id
    ),
  ];
}

function crearRegistro(
  resultado: Resultado,
  datos: DatosHistorial,
  pareja: DatosParejaHistorial,
  jugadorId: string
): RegistroHistorial {
  return {
    jugadorId,
    torneoId: datos.torneoId,
    competenciaId: datos.competenciaId,
    parejaId: pareja.parejaId,
    categoriaId: datos.categoriaId,
    fecha: resultado.fechaRegistro,
    resultado: obtenerResultadoHistorial(
      resultado,
      pareja.parejaId
    ),
  };
}

function obtenerResultadoHistorial(
  resultado: Resultado,
  parejaId: string
): RegistroHistorial["resultado"] {
  if (resultado.tipo === "normal") {
    return resultado.ganadorParejaId === parejaId
      ? "victoria"
      : "derrota";
  }

  if (resultado.tipo === "walkover") {
    return resultado.ganadorParejaId === parejaId
      ? "victoria"
      : "walkover";
  }

  if (resultado.tipo === "abandono") {
    return resultado.ganadorParejaId === parejaId
      ? "victoria"
      : "abandono";
  }

  return "participacion";
}