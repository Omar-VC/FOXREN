import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type { Zona } from "../../domain/zona/zona.types";

export const zonasRepository = {
  async getByCompetencia(competenciaId: string): Promise<Zona[]> {
    const q = query(collection(db, COLLECTIONS.zonas), where("competenciaId", "==", competenciaId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Zona));
  },

  async create(zona: Omit<Zona, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.zonas), zona);
    return docRef.id;
  },
};