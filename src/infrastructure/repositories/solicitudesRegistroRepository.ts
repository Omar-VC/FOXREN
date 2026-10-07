import {
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type {
  SolicitudRegistro,
  EstadoSolicitudRegistro,
} from "../../domain/SolicitudRegistro/solicitudRegistro.types";

export const solicitudesRegistroRepository = {
  async obtenerSolicitudes(): Promise<SolicitudRegistro[]> {
    const snapshot = await getDocs(
      collection(
        db,
        COLLECTIONS.solicitudesRegistro
      )
    );

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as SolicitudRegistro[];
  },

  async obtenerPendientes(): Promise<SolicitudRegistro[]> {
    const q = query(
      collection(
        db,
        COLLECTIONS.solicitudesRegistro
      ),
      where("estado", "==", "pendiente")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as SolicitudRegistro[];
  },

  async obtenerPorDni(
  dni: string
): Promise<SolicitudRegistro[]> {
  const q = query(
    collection(
      db,
      COLLECTIONS.solicitudesRegistro
    ),
    where("dni", "==", dni)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as SolicitudRegistro[];
},

  async crearSolicitud(
    datos: Omit<SolicitudRegistro, "id">
  ): Promise<string> {
    const docRef = await addDoc(
      collection(
        db,
        COLLECTIONS.solicitudesRegistro
      ),
      datos
    );

    return docRef.id;
  },

  async cambiarEstado(
    id: string,
    estado: EstadoSolicitudRegistro
  ): Promise<void> {
    const solicitudRef = doc(
      db,
      COLLECTIONS.solicitudesRegistro,
      id
    );

    await updateDoc(solicitudRef, {
      estado,
      fechaResolucion:
        estado === "pendiente"
          ? undefined
          : new Date(),
    });
  },
};