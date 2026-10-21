import {
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
  crearResultado(
    datos: Omit<Resultado, "id">,
    transaction: Transaction,
    idDeterministico: string,
  ): string {
    const resultadoRef = doc(db, COLLECTIONS.resultados, idDeterministico);
    transaction.set(resultadoRef, datos);
    return resultadoRef.id;
  },

  actualizarResultado(
    datos: Omit<Resultado, "id">,
    transaction: Transaction,
    idDeterministico: string,
  ): string {
    const resultadoRef = doc(db, COLLECTIONS.resultados, idDeterministico);
    transaction.set(resultadoRef, datos);
    return resultadoRef.id;
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

  async obtenerPorPartidoIds(partidoIds: string[]): Promise<Resultado[]> {
    const unicos = [...new Set(partidoIds)].filter(Boolean);
    const bloques: string[][] = [];
    for (let indice = 0; indice < unicos.length; indice += 30) {
      bloques.push(unicos.slice(indice, indice + 30));
    }
    const snapshots = await Promise.all(bloques.map((bloque) => getDocs(
      query(
        collection(db, COLLECTIONS.resultados),
        where("partidoId", "in", bloque),
      ),
    )));
    return snapshots.flatMap((snapshot) => snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    }) as Resultado));
  },
};
