// src/infrastructure/repositories/inscripcionesRepository.ts

import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { COLLECTIONS } from '../firebase/collections';


export interface InscripcionPareja {
  id?: string;
  torneoId: string;
  categoria: string;
  jugador1: {
    id: string;
    nombreCompleto: string;
    dni: string;
  };
  jugador2: {
    id: string;
    nombreCompleto: string;
    dni: string;
  };
  montoBase: number;
  feeFoxren: number;
  montoTotal: number;
  estadoPago: 'PENDIENTE' | 'CONFIRMADO';
  fechaInscripcion: Date;
}

export const inscripcionesRepository = {
  /**
   * Registra una nueva pareja inscrita en un torneo
   */
  async inscribirPareja(datos: Omit<InscripcionPareja, 'id' | 'fechaInscripcion'>): Promise<string> {
    // 1. Validar que la pareja no esté ya inscrita en la misma categoría
    const q = query(
      collection(db, COLLECTIONS.inscripciones || 'inscripciones'),
      where('torneoId', '==', datos.torneoId),
      where('categoria', '==', datos.categoria)
    );
    const snap = await getDocs(q);

    const duplicado = snap.docs.some((doc) => {
      const data = doc.data();
      const dnisExistentes = [data.jugador1.dni, data.jugador2.dni];
      return dnisExistentes.includes(datos.jugador1.dni) || dnisExistentes.includes(datos.jugador2.dni);
    });

    if (duplicado) {
      throw new Error('Uno de los jugadores ya se encuentra inscrito en esta categoría para este torneo.');
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.inscripciones || 'inscripciones'), {
      ...datos,
      fechaInscripcion: Timestamp.now(),
    });

    return docRef.id;
  },

  /**
   * Obtiene las inscripciones de un torneo específico
   */
  async obtenerPorTorneo(torneoId: string): Promise<InscripcionPareja[]> {
    const q = query(
      collection(db, COLLECTIONS.inscripciones || 'inscripciones'),
      where('torneoId', '==', torneoId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fechaInscripcion: doc.data().fechaInscripcion?.toDate(),
    })) as InscripcionPareja[];
  }
};