import { useEffect, useState } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";

import { db } from "../../../../infrastructure/firebase/firebase";
import { COLECCION_RANKINGS_PUBLICOS } from "../../../../application/ranking/actualizarRankingsCircuito";
import type { RankingPublico } from "../../../../domain/ranking/ranking.circuito";

export interface RankingPublicoConId extends RankingPublico {
  id: string;
}

/** Lee en tiempo real los rankings públicos. Solo contienen campos públicos. */
export function useRankingsPublicos() {
  const [rankings, setRankings] = useState<RankingPublicoConId[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(
      collection(db, COLECCION_RANKINGS_PUBLICOS),
      (snapshot) => {
        setRankings(
          snapshot.docs.map((documento) => {
            const datos = documento.data();
            const actualizado = datos.actualizadoEn;
            return {
              ...datos,
              id: documento.id,
              circuitoNombre: datos.circuitoNombre ?? datos.circuitoId,
              actualizadoEn:
                actualizado instanceof Timestamp ? actualizado.toDate() : new Date(),
              filas: datos.filas ?? [],
            } as RankingPublicoConId;
          }),
        );
        setError(null);
        setCargando(false);
      },
      () => {
        setError("No se pudo cargar el ranking.");
        setCargando(false);
      },
    );
  }, []);

  return { rankings, cargando, error };
}
