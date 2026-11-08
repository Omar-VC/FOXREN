import type { Jugador } from "./jugador.types";
import { consentimientoPermitePublicarApodo } from "./jugador.publicacion.rules.ts";
import { resumirEstadisticas } from "./jugador.estadisticas.ts";
import type {
  EstadisticasPublicas,
  ParticipacionPublica,
} from "./jugador.estadisticas.ts";

/** Lugar del jugador en un ranking. */
export interface PosicionPublica {
  circuitoNombre: string;
  genero: string;
  posicion: number;
  puntos: number;
}

/**
 * Lo único que se publica de un jugador. Sin DNI, fecha de nacimiento, teléfono,
 * email, lado de juego ni IDs internos. La edad se publica como número.
 */
export interface PerfilJugadorPublico {
  idPublico: string;
  nombre: string;
  apellido: string;
  apodo?: string;
  categoria?: string;
  ciudad?: string;
  provincia?: string;
  edad?: number;
  estadisticas: EstadisticasPublicas;
  posiciones: PosicionPublica[];
  participaciones: ParticipacionPublica[];
  actualizadoEn: Date;
}

/**
 * Los jugadores se leen de Firestore sin convertir, así que una fecha puede ser
 * un Date o un Timestamp (con `toDate`).
 */
function aFecha(valor: unknown): Date | undefined {
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? undefined : valor;
  if (valor && typeof (valor as { toDate?: unknown }).toDate === "function") {
    return aFecha((valor as { toDate: () => Date }).toDate());
  }
  return undefined;
}

export function calcularEdad(fechaNacimiento: unknown, hoy: Date = new Date()): number | undefined {
  const nacimiento = aFecha(fechaNacimiento);
  if (!nacimiento) return undefined;

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const meses = hoy.getMonth() - nacimiento.getMonth();
  if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;

  return edad >= 0 && edad < 120 ? edad : undefined;
}

interface DatosPerfil {
  jugador: Jugador;
  idPublico: string;
  participaciones: ParticipacionPublica[];
  posiciones: PosicionPublica[];
  hoy?: Date;
}

/** Arma el perfil público. Quien lo llame debe haber verificado que el jugador es publicable. */
export function construirPerfilPublico({
  jugador,
  idPublico,
  participaciones,
  posiciones,
  hoy = new Date(),
}: DatosPerfil): PerfilJugadorPublico {
  const perfil: PerfilJugadorPublico = {
    idPublico,
    nombre: jugador.nombre.trim(),
    apellido: jugador.apellido.trim(),
    estadisticas: resumirEstadisticas(participaciones),
    posiciones,
    participaciones,
    actualizadoEn: hoy,
  };

  const apodo = jugador.apodo?.trim();
  if (apodo && consentimientoPermitePublicarApodo(jugador.consentimientoPublicacion)) {
    perfil.apodo = apodo;
  }
  const categoria = jugador.categoriaDeclarada?.trim();
  if (categoria) perfil.categoria = categoria;
  const ciudad = jugador.ciudad?.trim();
  if (ciudad) perfil.ciudad = ciudad;
  const provincia = jugador.provincia?.trim();
  if (provincia) perfil.provincia = provincia;
  const edad = calcularEdad(jugador.fechaNacimiento, hoy);
  if (edad !== undefined) perfil.edad = edad;

  return perfil;
}
