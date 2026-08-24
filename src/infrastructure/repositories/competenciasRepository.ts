import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type { Competencia } from "../../domain/competencia/competencia.types";
import { toFirestoreCompetencia, fromFirestoreCompetencia } from "../mappers/competencia.mapper";


// Crear competencia
export const crearCompetencia = async (competencia: Competencia): Promise<void> => {
  await addDoc(collection(db, COLLECTIONS.competencias), toFirestoreCompetencia(competencia));
};

// Listar competencias
export const listarCompetencias = async (): Promise<Competencia[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.competencias));
  return snapshot.docs.map(docSnap => fromFirestoreCompetencia({ id: docSnap.id, ...docSnap.data() }));
};

// Actualizar competencia
export const actualizarCompetencia = async (id: string, competencia: Partial<Competencia>): Promise<void> => {
  const competenciaRef = doc(db, COLLECTIONS.competencias, id);
  await updateDoc(competenciaRef, toFirestoreCompetencia({ ...competencia, id } as Competencia));
};

// Eliminar competencia
export const eliminarCompetencia = async (id: string): Promise<void> => {
  const competenciaRef = doc(db, COLLECTIONS.competencias, id);
  await deleteDoc(competenciaRef);
};
