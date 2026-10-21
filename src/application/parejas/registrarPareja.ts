import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";
import { competenciaMapper } from "../../infrastructure/mappers/competencia.mapper";
import type { Jugador } from "../../domain/jugador/jugador.types";
import type { Pareja } from "../../domain/pareja/pareja.types";
import {
  competenciaAceptaInscripciones,
  parejaPuedeParticiparEnCompetencia,
  jugadorPuedeParticiparEnCompetencia,
} from "../../domain/competencia/competencia.rules";

interface DatosRegistrarPareja {
  competenciaId: string;
  jugador1Id: string;
  jugador2Id: string;
}

function crearIdReserva(competenciaId: string, jugadorId: string): string {
  return `${encodeURIComponent(competenciaId)}_${encodeURIComponent(jugadorId)}`;
}

export async function registrarPareja(
  datos: DatosRegistrarPareja,
): Promise<string> {
  if (datos.jugador1Id === datos.jugador2Id) {
    throw new Error("Los jugadores de una pareja no pueden ser iguales.");
  }

  const competenciaRef = doc(db, COLLECTIONS.competencias, datos.competenciaId);
  const jugador1Ref = doc(db, COLLECTIONS.jugadores, datos.jugador1Id);
  const jugador2Ref = doc(db, COLLECTIONS.jugadores, datos.jugador2Id);
  const parejasQuery = query(
    collection(db, COLLECTIONS.parejas),
    where("competenciaId", "==", datos.competenciaId),
  );

  // Consulta de compatibilidad con parejas creadas antes de añadir reservas.
  const parejasPreviasSnapshot = await getDocs(parejasQuery);
  const parejasPrevias = parejasPreviasSnapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  })) as Pareja[];
  const parejasActivasPrevias = parejasPrevias.filter(
    (pareja) => pareja.estado === "activa",
  );
  const idsJugadores = new Set([datos.jugador1Id, datos.jugador2Id]);

  if (
    parejasActivasPrevias.some(
      (pareja) =>
        idsJugadores.has(pareja.jugador1Id) || idsJugadores.has(pareja.jugador2Id),
    )
  ) {
    throw new Error("Uno de los jugadores ya está inscripto en esta competencia.");
  }

  const reserva1Ref = doc(
    db,
    COLLECTIONS.reservasCompetencia,
    crearIdReserva(datos.competenciaId, datos.jugador1Id),
  );
  const reserva2Ref = doc(
    db,
    COLLECTIONS.reservasCompetencia,
    crearIdReserva(datos.competenciaId, datos.jugador2Id),
  );
  // La misma referencia se reutiliza si Firestore reintenta el callback.
  const parejaRef = doc(collection(db, COLLECTIONS.parejas));

  return runTransaction(db, async (transaction) => {
    const [competenciaSnapshot, jugador1Snapshot, jugador2Snapshot, reserva1Snapshot, reserva2Snapshot] =
      await Promise.all([
        transaction.get(competenciaRef),
        transaction.get(jugador1Ref),
        transaction.get(jugador2Ref),
        transaction.get(reserva1Ref),
        transaction.get(reserva2Ref),
      ]);

    if (!competenciaSnapshot.exists()) {
      throw new Error("No se encontró la competencia.");
    }
    if (!jugador1Snapshot.exists() || !jugador2Snapshot.exists()) {
      throw new Error("No se encontraron los jugadores de la pareja.");
    }
    if (reserva1Snapshot.exists() || reserva2Snapshot.exists()) {
      throw new Error("Uno de los jugadores ya está inscripto en esta competencia.");
    }

    const competencia = competenciaMapper.fromFirestore(
      competenciaSnapshot.id,
      competenciaSnapshot.data(),
    );
    if (!competenciaAceptaInscripciones(competencia)) {
      throw new Error("La competencia no acepta nuevas inscripciones.");
    }

    const jugador1 = {
      id: jugador1Snapshot.id,
      ...jugador1Snapshot.data(),
    } as Jugador;
    const jugador2 = {
      id: jugador2Snapshot.id,
      ...jugador2Snapshot.data(),
    } as Jugador;

    if (jugador1.estado !== "activo" || jugador2.estado !== "activo") {
      throw new Error("Solo se pueden inscribir jugadores activos.");
    }
    if (
      !jugadorPuedeParticiparEnCompetencia(jugador1, competencia) ||
      !jugadorPuedeParticiparEnCompetencia(jugador2, competencia)
    ) {
      throw new Error("Uno de los jugadores no cumple la regla de categoría.");
    }
    if (!parejaPuedeParticiparEnCompetencia(jugador1, jugador2, competencia)) {
      throw new Error("La pareja no cumple la regla de categoría de la competencia.");
    }

    const datosCompetencia = competenciaSnapshot.data();
    const contadorActual = Number.isInteger(datosCompetencia.parejasActivasCount)
      ? datosCompetencia.parejasActivasCount as number
      : parejasActivasPrevias.length;
    if (contadorActual >= competencia.cupoMaximoParejas) {
      throw new Error("La competencia alcanzó el cupo máximo de parejas.");
    }

    const datosPareja = {
      competenciaId: competencia.id,
      jugador1Id: jugador1.id,
      jugador2Id: jugador2.id,
      estado: "activa" as const,
      creadoEn: new Date(),
    };
    transaction.set(parejaRef, datosPareja);
    transaction.set(reserva1Ref, {
      competenciaId: competencia.id,
      jugadorId: jugador1.id,
      parejaId: parejaRef.id,
      estado: "activa",
    });
    transaction.set(reserva2Ref, {
      competenciaId: competencia.id,
      jugadorId: jugador2.id,
      parejaId: parejaRef.id,
      estado: "activa",
    });
    transaction.update(competenciaRef, {
      parejasActivasCount: contadorActual + 1,
    });

    return parejaRef.id;
  });
}
