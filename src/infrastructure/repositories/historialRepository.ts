import {
  addDoc,
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

  async crearRegistro(
    datos: RegistroHistorial,
    transaction?: Transaction
  ): Promise<string> {
    if (transaction) {
      const historialRef = collection(
        db,
        COLLECTIONS.historial
      );

      const docRef = doc(historialRef);

      transaction.set(docRef, datos);

      return docRef.id;
    }

    const docRef = await addDoc(
      collection(db, COLLECTIONS.historial),
      datos
    );

    return docRef.id;
  },
};