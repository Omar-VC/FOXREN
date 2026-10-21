import {
  collection,
  getDocs,
  query,
  where,
  doc,
  type Transaction,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { RegistroHistorial } from "../../domain/historial/historial.types";

export const historialRepository = {
  async obtenerPorJugador(
    jugadorId: string
  ): Promise<RegistroHistorial[]> {
    const q = query(
      collection(db, COLLECTIONS.historial),
      where("jugadorId", "==", jugadorId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
    })) as RegistroHistorial[];
  },

  crearRegistro(
    datos: RegistroHistorial,
    transaction: Transaction,
  ): string {
    const docRef = doc(collection(db, COLLECTIONS.historial));
    transaction.set(docRef, datos);

    return docRef.id;
  },
};
