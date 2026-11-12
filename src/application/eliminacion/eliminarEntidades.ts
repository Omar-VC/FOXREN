import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import type { DocumentReference } from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";

// Firestore admite hasta 500 operaciones por lote; se deja margen.
const TAMANO_LOTE = 400;

async function borrarRefs(refs: DocumentReference[]): Promise<void> {
  for (let inicio = 0; inicio < refs.length; inicio += TAMANO_LOTE) {
    const lote = writeBatch(db);
    refs.slice(inicio, inicio + TAMANO_LOTE).forEach((ref) => lote.delete(ref));
    await lote.commit();
  }
}

async function refsPorCampo(
  coleccion: string,
  campo: string,
  valor: string,
): Promise<DocumentReference[]> {
  const snapshot = await getDocs(
    query(collection(db, coleccion), where(campo, "==", valor)),
  );
  return snapshot.docs.map((item) => item.ref);
}

/**
 * Borra una competencia y todo lo que cuelga de ella. La competencia se borra al
 * final: si se corta a la mitad, sigue existiendo y se puede reintentar.
 * Solo la puede ejecutar el superadmin (las reglas lo exigen).
 */
export async function eliminarCompetenciaCompleta(
  competenciaId: string,
): Promise<void> {
  const partidos = await refsPorCampo(
    COLLECTIONS.partidos,
    "competenciaId",
    competenciaId,
  );
  // El resultado de cada partido usa el mismo ID que el partido.
  const resultados = partidos.map((partido) =>
    doc(db, COLLECTIONS.resultados, partido.id),
  );

  const otras = await Promise.all([
    refsPorCampo(COLLECTIONS.parejas, "competenciaId", competenciaId),
    refsPorCampo("zonas", "competenciaId", competenciaId),
    refsPorCampo(COLLECTIONS.reservasCompetencia, "competenciaId", competenciaId),
    refsPorCampo("historial", "competenciaId", competenciaId),
    refsPorCampo("inscripciones", "competenciaId", competenciaId),
  ]);

  await borrarRefs([...resultados, ...partidos, ...otras.flat()]);
  await borrarRefs([doc(db, COLLECTIONS.competencias, competenciaId)]);
}

/** Borra un torneo con todas sus competencias. */
export async function eliminarTorneoCompleto(torneoId: string): Promise<void> {
  const competencias = await refsPorCampo(
    COLLECTIONS.competencias,
    "torneoId",
    torneoId,
  );

  for (const competencia of competencias) {
    await eliminarCompetenciaCompleta(competencia.id);
  }

  await borrarRefs([doc(db, COLLECTIONS.torneos, torneoId)]);
}

/**
 * Borra un complejo solo si no deja nada colgando: sin torneos ni cuentas de
 * acceso. Sus organizadores (fichas de contacto) se borran con él.
 */
export async function eliminarComplejoSeguro(complejoId: string): Promise<void> {
  const [torneos, cuentas, organizadores] = await Promise.all([
    refsPorCampo(COLLECTIONS.torneos, "complejoId", complejoId),
    refsPorCampo("usuarios", "complejoId", complejoId),
    refsPorCampo(COLLECTIONS.organizadores, "complejoId", complejoId),
  ]);

  if (torneos.length > 0) {
    throw new Error(
      `No se puede eliminar: el complejo tiene ${torneos.length} torneo(s). Eliminá o reasigná esos torneos primero.`,
    );
  }
  if (cuentas.length > 0) {
    throw new Error(
      `No se puede eliminar: el complejo tiene ${cuentas.length} cuenta(s) de acceso. Desactivá o eliminá esas cuentas primero.`,
    );
  }

  await borrarRefs([...organizadores, doc(db, COLLECTIONS.complejos, complejoId)]);
}
