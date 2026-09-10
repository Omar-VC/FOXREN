// src/infrastructure/repositories/parejasRepository.ts

import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

export interface JugadorInscripcion {
  dni: string;
  nombre: string;
}

export interface InscripcionParejaInput {
  competenciaId: string;
  jugador1: JugadorInscripcion;
  jugador2: JugadorInscripcion;
  fechaInscripcion: Date;
  estadoPago: string;
}

export const parejasRepository = {
  /**
   * Verifica si un DNI ya se encuentra registrado en una competencia dada
   */
  async dniEstaRegistradoEnCompetencia(competenciaId: string, dni: string): Promise<boolean> {
    const dniLimpio = dni.trim();
    const q = query(
      collection(db, COLLECTIONS.inscripciones || "inscripciones"),
      where("competenciaId", "==", competenciaId)
    );
    const snap = await getDocs(q);

    // Iterar inscripciones para verificar duplicados en DNI de jugador1 o jugador2
    return snap.docs.some((doc) => {
      const data = doc.data();
      const dniJ1 = data.jugador1?.dni || "";
      const dniJ2 = data.jugador2?.dni || "";
      return dniJ1 === dniLimpio || dniJ2 === dniLimpio;
    });
  },

  /**
   * Inscribe una pareja validando la no duplicidad de DNI en la competencia
   */
  async inscribirPareja(datos: InscripcionParejaInput): Promise<string> {
    const { competenciaId, jugador1, jugador2 } = datos;

    // Verificar DNI Jugador 1
    const j1Existe = await this.dniEstaRegistradoEnCompetencia(competenciaId, jugador1.dni);
    if (j1Existe) {
      throw new Error(`El jugador con DNI ${jugador1.dni} ya está inscripto en esta competencia.`);
    }

    // Verificar DNI Jugador 2
    const j2Existe = await this.dniEstaRegistradoEnCompetencia(competenciaId, jugador2.dni);
    if (j2Existe) {
      throw new Error(`El jugador con DNI ${jugador2.dni} ya está inscripto en esta competencia.`);
    }

    // Persistir la inscripción en Firestore
    const docRef = await addDoc(collection(db, COLLECTIONS.inscripciones || "inscripciones"), {
      ...datos,
      fechaInscripcion: Timestamp.fromDate(datos.fechaInscripcion),
    });

    return docRef.id;
  },
};