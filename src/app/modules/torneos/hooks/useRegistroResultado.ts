import { useEffect, useState } from "react";

import { registrarResultado } from "../../../../application/resultados/registrarResultado";
import { resolverSuspension } from "../../../../application/resultados/resolverSuspension";
import { asignarGanadorARondaSiguiente } from "../../../../application/competencias/generarLlavesEliminacionDirecta";
import type { Partido } from "../../../../domain/partido/partido.types";
import type { SetResultado } from "../../../../domain/partido/partido.types";
import type { TipoResultado } from "../../../../domain/resultado/resultado.types";
import type { Resultado } from "../../../../domain/resultado/resultado.types";
import type { Competencia } from "../../../../domain/competencia/competencia.types";

type MarcadorSet = {
  juegosPareja1: string;
  juegosPareja2: string;
  tieBreakPareja1: string;
  tieBreakPareja2: string;
};

const MARCADOR_VACIO: MarcadorSet = {
  juegosPareja1: "",
  juegosPareja2: "",
  tieBreakPareja1: "",
  tieBreakPareja2: "",
};

interface UseRegistroResultadoProps {
  partidos: Partido[];
  competencia: Competencia | null;
  onExito: () => void;
}

interface UseRegistroResultadoReturn {
  partidoSeleccionadoId: string;
  tipoResultado: TipoResultado;
  cantidadSets: 1 | 2 | 3;
  marcadores: MarcadorSet[];
  ganadorEspecialId: string;
  resultadoOficial: boolean;
  guardandoResultado: boolean;
  mensajeResultado: string | null;
  errorResultado: string | null;
  setPartidoSeleccionadoId: (id: string) => void;
  setTipoResultado: (tipo: TipoResultado) => void;
  setCantidadSets: (cantidad: 1 | 2 | 3) => void;
  setMarcadores: React.Dispatch<React.SetStateAction<MarcadorSet[]>>;
  setGanadorEspecialId: (id: string) => void;
  setResultadoOficial: (oficial: boolean) => void;
  setErrorResultado: (mensaje: string | null) => void;
  setMensajeResultado: (mensaje: string | null) => void;
  guardarResultado: () => Promise<void>;
}

