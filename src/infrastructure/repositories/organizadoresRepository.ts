// src/infrastructure/repositories/organizadoresRepository.ts

import { collection, addDoc, getDocs, Timestamp, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Organizador } from '../../domain/organizador/organizador.types';

const COLLECTION_NAME = 'organizadores';

export const organizadoresRepository = {
  async obtenerTodos(): Promise<Organizador[]> {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Organizador[];
  },

  async buscarPorDni(dniCuit: string): Promise<Organizador | null> {
    const q = query(collection(db, COLLECTION_NAME), where('dniCuit', '==', dniCuit.trim()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Organizador;
  },

  async crearOrganizador(datos: Omit<Organizador, 'id' | 'fechaRegistro'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...datos,
      dniCuit: datos.dniCuit.trim(),
      estado: datos.estado || 'activo',
      fechaRegistro: Timestamp.now(),
    });
    return docRef.id;
  },
};