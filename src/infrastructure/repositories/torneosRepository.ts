// src/infrastructure/repositories/torneosRepository.ts

import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
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
  }
};