import { useEffect, useState } from "react";
import { db } from "../../../infrastructure/firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import type { Jugador, EstadoJugador } from "../../../domain/jugador/jugador.types";

export const useJugadores = (estado?: EstadoJugador) => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jugadores"), (snapshot) => {
      let data: Jugador[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Jugador, "id">),
      }));

      if (estado) {
        data = data.filter((j) => j.estado === estado);
      }

      setJugadores(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [estado]);

  return { jugadores, loading };
};
