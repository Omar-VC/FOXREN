// src/infrastructure/repositories/torneosRepository.ts

import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { COLLECTIONS } from '../firebase/collections';
import type { Torneo } from '../../domain/torneo/torneo.types';

export const torneosRepository = {
  /**
   * Obtiene todos los torneos registrados
   */
  async obtenerTorneos(): Promise<Torneo[]> {
    const snap = await getDocs(collection(db, COLLECTIONS.torneos));
    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Torneo[];
  },

  /**
   * Obtiene torneos pertenecientes a un circuito específico
   */
  async obtenerTorneosPorCircuito(circuitoId: string): Promise<Torneo[]> {
    const q = query(collection(db, COLLECTIONS.torneos), where("circuitoId", "==", circuitoId));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Torneo[];
  },

  /**
   * Crea un nuevo torneo vinculado a un circuito
   */
  async crearTorneo(datos: Omit<Torneo, 'id' | 'fechaCreacion'>): Promise<string> {
    const nuevoTorneo = {
      ...datos,
      estado: datos.estado || 'INSCRIPCION_ABIERTA',
      fechaCreacion: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.torneos), nuevoTorneo);
    return docRef.id;
  },

  /**
   * Registra la inscripción de una pareja a un torneo
   */
  async inscribirPareja(datos: {
    torneoId: string;
    categoria: string;
    jugador1: { dni: string; nombre: string; apellido: string };
    jugador2: { dni: string; nombre: string; apellido: string };
    estadoPago: string;
  }): Promise<string> {
    const nuevaInscripcion = {
      ...datos,
      fechaInscripcion: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.inscripciones || "inscripciones"), nuevaInscripcion);
    return docRef.id;
  },
};

// Obtener inscriptos de un torneo específico
export const obtenerInscriptosPorTorneo = async (torneoId: string) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.inscripciones),
      where('torneoId', '==', torneoId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
  } catch (error) {
    console.error('Error al obtener inscriptos:', error);
    throw error;
  }
};

// Cambiar el estado de pago o confirmación de una inscripción
export const cambiarEstadoInscripcion = async (inscripcionId: string, nuevoEstado: string) => {
  try {
    const ref = doc(db, COLLECTIONS.inscripciones, inscripcionId);
    await updateDoc(ref, { estadoPago: nuevoEstado });
    return true;
  } catch (error) {
    console.error('Error al cambiar estado de inscripción:', error);
    throw error;
  }
};