import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type {
  Competencia,
  EstadoCompetencia,
  ReglamentoCompetencia,
} from "../../domain/competencia/competencia.types";
import { competenciaMapper } from "../mappers/competencia.mapper";
import { reglamentoCompetenciaEsValido } from "../../domain/competencia/competencia.reglamento.rules";

export const competenciasRepository = {
  async crearCompetencia(datos: Omit<Competencia, "id">): Promise<string> {
    const docRef = await addDoc(
      collection(db, COLLECTIONS.competencias || "competencias"),
      {
        ...datos,
        fechaInicio: Timestamp.fromDate(datos.fechaInicio || new Date()),
        fechaFin: Timestamp.fromDate(datos.fechaFin || new Date()),
      },
    );
    return docRef.id;
  },

  /**
   * Obtiene todas las competencias pertenecientes a un torneo específico
   */
  async obtenerPorTorneoId(torneoId: string): Promise<Competencia[]> {
    const q = query(
      collection(db, COLLECTIONS.competencias || "competencias"),
      where("torneoId", "==", torneoId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) =>
      competenciaMapper.fromFirestore(doc.id, doc.data()),
    );
  },

  async obtenerPorId(competenciaId: string): Promise<Competencia | null> {
    const competenciaRef = doc(db, COLLECTIONS.competencias, competenciaId);

    const snapshot = await getDoc(competenciaRef);

    if (!snapshot.exists()) {
      return null;
    }

    return competenciaMapper.fromFirestore(snapshot.id, snapshot.data());
  },

  async cambiarEstado(
    competenciaId: string,
    nuevoEstado: EstadoCompetencia,
  ): Promise<void> {
    const docRef = doc(
      db,
      COLLECTIONS.competencias || "competencias",
      competenciaId,
    );
    await updateDoc(docRef, {
      estado: nuevoEstado,
    });
  },

  async guardarReglamento(
    competenciaId: string,
    reglamento: ReglamentoCompetencia,
  ): Promise<void> {
    if (!reglamentoCompetenciaEsValido(reglamento)) {
      throw new Error("La configuración del reglamento no es válida.");
    }
    const docRef = doc(db, COLLECTIONS.competencias, competenciaId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(docRef);
      if (!snapshot.exists()) throw new Error("No se encontró la competencia.");
      const competencia = competenciaMapper.fromFirestore(snapshot.id, snapshot.data());
      if (competencia.zonasGeneradas || competencia.estado !== "borrador") {
        throw new Error("El reglamento solo se puede cambiar mientras la competencia está en borrador.");
      }
      transaction.update(docRef, { reglamento });
    });
  },

  async aprobarReglamento(competenciaId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.competencias, competenciaId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(docRef);
      if (!snapshot.exists()) throw new Error("No se encontró la competencia.");
      const competencia = competenciaMapper.fromFirestore(snapshot.id, snapshot.data());
      const reglamento = competencia.reglamento;
      if (!reglamento || reglamento.estado !== "pendiente_revision" || reglamento.origen === "foxren") {
        throw new Error("No hay una propuesta pendiente de aprobación.");
      }
      if (competencia.zonasGeneradas || competencia.estado !== "borrador") {
        throw new Error("El reglamento solo se puede aprobar mientras la competencia está en borrador.");
      }
      transaction.update(docRef, { "reglamento.estado": "aprobado" });
    });
  },
};

// Crear competencia
export const crearCompetencia = async (
  competencia: Competencia,
): Promise<void> => {
  await addDoc(
    collection(db, COLLECTIONS.competencias),
    competenciaMapper.toFirestore(competencia),
  );
};

// Listar competencias
export const listarCompetencias = async (): Promise<Competencia[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.competencias));
  return snapshot.docs.map((docSnap) =>
    competenciaMapper.fromFirestore(docSnap.id, docSnap.data()),
  );
};

// Actualizar competencia
export const actualizarCompetencia = async (
  id: string,
  competencia: Partial<Competencia>,
): Promise<void> => {
  const competenciaRef = doc(db, COLLECTIONS.competencias, id);
  await updateDoc(
    competenciaRef,
    competenciaMapper.toFirestorePatch(competencia),
  );
};

// Eliminar competencia
export const eliminarCompetencia = async (id: string): Promise<void> => {
  const competenciaRef = doc(db, COLLECTIONS.competencias, id);
  await deleteDoc(competenciaRef);
};
