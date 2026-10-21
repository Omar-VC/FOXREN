import {
  collection,
  doc,
  getDocs,
  query,
  where,
  type Transaction,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";
import type { Zona } from "../../domain/competencia/competencia.zonas.types";
import { generarPartidosDeZonas } from "../../domain/competencia/competencia.zonas.partidos";

export const zonasRepository = {
  async obtenerPorCompetenciaId(competenciaId: string): Promise<Zona[]> {
    const q = query(
      collection(db, COLLECTIONS.zonas),
      where("competenciaId", "==", competenciaId),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Zona[];
  },

  async existenPorCompetenciaId(competenciaId: string): Promise<boolean> {
    const zonas = await this.obtenerPorCompetenciaId(competenciaId);
    return zonas.length > 0;
  },

  async crearZonasYPartidos(
    zonas: Zona[],
    transaction: Transaction,
  ): Promise<void> {
    const zonaRefs = zonas.map(() =>
      doc(collection(db, COLLECTIONS.zonas)),
    );

    const zonasConIds = zonas.map((zona, indice) => ({
      ...zona,
      id: zonaRefs[indice].id,
    }));

    const partidos = generarPartidosDeZonas(zonasConIds);

    if (zonaRefs.length + partidos.length > 499) {
      throw new Error(
        "La competencia genera demasiadas zonas y partidos para una transacción de Firestore.",
      );
    }

    zonasConIds.forEach((zona, indice) => {
      const datos = {
        competenciaId: zona.competenciaId,
        nombre: zona.nombre,
        parejaIds: zona.parejaIds,
        orden: zona.orden,
      };
      transaction.set(zonaRefs[indice], datos);
    });

    for (const partido of partidos) {
      const partidoRef = doc(collection(db, COLLECTIONS.partidos));
      transaction.set(partidoRef, partido);
    }
  },
};
