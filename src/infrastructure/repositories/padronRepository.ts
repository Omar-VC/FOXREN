import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import { calcularCodigoDni } from "../../domain/jugador/jugador.padron";
import type { PadronJugador } from "../../domain/jugador/jugador.padron";

const MAXIMO_IN = 30;

/** Documento del padrón de un jugador (ID = ID del jugador). */
export function refPadronJugador(jugadorId: string) {
  return doc(db, COLLECTIONS.padronJugadores, jugadorId);
}

/** Documento del índice por DNI (ID = código derivado del DNI, nunca el DNI). */
export function refPadronDni(codigoDni: string) {
  return doc(db, COLLECTIONS.padronDni, codigoDni);
}

/**
 * Lectura del padrón: lo que ve un administrador de complejo para inscribir
 * jugadores. No contiene DNI ni datos de contacto.
 */
export const padronRepository = {
  /** Busca por DNI exacto. No hay forma de listar el índice por DNI. */
  async buscarPorDni(dni: string): Promise<PadronJugador | null> {
    const codigo = await calcularCodigoDni(dni);
    const indice = await getDoc(refPadronDni(codigo));
    if (!indice.exists()) return null;

    const jugadorId = indice.data().jugadorId;
    if (typeof jugadorId !== "string" || !jugadorId) return null;

    const padron = await getDoc(refPadronJugador(jugadorId));
    if (!padron.exists()) return null;

    return { id: padron.id, ...padron.data() } as PadronJugador;
  },

  async obtenerPorIds(ids: string[]): Promise<PadronJugador[]> {
    const unicos = [...new Set(ids)].filter(Boolean);
    const bloques: string[][] = [];
    for (let i = 0; i < unicos.length; i += MAXIMO_IN) {
      bloques.push(unicos.slice(i, i + MAXIMO_IN));
    }

    const snapshots = await Promise.all(
      bloques.map((bloque) =>
        getDocs(
          query(
            collection(db, COLLECTIONS.padronJugadores),
            where(documentId(), "in", bloque),
          ),
        ),
      ),
    );

    return snapshots.flatMap((snapshot) =>
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as PadronJugador),
    );
  },
};
