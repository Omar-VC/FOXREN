// src/infrastructure/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const modoFirebase = import.meta.env.VITE_FIREBASE_MODE === "production"
  ? "production"
  : "emulator";
const projectId = modoFirebase === "emulator"
  ? "demo-foxren"
  : import.meta.env.VITE_FIREBASE_PROJECT_ID;

if (modoFirebase === "production" && !projectId) {
  throw new Error("VITE_FIREBASE_PROJECT_ID es obligatorio en modo producción.");
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

if (modoFirebase === "emulator") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

