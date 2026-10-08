import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { Pareja } from "../../domain/pareja/pareja.types";

export const parejasRepository = {
  async obtenerPorId(id: string): Promise<Pareja | null> {
    const parejaRef = doc(db, COLLECTIONS.parejas, id);

    const snapshot = await getDoc(parejaRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Pareja;
  },

  async obtenerPorCompetenciaId(
    competenciaId: string
  ): Promise<Pareja[]> {
    const q = query(
      collection(db, COLLECTIONS.parejas),
      where("competenciaId", "==", competenciaId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Pareja[];
  },

  async crear(
    datos: Omit<Pareja, "id" | "creadoEn">
  ): Promise<string> {
    const docRef = await addDoc(
      collection(db, COLLECTIONS.parejas),
      {
        ...datos,
        creadoEn: new Date(),
      }
    );

    return docRef.id;
  },
};