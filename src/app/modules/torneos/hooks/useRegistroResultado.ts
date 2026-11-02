import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { registrarResultado } from "../../../../application/resultados/registrarResultado";
import { resolverSuspension } from "../../../../application/resultados/resolverSuspension";
import type { FormatoPartido, Partido, SetResultado } from "../../../../domain/partido/partido.types";
import type { Resultado, TipoResultado } from "../../../../domain/resultado/resultado.types";
import type { Competencia } from "../../../../domain/competencia/competencia.types";
import { formatoDelPartido } from "../../../../domain/resultado/resultado.cierre";
import {
  MARCADOR_SET_VACIO,
  cantidadSetsVisibles,
  construirMarcador,
} from "../../../../domain/resultado/resultado.marcador";
import type {
  MarcadorSetTexto,
  TipoTercerSet,
} from "../../../../domain/resultado/resultado.marcador";

export type VistaPreviaMarcador =
  | { ok: true; ganador: 1 | 2 }
  | { ok: false; error: string };

function marcadoresVacios(): MarcadorSetTexto[] {
  return [
    { ...MARCADOR_SET_VACIO },
    { ...MARCADOR_SET_VACIO },
    { ...MARCADOR_SET_VACIO },
  ];
}

interface UseRegistroResultadoProps {
  partidos: Partido[];
  competencia: Competencia | null;
  onExito: () => void;
}

interface UseRegistroResultadoReturn {
  partidoSeleccionadoId: string;
  tipoResultado: TipoResultado;
  /** Formato del partido seleccionado: "un_set" o "mejor_de_3". */
  formato: FormatoPartido;
  /** Cuántos sets hay que mostrar; sale del marcador, no se elige. */
  setsVisibles: 1 | 2 | 3;
  marcadores: MarcadorSetTexto[];
  tipoTercerSet: TipoTercerSet;
  /** Ganador y errores del marcador mientras se escribe (null si no es un partido normal). */
  vistaPrevia: VistaPreviaMarcador | null;
  hayMarcadorCargado: boolean;
  ganadorEspecialId: string;
  resultadoOficial: boolean;
  guardandoResultado: boolean;
  mensajeResultado: string | null;
  errorResultado: string | null;
  setPartidoSeleccionadoId: (id: string) => void;
  setTipoResultado: (tipo: TipoResultado) => void;
  setTipoTercerSet: (tipo: TipoTercerSet) => void;
  setMarcadores: Dispatch<SetStateAction<MarcadorSetTexto[]>>;
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
  const [partidoSeleccionadoId, setPartidoId] = useState("");
  const [tipoResultado, setTipoResultado] = useState<TipoResultado>("normal");
  const [marcadores, setMarcadores] = useState<MarcadorSetTexto[]>(marcadoresVacios);
  const [tipoTercerSet, setTipoTercerSet] = useState<TipoTercerSet>("set");
  const [ganadorEspecialId, setGanadorEspecialId] = useState("");
  const [resultadoOficial, setResultadoOficial] = useState(true);

  const [guardandoResultado, setGuardandoResultado] = useState(false);
  const [mensajeResultado, setMensajeResultado] = useState<string | null>(null);
  const [errorResultado, setErrorResultado] = useState<string | null>(null);

  const partidoSeleccionado = partidos.find((item) => item.id === partidoSeleccionadoId);
  const formato: FormatoPartido =
    partidoSeleccionado && competencia
      ? formatoDelPartido(partidoSeleccionado, competencia)
      : "mejor_de_3";

  const setsVisibles = cantidadSetsVisibles(marcadores, formato);

  const hayMarcadorCargado = marcadores.some((marcador) =>
    Object.values(marcador).some((valor) => valor !== ""),
  );

  const vistaPrevia = useMemo<VistaPreviaMarcador | null>(() => {
    if (tipoResultado !== "normal") return null;
    const construccion = construirMarcador(marcadores, formato, tipoTercerSet);
    return construccion.ok
      ? { ok: true, ganador: construccion.ganador }
      : { ok: false, error: construccion.error };
  }, [tipoResultado, marcadores, formato, tipoTercerSet]);

  function reiniciarCarga() {
    setTipoResultado("normal");
    setMarcadores(marcadoresVacios());
    setTipoTercerSet("set");
    setGanadorEspecialId("");
  }

  /** Al cambiar de partido se limpia lo escrito: el formato puede ser otro. */
  function seleccionarPartido(id: string) {
    if (id === partidoSeleccionadoId) return;
    setPartidoId(id);
    reiniciarCarga();
    setErrorResultado(null);
    setMensajeResultado(null);
  }

  async function guardarResultado() {
    if (!competencia) return;

    if (!partidoSeleccionado) {
      setErrorResultado("Seleccioná un partido válido.");
      return;
    }

    if (!partidoSeleccionado.pareja1Id || !partidoSeleccionado.pareja2Id) {
      setErrorResultado("Este partido todavía no tiene las dos parejas definidas.");
      return;
    }

    setGuardandoResultado(true);
    setErrorResultado(null);
    setMensajeResultado(null);

    try {
      let sets: SetResultado[] = [];
      let ganadorParejaId: string | undefined;

      if (tipoResultado === "normal") {
        const construccion = construirMarcador(marcadores, formato, tipoTercerSet);
        if (!construccion.ok) {
          throw new Error(construccion.error);
        }
        sets = construccion.sets;
        ganadorParejaId =
          construccion.ganador === 1
            ? partidoSeleccionado.pareja1Id
            : partidoSeleccionado.pareja2Id;
      } else if (tipoResultado === "walkover" || tipoResultado === "abandono") {
        if (!ganadorEspecialId) {
          throw new Error("Seleccioná la pareja ganadora.");
        }
        ganadorParejaId = ganadorEspecialId;
      }

      const datosResultado: Omit<Resultado, "id"> = {
        partidoId: partidoSeleccionado.id,
        tipo: tipoResultado,
        sets,
        ganadorParejaId,
        oficial: resultadoOficial,
        fechaRegistro: new Date(),
      };

      if (partidoSeleccionado.estado === "suspendido") {
        await resolverSuspension(datosResultado);
      } else {
        await registrarResultado(datosResultado, {
          partidoId: partidoSeleccionado.id,
          torneoId: competencia.torneoId,
          competenciaId: competencia.id,
          categoriaId: competencia.categoriaId,
        });
      }

      // El avance del ganador, el campeón y el cierre de la competencia ya se
      // resolvieron dentro de la transacción del resultado.
      setMensajeResultado("Resultado registrado correctamente.");
      setPartidoId("");
      reiniciarCarga();
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
    formato,
    setsVisibles,
    marcadores,
    tipoTercerSet,
    vistaPrevia,
    hayMarcadorCargado,
    ganadorEspecialId,
    resultadoOficial,
    guardandoResultado,
    mensajeResultado,
    errorResultado,
    setPartidoSeleccionadoId: seleccionarPartido,
    setTipoResultado,
    setTipoTercerSet,
    setMarcadores,
    setGanadorEspecialId,
    setResultadoOficial,
    setErrorResultado,
    setMensajeResultado,
    guardarResultado,
  };
}