export function useRegistroResultado({
  partidos,
  competencia,
  onExito,
}: UseRegistroResultadoProps): UseRegistroResultadoReturn {
  const [partidoSeleccionadoId, setPartidoSeleccionadoId] = useState("");
  const [tipoResultado, setTipoResultado] = useState<TipoResultado>("normal");
  const [cantidadSets, setCantidadSets] = useState<1 | 2 | 3>(2);
  const [marcadores, setMarcadores] = useState<MarcadorSet[]>([
    { ...MARCADOR_VACIO },
    { ...MARCADOR_VACIO },
    { ...MARCADOR_VACIO },
  ].slice(0, 2));
  const [ganadorEspecialId, setGanadorEspecialId] = useState("");
  const [resultadoOficial, setResultadoOficial] = useState(true);

  const [guardandoResultado, setGuardandoResultado] = useState(false);
  const [mensajeResultado, setMensajeResultado] = useState<string | null>(null);
  const [errorResultado, setErrorResultado] = useState<string | null>(null);

  // Sincronizar marcadores con la cantidad de sets seleccionada.
  useEffect(() => {
    setMarcadores((actual) =>
      actual.slice(0, cantidadSets).length < cantidadSets
        ? [
            ...actual.slice(0, cantidadSets),
            ...Array.from(
              { length: cantidadSets - actual.slice(0, cantidadSets).length },
              () => ({ ...MARCADOR_VACIO }),
            ),
          ]
        : actual.slice(0, cantidadSets),
    );
  }, [cantidadSets]);

  async function guardarResultado() {
    if (!competencia) return;

    const partido = partidos.find((item) => item.id === partidoSeleccionadoId);

    if (!partido) {
      setErrorResultado("Seleccioná un partido válido.");
      return;
    }

    setGuardandoResultado(true);
    setErrorResultado(null);
    setMensajeResultado(null);

    try {
      let sets: SetResultado[] = [];
      let ganadorParejaId: string | undefined;

      if (tipoResultado === "normal") {
        sets = marcadores.slice(0, cantidadSets).map((marcador, indice) => {
          const tieBreakActivo =
            marcador.juegosPareja1 === "6" && marcador.juegosPareja2 === "6";

          const tieBreakCompleto =
            marcador.tieBreakPareja1 !== "" && marcador.tieBreakPareja2 !== "";

          if (tieBreakActivo && !tieBreakCompleto) {
            throw new Error(
              `Completá los puntos del tie-break del set ${indice + 1}.`,
            );
          }

          const puntosTieBreakPareja1 = Number(marcador.tieBreakPareja1);
          const puntosTieBreakPareja2 = Number(marcador.tieBreakPareja2);

          const tieBreakValido =
            tieBreakCompleto &&
            puntosTieBreakPareja1 !== puntosTieBreakPareja2 &&
            Math.max(puntosTieBreakPareja1, puntosTieBreakPareja2) >= 7 &&
            Math.abs(puntosTieBreakPareja1 - puntosTieBreakPareja2) >= 2;

          if (tieBreakActivo && !tieBreakValido) {
            throw new Error(
              `El tie-break del set ${indice + 1} debe ganarse por al menos dos puntos.`,
            );
          }

          const juegosPareja1 = tieBreakActivo
            ? puntosTieBreakPareja1 > puntosTieBreakPareja2
              ? 7
              : 6
            : Number(marcador.juegosPareja1);

          const juegosPareja2 = tieBreakActivo
            ? puntosTieBreakPareja2 > puntosTieBreakPareja1
              ? 7
              : 6
            : Number(marcador.juegosPareja2);

          const set: SetResultado = {
            setNumero: indice + 1,
            juegosPareja1,
            juegosPareja2,
          };

          if (tieBreakActivo) {
            set.tieBreakPareja1 = puntosTieBreakPareja1;
            set.tieBreakPareja2 = puntosTieBreakPareja2;
          }

          return set;
        });

        const setsGanadosPareja1 = sets.filter(
          (set) => set.juegosPareja1 > set.juegosPareja2,
        ).length;
        const setsGanadosPareja2 = sets.filter(
          (set) => set.juegosPareja2 > set.juegosPareja1,
        ).length;

        if (!partido.pareja1Id || !partido.pareja2Id) {
          throw new Error("El partido tiene parejas sin definir.");
        }

        if (cantidadSets === 1) {
          ganadorParejaId =
            setsGanadosPareja1 >= 1 ? partido.pareja1Id! : partido.pareja2Id!;
        } else if (cantidadSets === 2) {
          if (setsGanadosPareja1 === 2) {
            ganadorParejaId = partido.pareja1Id!;
          } else if (setsGanadosPareja2 === 2) {
            ganadorParejaId = partido.pareja2Id!;
          }
          // Con 2 sets y empate 1-1, ganadorParejaId queda undefined:
          // el partido queda abierto para un tercer set.
        } else {
          // 3 sets: mejor de 3
          ganadorParejaId =
            setsGanadosPareja1 >= 2 ? partido.pareja1Id! : partido.pareja2Id!;
        }
      } else if (tipoResultado === "walkover" || tipoResultado === "abandono") {
        if (!ganadorEspecialId) {
          throw new Error("Seleccioná la pareja ganadora.");
        }

        ganadorParejaId = ganadorEspecialId;
      }

      const datosResultado: Omit<Resultado, "id"> = {
        partidoId: partido.id,
        tipo: tipoResultado,
        sets,
        ganadorParejaId,
        oficial: resultadoOficial,
        fechaRegistro: new Date(),
      };

      if (partido.estado === "suspendido") {
        await resolverSuspension(datosResultado);
      } else {
        await registrarResultado(datosResultado, {
          partidoId: partido.id,
          torneoId: competencia.torneoId,
          competenciaId: competencia.id,
          categoriaId: competencia.categoriaId,
        });
      }

      setMensajeResultado("Resultado registrado correctamente.");

      // Propagar ganador a la siguiente ronda si es eliminación directa
      if (
        partido.tipoPartido === "eliminacion_directa" ||
        partido.ronda !== undefined
      ) {
        if (ganadorParejaId) {
          try {
            await asignarGanadorARondaSiguiente(
              competencia.id,
              partido.id,
              ganadorParejaId,
            );
          } catch (propagacionError) {
            // No bloqueamos el flujo si falla la propagación;
            // el resultado ya quedó guardado correctamente.
            console.warn(
              "No se pudo propagar el ganador a la siguiente ronda:",
              propagacionError,
            );
          }
        }
      }

      setPartidoSeleccionadoId("");
      setGanadorEspecialId("");
      // Reset manteniendo la cantidad de sets actual.
      setMarcadores(
        Array.from({ length: cantidadSets }, () => ({ ...MARCADOR_VACIO })),
      );
      onExito();
    } catch (err) {
      setErrorResultado(
        err instanceof Error ? err.message : "No se pudo guardar el resultado.",
      );
    } finally {
      setGuardandoResultado(false);
    }
  }

  return {
    partidoSeleccionadoId,
    tipoResultado,
    cantidadSets,
    marcadores,
    ganadorEspecialId,
    resultadoOficial,
    guardandoResultado,
    mensajeResultado,
    errorResultado,
    setPartidoSeleccionadoId,
    setTipoResultado,
    setCantidadSets,
    setMarcadores,
    setGanadorEspecialId,
    setResultadoOficial,
    setErrorResultado,
    setMensajeResultado,
    guardarResultado,
  };
}
