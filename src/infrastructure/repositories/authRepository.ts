import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

export const authRepository = {
  async iniciarSesion(
    email: string,
    password: string
  ) {
    return signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  },

  async cerrarSesion() {
    await signOut(auth);
  },
};