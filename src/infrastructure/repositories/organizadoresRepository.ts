import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import type { Organizador } from "../../domain/organizador/organizador.types";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

export const organizadoresRepository = {
  /**
   * Con `complejoId` trae solo los organizadores de ese complejo (lo que usa el
   * admin de complejo). Sin él, trae todos (superadmin).
   */
  async obtenerOrganizadores(complejoId?: string): Promise<Organizador[]> {
    const referencia = collection(db, COLLECTIONS.organizadores);
    const snapshot = await getDocs(
      complejoId ? query(referencia, where("complejoId", "==", complejoId)) : referencia,
    );
    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as Organizador[];
  },

  async obtenerPorIds(ids: string[]): Promise<Organizador[]> {
    const unicos = [...new Set(ids)];
    const snapshots = await Promise.all(
      unicos.map((id) => getDoc(doc(db, COLLECTIONS.organizadores, id))),
    );
    return snapshots.flatMap((snapshot) => snapshot.exists()
      ? [{ id: snapshot.id, ...snapshot.data() } as Organizador]
      : []);
  },

  async crearOrganizador(
    datos: Omit<Organizador, "id" | "fechaCreacion">,
  ): Promise<string> {
    const nuevo = {
      ...datos,
      nombre: datos.nombre.trim(),
      contactoPublico: datos.contactoPublico?.trim() || undefined,
      fechaCreacion: Timestamp.now(),
    };
    const creado = await addDoc(collection(db, COLLECTIONS.organizadores), nuevo);
    return creado.id;
  },
};
