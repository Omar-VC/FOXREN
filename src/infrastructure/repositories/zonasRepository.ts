import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type { Zona } from "../../domain/competencia/competencia.zonas.types";

export const zonasRepository = {
  async obtenerPorCompetenciaId(competenciaId: string): Promise<Zona[]> {
    const q = query(
      collection(db, COLLECTIONS.zonas || "zonas"),
      where("competenciaId", "==", competenciaId),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Zona[];
  },

  async existenPorCompetenciaId(competenciaId: string): Promise<boolean> {
    const zonas = await this.obtenerPorCompetenciaId(competenciaId);
    return zonas.length > 0;
  },

  async crearMuchas(zonas: Zona[]): Promise<void> {
    for (const zona of zonas) {
      const { id: _id, ...datos } = zona;

      await addDoc(collection(db, COLLECTIONS.zonas || "zonas"), datos);
    }
  },
};
