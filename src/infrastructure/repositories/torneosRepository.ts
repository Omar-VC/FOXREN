import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type { Torneo } from "../../domain/torneo/torneo.types";
import { toFirestoreTorneo, fromFirestoreTorneo } from "../mappers/torneo.mapper";

// Crear torneo
export const crearTorneo = async (torneo: Torneo): Promise<void> => {
  await addDoc(collection(db, COLLECTIONS.torneos), toFirestoreTorneo(torneo));
};

// Listar torneos
export const listarTorneos = async (): Promise<Torneo[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.torneos));
  return snapshot.docs.map(docSnap => fromFirestoreTorneo({ id: docSnap.id, ...docSnap.data() }));
};

// Actualizar torneo
export const actualizarTorneo = async (id: string, torneo: Partial<Torneo>): Promise<void> => {
  const torneoRef = doc(db, COLLECTIONS.torneos, id);
  await updateDoc(torneoRef, toFirestoreTorneo({ ...torneo, id } as Torneo));
};

// Eliminar torneo
export const eliminarTorneo = async (id: string): Promise<void> => {
  const torneoRef = doc(db, COLLECTIONS.torneos, id);
  await deleteDoc(torneoRef);
};
