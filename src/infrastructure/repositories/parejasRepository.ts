import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { Pareja } from "../../domain/pareja/pareja.types";

export const parejasRepository = {
  async obtenerPorId(id: string): Promise<Pareja | null> {
    const parejaRef = doc(db, COLLECTIONS.parejas, id);

    const snapshot = await getDoc(parejaRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Pareja;
  },
};