import {
  addDoc,
  collection,
  getDoc,
  doc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { Circuito } from "../../domain/circuito/circuito.types";

export const circuitosRepository = {
  async obtenerCircuitos(): Promise<Circuito[]> {
    const snap = await getDocs(collection(db, COLLECTIONS.circuitos));

    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Circuito[];
  },

  async obtenerCircuitoPorId(circuitoId: string): Promise<Circuito | null> {
    const ref = doc(db, COLLECTIONS.circuitos, circuitoId);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    return {
      id: snap.id,
      ...snap.data(),
    } as Circuito;
  },

  async crearCircuito(
    datos: Omit<Circuito, "id" | "fechaCreacion">,
  ): Promise<string> {
    const nuevoCircuito = {
      ...datos,
      estado: datos.estado ?? "activo",
      fechaCreacion: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.circuitos),
      nuevoCircuito,
    );

    return docRef.id;
  },
};
