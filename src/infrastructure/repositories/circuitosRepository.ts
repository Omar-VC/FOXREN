// src/infrastructure/repositories/circuitosRepository.ts

import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { Circuito } from "../../domain/circuito/circuito.types";

export const circuitosRepository = {
  /**
   * Obtiene todos los circuitos registrados.
   */
  async obtenerCircuitos(): Promise<Circuito[]> {
    const snap = await getDocs(
      collection(
        db,
        COLLECTIONS.circuitos || "circuitos"
      )
    );

    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Circuito[];
  },

  /**
   * Crea un nuevo circuito.
   */
  async crearCircuito(
    datos: Omit<Circuito, "id" | "fechaCreacion">
  ): Promise<string> {
    const nuevoCircuito = {
      ...datos,
      estado: datos.estado ?? "activo",
      fechaCreacion: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(
        db,
        COLLECTIONS.circuitos || "circuitos"
      ),
      nuevoCircuito
    );

    return docRef.id;
  },
};