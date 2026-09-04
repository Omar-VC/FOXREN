import type { Jugador } from "../../domain/jugador/jugador.types";

// Convierte Jugador → Firestore
export const toFirestoreJugador = (jugador: Jugador) => {
  return {
    id: jugador.id,
    nombre: jugador.nombre,
    apellido: jugador.apellido,
    apodo: jugador.apodo ?? null,
    dni: jugador.dni,
    ciudad: jugador.ciudad,
    sexo: jugador.sexo,
    nivelInicial: jugador.nivelInicial,
    ladoJuego: jugador.ladoJuego,
    categoriaId: jugador.categoriaId,
    estado: jugador.estado ?? "activo",
    categoriaDeclarada: jugador.categoriaDeclarada ?? "", // 👈 agregado
  };
};

// Convierte Firestore → Jugador
export const fromFirestoreJugador = (doc: any): Jugador => {
  return {
    id: doc.id,
    nombre: doc.nombre,
    apellido: doc.apellido,
    apodo: doc.apodo ?? undefined,
    dni: doc.dni,
    ciudad: doc.ciudad,
    sexo: doc.sexo,
    nivelInicial: doc.nivelInicial,
    ladoJuego: doc.ladoJuego,
    categoriaId: doc.categoriaId,
    estado: doc.estado ?? "activo",
    categoriaDeclarada: doc.categoriaDeclarada ?? "", // 👈 corregido
  };
};

