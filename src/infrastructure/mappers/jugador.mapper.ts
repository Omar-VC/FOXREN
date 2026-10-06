// src/infrastructure/mappers/jugador.mapper.ts

import type { Jugador } from "../../domain/jugador/jugador.types";

// Convierte Jugador → Firestore
export const toFirestoreJugador = (jugador: Jugador) => {
  return {
    id: jugador.id,
    nombre: jugador.nombre,
    apellido: jugador.apellido,
    apodo: jugador.apodo ?? null,
    dni: jugador.dni,
    sexo: jugador.sexo,
    ciudad: jugador.ciudad,
    provincia: jugador.provincia,
    fechaNacimiento: jugador.fechaNacimiento ?? null,
    ladoJuego: jugador.ladoJuego,
    categoriaDeclarada: jugador.categoriaDeclarada,
    categoriaId: jugador.categoriaId ?? null,
    estado: jugador.estado,
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
    sexo: doc.sexo,
    ciudad: doc.ciudad,
    provincia: doc.provincia,
    fechaNacimiento: doc.fechaNacimiento?.toDate
      ? doc.fechaNacimiento.toDate()
      : doc.fechaNacimiento
        ? new Date(doc.fechaNacimiento)
        : undefined,
    ladoJuego: doc.ladoJuego,
    categoriaDeclarada: doc.categoriaDeclarada ?? "",
    categoriaId: doc.categoriaId ?? undefined,
    estado: doc.estado ?? "pendiente",
    fechaRegistro: doc.fechaRegistro?.toDate
      ? doc.fechaRegistro.toDate()
      : doc.fechaRegistro
        ? new Date(doc.fechaRegistro)
        : new Date(),
  };
};

