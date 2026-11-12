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
  /**
   * Con `complejoId` trae solo los torneos de ese complejo (admin de complejo).
   * Sin él, trae todos (superadmin).
   */
  async obtenerTorneos(complejoId?: string): Promise<Torneo[]> {
    const referencia = collection(db, COLLECTIONS.torneos);
    const snap = await getDocs(
      complejoId
        ? query(referencia, where("complejoId", "==", complejoId))
        : referencia,
    );

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
    // Firestore no acepta valores undefined (por ejemplo, una fecha de fin vacía).
    const sinVacios = Object.fromEntries(
      Object.entries(datos).filter(([, valor]) => valor !== undefined),
    );
    const nuevoTorneo = {
      ...sinVacios,
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
