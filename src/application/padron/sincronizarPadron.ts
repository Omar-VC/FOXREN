import { collection, getDocs, writeBatch } from "firebase/firestore";
import type { DocumentReference } from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";
import {
  refPadronDni,
  refPadronJugador,
} from "../../infrastructure/repositories/padronRepository";
import {
  calcularCodigoDni,
  construirPadron,
} from "../../domain/jugador/jugador.padron";
import type { DatosPadronJugador } from "../../domain/jugador/jugador.padron";
import type { Jugador } from "../../domain/jugador/jugador.types";

const MAXIMO_POR_LOTE = 400;

type Operacion =
  | { tipo: "set"; ref: DocumentReference; datos: object }
  | { tipo: "delete"; ref: DocumentReference };

function mismoPadron(actual: Record<string, unknown>, esperado: DatosPadronJugador): boolean {
  return (
    actual.nombre === esperado.nombre &&
    actual.apellido === esperado.apellido &&
    actual.categoriaDeclarada === esperado.categoriaDeclarada &&
    actual.sexo === esperado.sexo &&
    actual.estado === esperado.estado
  );
}

/**
 * Deja el padrón de jugadores (lo que ven los complejos) igual a la lista de
 * jugadores: agrega los que faltan, corrige los desactualizados y borra los que
 * ya no existen. Solo escribe lo que cambió. Lo ejecuta el superadmin: lee datos
 * privados de `jugadores`.
 *
 * Las altas, ediciones y bajas normales ya mantienen el padrón al día; esto sirve
 * para cargar los jugadores anteriores y como red de seguridad.
 */
export async function sincronizarPadron(jugadores: Jugador[]): Promise<void> {
  const [padronSnap, indiceSnap] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.padronJugadores)),
    getDocs(collection(db, COLLECTIONS.padronDni)),
  ]);

  const padronActual = new Map(padronSnap.docs.map((d) => [d.id, d.data()]));
  const indiceActual = new Map(
    indiceSnap.docs.map((d) => [d.id, d.data().jugadorId as unknown]),
  );

  const operaciones: Operacion[] = [];
  const idsEsperados = new Set<string>();
  const codigosEsperados = new Set<string>();

  for (const jugador of jugadores) {
    idsEsperados.add(jugador.id);

    const esperado = construirPadron(jugador);
    const actual = padronActual.get(jugador.id);
    if (!actual || !mismoPadron(actual, esperado)) {
      operaciones.push({ tipo: "set", ref: refPadronJugador(jugador.id), datos: esperado });
    }

    if (jugador.dni) {
      const codigo = await calcularCodigoDni(jugador.dni);
      codigosEsperados.add(codigo);
      if (indiceActual.get(codigo) !== jugador.id) {
        operaciones.push({
          tipo: "set",
          ref: refPadronDni(codigo),
          datos: { jugadorId: jugador.id },
        });
      }
    }
  }

  for (const id of padronActual.keys()) {
    if (!idsEsperados.has(id)) operaciones.push({ tipo: "delete", ref: refPadronJugador(id) });
  }
  for (const codigo of indiceActual.keys()) {
    if (!codigosEsperados.has(codigo)) operaciones.push({ tipo: "delete", ref: refPadronDni(codigo) });
  }

  for (let i = 0; i < operaciones.length; i += MAXIMO_POR_LOTE) {
    const lote = writeBatch(db);
    for (const operacion of operaciones.slice(i, i + MAXIMO_POR_LOTE)) {
      if (operacion.tipo === "set") lote.set(operacion.ref, operacion.datos);
      else lote.delete(operacion.ref);
    }
    await lote.commit();
  }
}
