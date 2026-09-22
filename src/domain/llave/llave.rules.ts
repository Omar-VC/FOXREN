import type { TablaPosicionPareja } from "../zona/zona.types";
import type { LlavePartido, RondaLlave } from "./llave.types";

export function generarCuadroEliminatorio(
  competenciaId: string,
  clasificadosPorZona: { zonaNombre: string; clasificados: TablaPosicionPareja[] }[]
): LlavePartido[] {
  const primeros = clasificadosPorZona.map((z) => z.clasificados[0]).filter(Boolean);
  const segundos = clasificadosPorZona.map((z) => z.clasificados[1]).filter(Boolean);

  const totalClasificados = primeros.length + segundos.length;
  let rondaInicial: RondaLlave = "SEMIFINAL";

  if (totalClasificados > 4) {
    rondaInicial = "CUARTOS";
  }

  const partidosLlave: LlavePartido[] = [];

  if (rondaInicial === "SEMIFINAL") {
    partidosLlave.push(
      {
        id: `semi_1_${Date.now()}`,
        competenciaId,
        orden: 1, // 👈 Se agrega la propiedad 'orden'
        pareja1Id: primeros[0]?.parejaId || "",
        pareja2Id: segundos[1]?.parejaId || segundos[0]?.parejaId || "",
        nombrePareja1: primeros[0]?.nombrePareja || "1° Zona A",
        nombrePareja2: segundos[1]?.nombrePareja || segundos[0]?.nombrePareja || "2° Zona B",
        sets: [],
        estado: "PENDIENTE",
        ronda: "SEMIFINAL",
        posicionEnCuadro: 1,
      },
      {
        id: `semi_2_${Date.now()}`,
        competenciaId,
        orden: 2, // 👈 Se agrega la propiedad 'orden'
        pareja1Id: primeros[1]?.parejaId || "",
        pareja2Id: segundos[0]?.parejaId || "",
        nombrePareja1: primeros[1]?.nombrePareja || "1° Zona B",
        nombrePareja2: segundos[0]?.nombrePareja || "2° Zona A",
        sets: [],
        estado: "PENDIENTE",
        ronda: "SEMIFINAL",
        posicionEnCuadro: 2,
      },
      {
        id: `final_${Date.now()}`,
        competenciaId,
        orden: 3, // 👈 Se agrega la propiedad 'orden'
        pareja1Id: "",
        pareja2Id: "",
        nombrePareja1: "Ganador Semi 1",
        nombrePareja2: "Ganador Semi 2",
        sets: [],
        estado: "PENDIENTE",
        ronda: "FINAL",
        posicionEnCuadro: 3,
      }
    );
  }

  return partidosLlave;
}