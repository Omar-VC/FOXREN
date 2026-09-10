import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type { Competencia } from "../../domain/competencia/competencia.types";
import { competenciaMapper } from "../mappers/competencia.mapper";


export const competenciasRepository = {
  async crearCompetencia(datos: Omit<Competencia, "id">): Promise<string> {
    const docRef = await addDoc(
      collection(db, COLLECTIONS.competencias || "competencias"),
      {
        ...datos,
        fechaInicio: Timestamp.fromDate(datos.fechaInicio || new Date()),
        fechaFin: Timestamp.fromDate(datos.fechaFin || new Date()),
      }
    );
    return docRef.id;
  },

  /**
   * Obtiene todas las competencias pertenecientes a un torneo específico
   */
  async obtenerPorTorneoId(torneoId: string): Promise<Competencia[]> {
    const q = query(
      collection(db, COLLECTIONS.competencias || "competencias"),
      where("torneoId", "==", torneoId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => competenciaMapper.fromFirestore(doc.id, doc.data()));
  },
};


// Crear competencia
export const crearCompetencia = async (competencia: Competencia): Promise<void> => {
  await addDoc(collection(db, COLLECTIONS.competencias), competenciaMapper.toFirestore(competencia));
};

// Listar competencias
export const listarCompetencias = async (): Promise<Competencia[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.competencias));
  return snapshot.docs.map(docSnap => competenciaMapper.fromFirestore(docSnap.id, docSnap.data()));
};

// Actualizar competencia
export const actualizarCompetencia = async (id: string, competencia: Partial<Competencia>): Promise<void> => {
  const competenciaRef = doc(db, COLLECTIONS.competencias, id);
  await updateDoc(competenciaRef, competenciaMapper.toFirestore({ ...competencia, id } as Competencia));
};

// Eliminar competencia
export const eliminarCompetencia = async (id: string): Promise<void> => {
  const competenciaRef = doc(db, COLLECTIONS.competencias, id);
  await deleteDoc(competenciaRef);
};
