import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from "../../../infrastructure/firebase/firebase";
import type { EstadoCompetencia } from "../../../domain/competencia/competencia.types";

export const competenciaService = {
  /**
   * Actualiza el estado de una competencia en Firestore (ABIERTA, CERRADA, EN_JUEGO, FINALIZADA)
   */
  actualizarEstado: async (competenciaId: string, nuevoEstado: EstadoCompetencia): Promise<void> => {
    const compRef = doc(db, 'competencias', competenciaId);
    await updateDoc(compRef, {
      estado: nuevoEstado,
      updatedAt: new Date(),
    });
  },

  /**
   * Crear una nueva competencia/categoría asociada a un torneo
   */
  crearCompetencia: async (torneoId: string, datosCompetencia: any): Promise<string> => {
    const docRef = await addDoc(collection(db, 'competencias'), {
      ...datosCompetencia,
      torneoId,
      createdAt: new Date(),
    });
    return docRef.id;
  },
};