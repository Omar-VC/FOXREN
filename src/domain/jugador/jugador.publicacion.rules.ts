import type { SolicitudRegistro } from "../SolicitudRegistro/solicitudRegistro.types";
import type {
  ConsentimientoPublicacion,
  Jugador,
  JugadorPublico,
} from "./jugador.types";

function convertirFecha(valor: unknown): Date | undefined {
  const fecha = valor instanceof Date
    ? valor
    : valor && typeof valor === "object" &&
      typeof (valor as { toDate?: unknown }).toDate === "function"
      ? (valor as { toDate: () => Date }).toDate()
      : undefined;

  return fecha && !Number.isNaN(fecha.getTime()) ? fecha : undefined;
}

/** Las solicitudes históricas o incompletas nunca se convierten en consentimiento. */
export function consentimientoDesdeSolicitud(
  solicitud: SolicitudRegistro,
): ConsentimientoPublicacion {
  const fechaDecision = convertirFecha(solicitud.fechaDecisionPublicacion);
  const decisionExplicita =
    typeof solicitud.autorizaPublicacionPerfil === "boolean" &&
    typeof solicitud.autorizaPublicacionApodo === "boolean" &&
    solicitud.origenDecisionPublicacion === "formulario_publico" &&
    fechaDecision !== undefined;

  if (!decisionExplicita) {
    return {
      autorizaPerfil: false,
      autorizaApodo: false,
      origen: "sin_decision_explicita",
      estado: "sin_decision",
    };
  }

  const autorizaPerfil = solicitud.autorizaPublicacionPerfil === true;
  return {
    autorizaPerfil,
    autorizaApodo: autorizaPerfil && solicitud.autorizaPublicacionApodo === true,
    origen: "formulario_publico",
    estado: autorizaPerfil ? "pendiente_verificacion" : "no_autorizado",
    fechaDecision,
  };
}

/** La proyección solo es elegible tras verificación y mientras no se haya retirado. */
export function consentimientoPermitePublicar(
  consentimiento: ConsentimientoPublicacion | undefined,
): boolean {
  if (!consentimiento) return false;
  const fechaValida = (fecha: Date | undefined) =>
    convertirFecha(fecha) !== undefined;

  return consentimiento.autorizaPerfil === true &&
    consentimiento.estado === "vigente" &&
    consentimiento.origen === "formulario_publico" &&
    fechaValida(consentimiento.fechaDecision) &&
    fechaValida(consentimiento.fechaVerificacion) &&
    consentimiento.fechaRetiro === undefined;
}

export function consentimientoPermitePublicarApodo(
  consentimiento: ConsentimientoPublicacion | undefined,
): boolean {
  return consentimientoPermitePublicar(consentimiento) &&
    consentimiento?.autorizaApodo === true;
}

/** Construye una proyección explícita; no persiste ni acredita la identidad del remitente. */
export function construirJugadorPublico(
  jugador: Jugador,
  consentimiento: ConsentimientoPublicacion | undefined,
  idPublico: string,
): JugadorPublico | null {
  if (!consentimientoPermitePublicar(consentimiento)) return null;
  if (!jugador || typeof jugador.id !== "string" ||
      typeof jugador.nombre !== "string" || typeof jugador.apellido !== "string" ||
      typeof idPublico !== "string") return null;

  const idPublicoNormalizado = idPublico.trim();
  if (!idPublicoNormalizado || idPublicoNormalizado === jugador.id) return null;

  const perfil: JugadorPublico = {
    idPublico: idPublicoNormalizado,
    nombre: jugador.nombre.trim(),
    apellido: jugador.apellido.trim(),
  };

  const apodo = typeof jugador.apodo === "string" ? jugador.apodo.trim() : "";
  if (consentimientoPermitePublicarApodo(consentimiento) && apodo) {
    perfil.apodo = apodo;
  }

  return jugadorPublicoEsValido(perfil) ? perfil : null;
}

/** Valida la lista blanca de la proyección, no una entidad Jugador completa. */
export function jugadorPublicoEsValido(
  jugador: JugadorPublico,
): boolean {
  const camposPermitidos = new Set([
    "idPublico", "nombre", "apellido", "apodo", "categoria",
  ]);
  const claves = Object.keys(jugador);

  return claves.every((clave) => camposPermitidos.has(clave)) &&
    typeof jugador.idPublico === "string" && jugador.idPublico.trim().length > 0 &&
    typeof jugador.nombre === "string" && jugador.nombre.trim().length > 0 &&
    typeof jugador.apellido === "string" && jugador.apellido.trim().length > 0 &&
    (jugador.apodo === undefined || typeof jugador.apodo === "string") &&
    (jugador.categoria === undefined || typeof jugador.categoria === "string");
}
