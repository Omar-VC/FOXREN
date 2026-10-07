import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { Complejo } from "../../domain/complejo/complejo.types";

export const complejosRepository = {
  async obtenerComplejos(): Promise<Complejo[]> {
    const snap = await getDocs(
      collection(db, COLLECTIONS.complejos)
    );

    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Complejo[];
  },

  async obtenerComplejosPorCircuito(
    circuitoId: string
  ): Promise<Complejo[]> {
    const q = query(
      collection(db, COLLECTIONS.complejos),
      where("circuitoId", "==", circuitoId)
    );

    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Complejo[];
  },

  async crearComplejo(
    datos: Omit<Complejo, "id" | "fechaCreacion">
  ): Promise<string> {
    const nuevoComplejo = {
      ...datos,
      estado: datos.estado ?? "activo",
      fechaCreacion: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.complejos),
      nuevoComplejo
    );

    return docRef.id;
  },
};