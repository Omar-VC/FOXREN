import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";
import { FOXREN_OWNER_UID } from "../firebase/adminIdentity";

import { COLLECTIONS } from "../firebase/collections";

import type {
  ConsentimientoPublicacion,
  Jugador,
} from "../../domain/jugador/jugador.types";

import type { SolicitudRegistro } from "../../domain/SolicitudRegistro/solicitudRegistro.types";
import {
  consentimientoDesdeSolicitud,
  consentimientoPermitePublicar,
} from "../../domain/jugador/jugador.publicacion.rules";

function obtenerUidAdministrador(): string {
  const uid = auth.currentUser?.uid;
  if (uid !== FOXREN_OWNER_UID) {
    throw new Error("La operación requiere la identidad del propietario de FOXREN.");
  }
  return uid;
}

function validarMetodoVerificacion(metodo: string): string {
  const normalizado = metodo.trim();
  if (normalizado.length < 3 || normalizado.length > 120) {
    throw new Error("Describí el medio externo de verificación (3 a 120 caracteres).");
  }
  return normalizado;
}

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

  async obtenerPorIds(ids: string[]): Promise<Jugador[]> {
    const unicos = [...new Set(ids)].filter(Boolean);
    const bloques: string[][] = [];
    for (let indice = 0; indice < unicos.length; indice += 30) {
      bloques.push(unicos.slice(indice, indice + 30));
    }

    const snapshots = await Promise.all(
      bloques.map((bloque) =>
        getDocs(
          query(
            collection(db, COLLECTIONS.jugadores),
            where(documentId(), "in", bloque),
          ),
        ),
      ),
    );

    return snapshots.flatMap((snapshot) =>
      snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }) as Jugador),
    );
  },

  async crearJugador(datos: Omit<Jugador, "id">): Promise<string> {
    if (datos.consentimientoPublicacion?.estado === "vigente" ||
        datos.consentimientoPublicacion?.estado === "revocado") {
      throw new Error("El consentimiento debe gestionarse con las acciones de verificación o retiro.");
    }
    const docRef = await addDoc(collection(db, COLLECTIONS.jugadores), datos);

    return docRef.id;
  },

  async aprobarDesdeSolicitud(solicitudId: string): Promise<string> {
    if (!solicitudId.trim()) {
      throw new Error("El identificador de la solicitud no es válido.");
    }

    const solicitudRef = doc(
      db,
      COLLECTIONS.solicitudesRegistro,
      solicitudId,
    );
    const jugadorId = `solicitud_${solicitudId}`;
    const jugadorRef = doc(db, COLLECTIONS.jugadores, jugadorId);

    return runTransaction(db, async (transaction) => {
      const solicitudSnapshot = await transaction.get(solicitudRef);
      if (!solicitudSnapshot.exists()) {
        throw new Error("No se encontró la solicitud.");
      }

      const solicitud = {
        id: solicitudSnapshot.id,
        ...solicitudSnapshot.data(),
      } as SolicitudRegistro;

      const jugadorSnapshot = await transaction.get(jugadorRef);

      if (solicitud.estado === "aprobada") {
        if (typeof solicitud.jugadorId !== "string" || !solicitud.jugadorId) {
          throw new Error(
            "La solicitud ya figura aprobada, pero no tiene un jugador vinculado. Requiere revisión manual.",
          );
        }
        if (!jugadorSnapshot.exists() || solicitud.jugadorId !== jugadorId) {
          throw new Error(
            "La solicitud aprobada y su jugador vinculado son inconsistentes.",
          );
        }
        return jugadorId;
      }

      if (solicitud.estado !== "pendiente") {
        throw new Error("Solo se pueden aprobar solicitudes pendientes.");
      }

      if (jugadorSnapshot.exists()) {
        throw new Error(
          "Ya existe un jugador con el identificador de esta solicitud. Requiere revisión manual.",
        );
      }

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
        consentimientoPublicacion: consentimientoDesdeSolicitud(solicitud),
      };

      transaction.set(jugadorRef, jugador);
      transaction.update(solicitudRef, {
        estado: "aprobada",
        fechaResolucion: new Date(),
        jugadorId,
      });

      return jugadorId;
    });
  },

  async actualizarJugador(id: string, datos: Partial<Jugador>): Promise<void> {
    if (Object.prototype.hasOwnProperty.call(datos, "consentimientoPublicacion")) {
      throw new Error("El consentimiento se modifica únicamente mediante su flujo administrativo.");
    }
    const jugadorRef = doc(db, COLLECTIONS.jugadores, id);

    await updateDoc(jugadorRef, datos);
  },

  async verificarConsentimientoPublicacion(
    jugadorId: string,
    metodoVerificacion: string,
  ): Promise<void> {
    const uidAdministrador = obtenerUidAdministrador();
    const metodo = validarMetodoVerificacion(metodoVerificacion);
    const jugadorRef = doc(db, COLLECTIONS.jugadores, jugadorId);

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(jugadorRef);
      if (!snapshot.exists()) throw new Error("No se encontró el jugador.");

      const consentimiento = snapshot.data().consentimientoPublicacion as
        | ConsentimientoPublicacion
        | undefined;
      if (consentimiento?.estado === "vigente") return;
      if (
        consentimiento?.autorizaPerfil !== true ||
        consentimiento.estado !== "pendiente_verificacion" ||
        consentimiento.fechaRetiro !== undefined
      ) {
        throw new Error("El consentimiento no es elegible para verificación.");
      }

      const consentimientoActualizado: ConsentimientoPublicacion = {
        ...consentimiento,
        estado: "vigente",
        fechaVerificacion: new Date(),
        metodoVerificacion: metodo,
        verificadoPorUid: uidAdministrador,
      };
      if (!consentimientoPermitePublicar(consentimientoActualizado)) {
        throw new Error("La decisión original no cumple las condiciones de publicación.");
      }

      transaction.update(jugadorRef, {
        consentimientoPublicacion: consentimientoActualizado,
      });
    });
  },

  async revocarConsentimientoPublicacion(
    jugadorId: string,
    metodoRetiro: string,
  ): Promise<void> {
    const uidAdministrador = obtenerUidAdministrador();
    const metodo = validarMetodoVerificacion(metodoRetiro);
    const jugadorRef = doc(db, COLLECTIONS.jugadores, jugadorId);

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(jugadorRef);
      if (!snapshot.exists()) throw new Error("No se encontró el jugador.");

      const consentimiento = snapshot.data().consentimientoPublicacion as
        | ConsentimientoPublicacion
        | undefined;
      if (consentimiento?.estado === "revocado") return;
      if (consentimiento?.autorizaPerfil !== true) {
        throw new Error("No hay una autorización afirmativa que pueda revocarse.");
      }

      transaction.update(jugadorRef, {
        consentimientoPublicacion: {
          ...consentimiento,
          estado: "revocado",
          fechaRetiro: new Date(),
          metodoRetiro: metodo,
          revocadoPorUid: uidAdministrador,
        } satisfies ConsentimientoPublicacion,
      });
    });
  },

  async eliminarJugador(id: string): Promise<void> {
    const jugadorRef = doc(db, COLLECTIONS.jugadores, id);

    await deleteDoc(jugadorRef);
  },
};
