// src/infrastructure/mappers/jugador.mapper.ts

import type {
  ConsentimientoPublicacion,
  Jugador,
} from "../../domain/jugador/jugador.types";

function convertirFecha(valor: unknown): Date | undefined {
  const fecha = valor instanceof Date
    ? valor
    : valor && typeof valor === "object" &&
      typeof (valor as { toDate?: unknown }).toDate === "function"
      ? (valor as { toDate: () => Date }).toDate()
      : valor === null || valor === undefined
        ? undefined
        : new Date(valor as string | number);
  return fecha && !Number.isNaN(fecha.getTime()) ? fecha : undefined;
}

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
    ...(jugador.consentimientoPublicacion
      ? { consentimientoPublicacion: jugador.consentimientoPublicacion }
      : {}),
  };
};

// Convierte Firestore → Jugador
export const fromFirestoreJugador = (doc: {
  id: string;
  data: () => Record<string, unknown>;
}): Jugador => {
  const data = doc.data();
  const consentimiento = data.consentimientoPublicacion &&
    typeof data.consentimientoPublicacion === "object"
    ? data.consentimientoPublicacion as Record<string, unknown>
    : undefined;
  const consentimientoValido = consentimiento &&
    typeof consentimiento.autorizaPerfil === "boolean" &&
    typeof consentimiento.autorizaApodo === "boolean" &&
    (consentimiento.origen === "formulario_publico" ||
      consentimiento.origen === "sin_decision_explicita") &&
    [
      "pendiente_verificacion", "vigente", "no_autorizado",
      "sin_decision", "revocado",
    ].includes(String(consentimiento.estado));

  return {
    id: doc.id,
    nombre: String(data.nombre ?? ""),
    apellido: String(data.apellido ?? ""),
    apodo: typeof data.apodo === "string" ? data.apodo : undefined,
    dni: String(data.dni ?? ""),
    sexo: data.sexo as Jugador["sexo"],
    ciudad: String(data.ciudad ?? ""),
    provincia: String(data.provincia ?? ""),
    fechaNacimiento: convertirFecha(data.fechaNacimiento),
    ladoJuego: data.ladoJuego as Jugador["ladoJuego"],
    categoriaDeclarada: String(data.categoriaDeclarada ?? ""),
    categoriaId: typeof data.categoriaId === "string" ? data.categoriaId : undefined,
    estado: data.estado as Jugador["estado"] ?? "inactivo",
    fechaRegistro: convertirFecha(data.fechaRegistro) ?? new Date(0),
    ...(consentimientoValido && consentimiento
      ? {
          consentimientoPublicacion: {
            ...consentimiento,
            fechaDecision: convertirFecha(consentimiento.fechaDecision),
            fechaVerificacion: convertirFecha(consentimiento.fechaVerificacion),
            fechaRetiro: convertirFecha(consentimiento.fechaRetiro),
          } as ConsentimientoPublicacion,
        }
      : {}),
  };
};

