import { getApp, getApps, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";

const NOMBRE_APP = "foxren-secundaria";

/**
 * Conexión aparte a Firebase solo para crear usuarios: así la sesión del
 * superadmin no se reemplaza por la del usuario recién creado.
 */
function obtenerAuthSecundario() {
  const existente = getApps().find((app) => app.name === NOMBRE_APP);
  const app = existente ?? initializeApp(getApp().options, NOMBRE_APP);
  const authSecundario = getAuth(app);

  if (!existente && import.meta.env.VITE_FIREBASE_MODE !== "production") {
    connectAuthEmulator(authSecundario, "http://127.0.0.1:9099", { disableWarnings: true });
  }

  return authSecundario;
}

/** Crea el usuario en Firebase Auth y devuelve su UID. No toca la sesión actual. */
export async function crearUsuarioAuth(email: string, password: string): Promise<string> {
  const authSecundario = obtenerAuthSecundario();
  const credencial = await createUserWithEmailAndPassword(authSecundario, email, password);
  await signOut(authSecundario);
  return credencial.user.uid;
}
