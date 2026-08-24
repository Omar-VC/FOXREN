import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type { Jugador } from "../../domain/jugador/jugador.types";
import { toFirestoreJugador, fromFirestoreJugador } from "../mappers/jugador.mapper";

// Crear jugador
export const crearJugador = async (jugador: Jugador): Promise<void> => {
  await addDoc(collection(db, COLLECTIONS.jugadores), toFirestoreJugador(jugador));
};

// Listar jugadores
export const listarJugadores = async (): Promise<Jugador[]> => {
  const snapshot = await getDocs(collection(db, COLLECTIONS.jugadores));
  return snapshot.docs.map(docSnap => fromFirestoreJugador({ id: docSnap.id, ...docSnap.data() }));
};

// Actualizar jugador
export const actualizarJugador = async (id: string, jugador: Partial<Jugador>): Promise<void> => {
  const jugadorRef = doc(db, COLLECTIONS.jugadores, id);
  await updateDoc(jugadorRef, toFirestoreJugador({ ...jugador, id } as Jugador));
};

// Eliminar jugador
export const eliminarJugador = async (id: string): Promise<void> => {
  const jugadorRef = doc(db, COLLECTIONS.jugadores, id);
  await deleteDoc(jugadorRef);
};
