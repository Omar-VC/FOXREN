// src/infrastructure/repositories/circuitosRepository.ts

import { 
  collection, 
  addDoc, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { COLLECTIONS } from '../firebase/collections';
import type { Circuito, LlaveOrganizador } from '../../domain/circuito/circuito.types';

export const circuitosRepository = {
  /**
   * Obtiene la lista de todos los circuitos registrados
   */
  async obtenerCircuitos(): Promise<Circuito[]> {
    const snap = await getDocs(collection(db, COLLECTIONS.circuitos || 'circuitos'));
    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Circuito[];
  },

  /**
   * Crea un nuevo circuito
   */
  async crearCircuito(datos: Omit<Circuito, 'id' | 'fechaCreacion'>): Promise<string> {
    const nuevoCircuito = {
      ...datos,
      estado: datos.estado || 'activo',
      fechaCreacion: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.circuitos || 'circuitos'), nuevoCircuito);
    return docRef.id;
  },

  /**
   * Genera una nueva Llave de Organizador vinculada a un circuito
   */
  async emitirLlave(datos: Omit<LlaveOrganizador, 'id' | 'fechaEmision' | 'activa'>): Promise<string> {
    const nuevaLlave = {
      ...datos,
      activa: true,
      fechaEmision: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'llaves_organizadores'), nuevaLlave);
    return docRef.id;
  }
};