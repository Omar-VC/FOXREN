// src/infrastructure/repositories/jugadoresRepository.ts

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type { Jugador } from "../../domain/jugador/jugador.types";
import {
  toFirestoreJugador,
  fromFirestoreJugador,
} from "../mappers/jugador.mapper";

// 1. Funciones individuales
export const crearJugador = async (jugador: Jugador): Promise<void> => {
  await addDoc(
    collection(db, COLLECTIONS.jugadores),
    toFirestoreJugador(jugador),
  );
};

export const listarJugadores = async (): Promise<Jugador[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.jugadores));
  return snapshot.docs.map((docSnap) =>
    fromFirestoreJugador({ id: docSnap.id, ...docSnap.data() }),
  );
};

export const actualizarJugador = async (
  id: string,
  jugador: Partial<Jugador>,
): Promise<void> => {
  const jugadorRef = doc(db, COLLECTIONS.jugadores, id);
  await updateDoc(
    jugadorRef,
    toFirestoreJugador({ ...jugador, id } as Jugador),
  );
};

export const eliminarJugador = async (id: string): Promise<void> => {
  const jugadorRef = doc(db, COLLECTIONS.jugadores, id);
  await deleteDoc(jugadorRef);
};

// 2. Exportación unificada de objeto (para compatibilidad con los componentes)
export const jugadoresRepository = {
  crearJugador,
  obtenerTodos: listarJugadores,
  actualizarJugador,
  eliminarJugador,
  async buscarPorDni(dni: string): Promise<Jugador | null> {
    const todos = await this.obtenerTodos();
    return todos.find((j) => j.dni === dni) || null;
  },
};
