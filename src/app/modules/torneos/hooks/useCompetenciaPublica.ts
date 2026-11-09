import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  documentId,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../../../infrastructure/firebase/collections";
import { competenciaMapper } from "../../../../infrastructure/mappers/competencia.mapper";
import { partidoMapper } from "../../../../infrastructure/mappers/partido.mapper";
import { resultadoRepository } from "../../../../infrastructure/repositories/resultadoRepository";
import type { Competencia } from "../../../../domain/competencia/competencia.types";
import type { Zona } from "../../../../domain/competencia/competencia.zonas.types";
import type { Partido } from "../../../../domain/partido/partido.types";
import type { Pareja } from "../../../../domain/pareja/pareja.types";
import type { Resultado } from "../../../../domain/resultado/resultado.types";
import { nombreVisibleDesdePerfil } from "../../../../domain/jugador/jugador.nombrePublico";
import type { NombrePerfilPublico } from "../../../../domain/jugador/jugador.nombrePublico";
import { calcularIdPublico } from "../../../../domain/jugador/jugador.idPublico";

const MAXIMO_IN = 30;

/**
 * Datos de una competencia para la web pública, actualizados en tiempo real.
 *
 * Los nombres salen de la colección pública de jugadores (sin datos privados),
 * donde solo existe quien dio permiso de publicación. Quien no tiene documento
 * se muestra como "Jugador reservado". La web pública nunca lee `jugadores`.
 */
export function useCompetenciaPublica(competenciaId: string) {
  const [competencia, setCompetencia] = useState<Competencia | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [parejas, setParejas] = useState<Pareja[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [nombresPublicos, setNombresPublicos] = useState<Map<string, NombrePerfilPublico>>(
    new Map(),
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  /* ---- Suscripciones en vivo ---- */
  useEffect(() => {
    if (!competenciaId) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);
    const alFallar = () => {
      setError("No se pudo cargar la información de la competencia.");
      setCargando(false);
    };

    const desuscribir = [
      onSnapshot(
        doc(db, COLLECTIONS.competencias, competenciaId),
        (snap) => {
          setCompetencia(
            snap.exists() ? competenciaMapper.fromFirestore(snap.id, snap.data()) : null,
          );
          setCargando(false);
          setUltimaActualizacion(new Date());
        },
        alFallar,
      ),
      onSnapshot(
        query(collection(db, COLLECTIONS.partidos), where("competenciaId", "==", competenciaId)),
        (snap) => {
          setPartidos(snap.docs.map((d) => partidoMapper.fromFirestore(d.id, d.data())));
          setUltimaActualizacion(new Date());
        },
        alFallar,
      ),
      onSnapshot(
        query(collection(db, COLLECTIONS.zonas), where("competenciaId", "==", competenciaId)),
        (snap) =>
          setZonas(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Zona)),
        alFallar,
      ),
      onSnapshot(
        query(collection(db, COLLECTIONS.parejas), where("competenciaId", "==", competenciaId)),
        (snap) =>
          setParejas(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Pareja)),
        alFallar,
      ),
    ];

    return () => desuscribir.forEach((f) => f());
  }, [competenciaId]);

  /* ---- Resultados: se vuelven a leer cada vez que cambian los partidos ---- */
  const idsPartidos = useMemo(
    () => partidos.map((p) => `${p.id}:${p.estado}:${p.ganadorParejaId ?? ""}`).join("|"),
    [partidos],
  );
  useEffect(() => {
    let cancelado = false;
    if (partidos.length === 0) {
      setResultados([]);
      return;
    }
    resultadoRepository
      .obtenerPorPartidoIds(partidos.map((p) => p.id))
      .then((datos) => {
        if (!cancelado) setResultados(datos);
      })
      .catch(() => {
        if (!cancelado) setError("No se pudieron cargar los resultados.");
      });
    return () => {
      cancelado = true;
    };
    // idsPartidos cambia cuando cambia cualquier estado o ganador
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsPartidos]);

  /* ---- Nombres públicos de los jugadores de las parejas ---- */
  const idsJugadores = useMemo(
    () =>
      [...new Set(parejas.flatMap((p) => [p.jugador1Id, p.jugador2Id]))]
        .filter(Boolean)
        .sort()
        .join("|"),
    [parejas],
  );
  useEffect(() => {
    let cancelado = false;
    if (!idsJugadores) {
      setNombresPublicos(new Map());
      return;
    }

    async function cargarNombres() {
      // El documento público se identifica con un ID derivado: no revela el ID interno.
      const internoPorPublico = new Map<string, string>();
      for (const id of idsJugadores.split("|")) {
        internoPorPublico.set(await calcularIdPublico(id), id);
      }

      const idsPublicos = [...internoPorPublico.keys()];
      const nombres = new Map<string, NombrePerfilPublico>();

      for (let i = 0; i < idsPublicos.length; i += MAXIMO_IN) {
        const lote = idsPublicos.slice(i, i + MAXIMO_IN);
        const snap = await getDocs(
          query(collection(db, COLLECTIONS.jugadoresPublicos), where(documentId(), "in", lote)),
        );
        for (const documento of snap.docs) {
          const interno = internoPorPublico.get(documento.id);
          if (!interno) continue;
          const { nombre, apellido, apodo } = documento.data() as NombrePerfilPublico;
          nombres.set(interno, { nombre, apellido, apodo });
        }
      }

      if (!cancelado) setNombresPublicos(nombres);
    }

    cargarNombres().catch(() => {
      if (!cancelado) setError("No se pudieron cargar las parejas.");
    });
    return () => {
      cancelado = true;
    };
  }, [idsJugadores]);

  /* ---- Nombres públicos ---- */
  function nombreJugadorPublico(jugadorId: string): string {
    return nombreVisibleDesdePerfil(nombresPublicos.get(jugadorId));
  }

  function nombrePareja(parejaId: string): string {
    const pareja = parejas.find((p) => p.id === parejaId);
    if (!pareja) return "Pareja por definir";
    return `${nombreJugadorPublico(pareja.jugador1Id)} / ${nombreJugadorPublico(pareja.jugador2Id)}`;
  }

  function nombreZona(zonaId?: string): string {
    if (!zonaId) return "Sin zona";
    return zonas.find((z) => z.id === zonaId)?.nombre ?? "Zona";
  }

  return {
    competencia,
    partidos,
    zonas,
    parejas,
    resultados,
    cargando,
    error,
    ultimaActualizacion,
    nombrePareja,
    nombreZona,
  };
}
