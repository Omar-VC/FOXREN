import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  type Transaction,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { Partido } from "../../domain/partido/partido.types";

export const partidosRepository = {
  async getByCompetencia(
    competenciaId: string
  ): Promise<Partido[]> {
    const q = query(
      collection(db, COLLECTIONS.partidos),
      where("competenciaId", "==", competenciaId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Partido));
  },

  async create(
    partido: Omit<Partido, "id">
  ): Promise<string> {
    const docRef = await addDoc(
      collection(db, COLLECTIONS.partidos),
      partido
    );

    return docRef.id;
  },

  async updateResultado(
    id: string,
    datos: Partial<Partido>,
    transaction?: Transaction
  ): Promise<void> {
    const docRef = doc(
      db,
      COLLECTIONS.partidos,
      id
    );

    if (transaction) {
      transaction.update(docRef, datos);
      return;
    }

    await updateDoc(docRef, datos);
  },

  async obtenerPorId(
    id: string
  ): Promise<Partido | null> {
    const docRef = doc(
      db,
      COLLECTIONS.partidos,
      id
    );

    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Partido;
  },
};
