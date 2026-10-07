import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import { COLLECTIONS } from "../firebase/collections";

import type { Jugador } from "../../domain/jugador/jugador.types";

import type { SolicitudRegistro } from "../../domain/SolicitudRegistro/solicitudRegistro.types";

export const jugadoresRepository = {
  async obtenerJugadores(): Promise<Jugador[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.jugadores));

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Jugador[];
  },

  async obtenerJugadorPorDni(dni: string): Promise<Jugador | null> {
    const q = query(
      collection(db, COLLECTIONS.jugadores),
      where("dni", "==", dni),
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Jugador;
  },

  async obtenerJugadorPorId(id: string): Promise<Jugador | null> {
    const jugadorRef = doc(db, COLLECTIONS.jugadores, id);

    const snapshot = await getDoc(jugadorRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Jugador;
  },

  async crearJugador(datos: Omit<Jugador, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.jugadores), datos);

    return docRef.id;
  },

  async crearDesdeSolicitud(solicitud: SolicitudRegistro): Promise<string> {
    const jugador: Omit<Jugador, "id"> = {
      dni: solicitud.dni,
      nombre: solicitud.nombre,
      apellido: solicitud.apellido,
      apodo: solicitud.apodo,
      sexo: solicitud.sexo,
      ciudad: solicitud.ciudad,
      provincia: solicitud.provincia,
      fechaNacimiento: solicitud.fechaNacimiento,
      ladoJuego: solicitud.ladoJuego,
      categoriaDeclarada: solicitud.categoriaDeclarada,
      estado: "activo",
      fechaRegistro: new Date(),
    };

    return this.crearJugador(jugador);
  },

  async actualizarJugador(id: string, datos: Partial<Jugador>): Promise<void> {
    const jugadorRef = doc(db, COLLECTIONS.jugadores, id);

    await updateDoc(jugadorRef, datos);
  },

  async eliminarJugador(id: string): Promise<void> {
    const jugadorRef = doc(db, COLLECTIONS.jugadores, id);

    await deleteDoc(jugadorRef);
  },
};
