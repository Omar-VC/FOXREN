import { doc, getDoc } from "firebase/firestore";

import type { PerfilUsuario } from "../../domain/usuario/usuario.types";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

export const usuariosRepository = {
  async obtenerPerfil(uid: string): Promise<PerfilUsuario | null> {
    const snapshot = await getDoc(doc(db, COLLECTIONS.usuarios, uid));
    return snapshot.exists() ? (snapshot.data() as PerfilUsuario) : null;
  },
};
