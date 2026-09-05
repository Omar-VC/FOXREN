// src/infrastructure/repositories/solicitudesRepository.ts

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { COLLECTIONS } from '../firebase/collections';
import type { SolicitudRegistro } from '../../domain/solicitud-registro/solicitud-registro.types';

// Omitimos los campos automáticos que genera Firebase y el estado inicial
export type CrearSolicitudInput = Omit<
  SolicitudRegistro, 
  'id' | 'estado' | 'fechaSolicitud' | 'fechaResolucion'
>;

export const solicitudesRepository = {
  /**
   * Verifica si ya existe un jugador o una solicitud activa con el mismo DNI
   */
  async existeDniRegistrado(dni: string): Promise<boolean> {
    const dniLimpio = dni.trim();

    // 1. Buscar en solicitudes de registro
    const qSolicitudes = query(
      collection(db, COLLECTIONS.solicitudesRegistro),
      where('dni', '==', dniLimpio)
    );
    const snapSolicitudes = await getDocs(qSolicitudes);
    
    if (!snapSolicitudes.empty) {
      return true;
    }

    // 2. Buscar en la colección de jugadores oficiales
    const qJugadores = query(
      collection(db, COLLECTIONS.jugadores),
      where('dni', '==', dniLimpio)
    );
    const snapJugadores = await getDocs(qJugadores);

    return !snapJugadores.empty;
  },

  /**
   * Registra la solicitud de un nuevo jugador en estado 'pendiente'
   */
  async crearSolicitud(datos: CrearSolicitudInput): Promise<string> {
    const yaExiste = await this.existeDniRegistrado(datos.dni);
    if (yaExiste) {
      throw new Error('El DNI ingresado ya tiene una solicitud o ya se encuentra registrado.');
    }

    const nuevaSolicitud = {
      ...datos,
      dni: datos.dni.trim(),
      estado: 'pendiente' as const,
      fechaSolicitud: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.solicitudesRegistro), 
      nuevaSolicitud
    );

    return docRef.id;
  }
};