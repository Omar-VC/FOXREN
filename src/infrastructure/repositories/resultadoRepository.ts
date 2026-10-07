import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
  type Transaction,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { Resultado } from "../../domain/resultado/resultado.types";

export const resultadoRepository = {
  async crearResultado(
    datos: Omit<Resultado, "id">,
    transaction?: Transaction
  ): Promise<string> {
    if (transaction) {
      const resultadoRef = collection(
        db,
        COLLECTIONS.resultados
      );

      const docRef = doc(
        resultadoRef
      );

      transaction.set(docRef, datos);

      return docRef.id;
    }

    const docRef = await addDoc(
      collection(db, COLLECTIONS.resultados),
      datos
    );

    return docRef.id;
  },

  async obtenerPorPartido(
    partidoId: string
  ): Promise<Resultado[]> {
    const q = query(
      collection(db, COLLECTIONS.resultados),
      where("partidoId", "==", partidoId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    })) as Resultado[];
  },
};