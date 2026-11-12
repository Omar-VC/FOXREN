import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../../infrastructure/firebase/firebase";
import { FOXREN_OWNER_UID } from "../../infrastructure/firebase/adminIdentity";
import { crearUsuarioAuth } from "../../infrastructure/firebase/authSecundario";
import { usuariosRepository } from "../../infrastructure/repositories/usuariosRepository";
import { validarNuevoAcceso } from "../../domain/usuario/usuario.acceso";

/** Traduce los errores de Firebase Auth a un mensaje que se entienda. */
function mensajeDeAuth(causa: unknown): string {
  const codigo = (causa as { code?: string })?.code;
  if (codigo === "auth/email-already-in-use") {
    return "Ese email ya tiene una cuenta. Usá otro, o borrá la cuenta de prueba en Firebase Authentication.";
  }
  if (codigo === "auth/invalid-email") return "El email no es válido.";
  if (codigo === "auth/weak-password") return "La contraseña es demasiado débil.";
  if (codigo === "auth/too-many-requests") return "Demasiados intentos. Probá de nuevo en unos minutos.";
  return causa instanceof Error ? causa.message : "No se pudo completar la operación.";
}

/** Solo el superadmin: crea el usuario en Auth y su documento de acceso al complejo. */
export async function crearAccesoComplejo(
  complejoId: string,
  email: string,
  password: string,
): Promise<void> {
  if (auth.currentUser?.uid !== FOXREN_OWNER_UID) {
    throw new Error("Solo el administrador de FOXREN puede crear accesos.");
  }

  const error = validarNuevoAcceso(email, password);
  if (error) throw new Error(error);

  const correo = email.trim().toLowerCase();
  let uid: string;
  try {
    uid = await crearUsuarioAuth(correo, password);
  } catch (causa) {
    throw new Error(mensajeDeAuth(causa));
  }

  try {
    await usuariosRepository.crearPerfilComplejo(uid, complejoId, correo);
  } catch {
    throw new Error(
      `Se creó el usuario ${correo} pero no se pudo asociar al complejo. Borralo en Firebase Authentication y reintentá.`,
    );
  }
}

/** Manda el mail para que la persona elija su propia contraseña. */
export async function enviarMailCambioPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (causa) {
    throw new Error(mensajeDeAuth(causa));
  }
}
