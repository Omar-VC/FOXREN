import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import type { CuentaUsuario, PerfilUsuario } from "../../domain/usuario/usuario.types";
import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

export const usuariosRepository = {
  async obtenerPerfil(uid: string): Promise<PerfilUsuario | null> {
    const snapshot = await getDoc(doc(db, COLLECTIONS.usuarios, uid));
    return snapshot.exists() ? (snapshot.data() as PerfilUsuario) : null;
  },

  /** Cuentas de acceso de un complejo (solo las puede listar el superadmin). */
  async obtenerPorComplejo(complejoId: string): Promise<CuentaUsuario[]> {
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.usuarios), where("complejoId", "==", complejoId)),
    );
    return snapshot.docs.map((item) => ({
      uid: item.id,
      ...(item.data() as PerfilUsuario),
    }));
  },

  async crearPerfilComplejo(uid: string, complejoId: string, email: string): Promise<void> {
    await setDoc(doc(db, COLLECTIONS.usuarios, uid), {
      rol: "complejo",
      complejoId,
      activo: true,
      email,
      creadoEn: Timestamp.now(),
    });
  },

  async cambiarActivo(uid: string, activo: boolean): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.usuarios, uid), { activo });
  },
};
