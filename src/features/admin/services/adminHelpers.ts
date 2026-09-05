// src/features/admin/services/adminHelpers.ts

import { db } from "../../../infrastructure/firebase/firebase";
import { doc, setDoc, deleteDoc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "../../../infrastructure/firebase/collections";
import type { SolicitudRegistro } from "../../../domain/solicitud-registro/solicitud-registro.types";

/**
 * Aprueba una solicitud de registro:
 * 1. Crea el jugador oficial activo en la colección 'jugadores' con la categoría oficial asignada.
 * 2. Remueve o actualiza la solicitud pendiente.
 */
export const aprobarSolicitudJugador = async (
  solicitud: SolicitudRegistro, 
  categoriaOficialId: string
): Promise<void> => {
  // 1. Crear el jugador oficial en la colección 'jugadores'
  const nuevoJugadorRef = doc(db, COLLECTIONS.jugadores, solicitud.id);
  
  await setDoc(nuevoJugadorRef, {
    nombre: solicitud.nombre,
    apellido: solicitud.apellido,
    apodo: solicitud.apodo || "",
    dni: solicitud.dni,
    ciudad: solicitud.ciudad,
    sexo: solicitud.sexo,
    nivelInicial: solicitud.nivelInicial,
    ladoJuego: solicitud.ladoJuego,
    categoriaDeclarada: solicitud.nivelInicial || "",
    categoriaId: categoriaOficialId, // Asignada oficialmente por el Admin
    estado: "activo",
    fechaRegistro: Timestamp.now(),
  });

  // 2. Eliminar la solicitud de la lista de pendientes
  const solicitudRef = doc(db, COLLECTIONS.solicitudesRegistro, solicitud.id);
  await deleteDoc(solicitudRef);
};

/**
 * Rechaza una solicitud de registro
 */
export const rechazarSolicitudJugador = async (solicitudId: string): Promise<void> => {
  const solicitudRef = doc(db, COLLECTIONS.solicitudesRegistro, solicitudId);
  await deleteDoc(solicitudRef);
};

/**
 * Cambia el estado de un jugador oficial a 'inactivo' o 'protegido' (nunca elimina físicamente)
 */
export const cambiarEstadoJugador = async (
  jugadorId: string, 
  nuevoEstado: "activo" | "inactivo" | "protegido"
): Promise<void> => {
  const jugadorRef = doc(db, COLLECTIONS.jugadores, jugadorId);
  await updateDoc(jugadorRef, {
    estado: nuevoEstado,
  });
};