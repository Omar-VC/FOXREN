import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { Torneo } from "../../domain/torneo/torneo.types";

export const torneosRepository = {
  async obtenerTorneos(): Promise<Torneo[]> {
    const snap = await getDocs(collection(db, COLLECTIONS.torneos));

    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Torneo[];
  },

  async obtenerTorneoPorId(torneoId: string): Promise<Torneo | null> {
    const ref = doc(db, COLLECTIONS.torneos, torneoId);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    const datos = snap.data();

    return {
      id: snap.id,
      ...datos,
      fechaInicio: datos.fechaInicio.toDate(),
      fechaFin: datos.fechaFin ? datos.fechaFin.toDate() : undefined,
      fechaCreacion: datos.fechaCreacion.toDate(),
    } as Torneo;
  },

  async obtenerTorneosPorCircuito(circuitoId: string): Promise<Torneo[]> {
    const q = query(
      collection(db, COLLECTIONS.torneos),
      where("circuitoId", "==", circuitoId),
    );

    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Torneo[];
  },

  async crearTorneo(
    datos: Omit<Torneo, "id" | "fechaCreacion">,
  ): Promise<string> {
    const nuevoTorneo = {
      ...datos,
      estado: datos.estado ?? "pendiente",
      fechaCreacion: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.torneos),
      nuevoTorneo,
    );

    return docRef.id;
  },
};
