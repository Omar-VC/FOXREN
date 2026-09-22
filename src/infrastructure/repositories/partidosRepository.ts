import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type { Partido } from "../../domain/partido/partido.types";

export const partidosRepository = {
  async getByCompetencia(competenciaId: string): Promise<Partido[]> {
    const q = query(collection(db, COLLECTIONS.partidos), where("competenciaId", "==", competenciaId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Partido));
  },

  async create(partido: Omit<Partido, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.partidos), partido);
    return docRef.id;
  },

  async updateResultado(id: string, datos: Partial<Partido>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.partidos, id);
    await updateDoc(docRef, datos);
  },
};