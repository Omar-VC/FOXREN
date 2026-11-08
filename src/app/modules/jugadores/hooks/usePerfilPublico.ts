import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "../../../../infrastructure/firebase/firebase";
import { COLECCION_PERFILES_PUBLICOS } from "../../../../application/ranking/actualizarRankingsCircuito";
import type { PerfilJugadorPublico } from "../../../../domain/jugador/jugador.perfilPublico";

/** Lee en tiempo real el perfil público de un jugador. Solo contiene campos públicos. */
export function usePerfilPublico(idPublico: string | undefined) {
  const [perfil, setPerfil] = useState<PerfilJugadorPublico | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idPublico) {
      setPerfil(null);
      setCargando(false);
      return;
    }

    setCargando(true);
    return onSnapshot(
      doc(db, COLECCION_PERFILES_PUBLICOS, idPublico),
      (snapshot) => {
        setPerfil(snapshot.exists() ? (snapshot.data() as PerfilJugadorPublico) : null);
        setError(null);
        setCargando(false);
      },
      () => {
        setError("No se pudo cargar el perfil.");
        setCargando(false);
      },
    );
  }, [idPublico]);

  return { perfil, cargando, error };
}
