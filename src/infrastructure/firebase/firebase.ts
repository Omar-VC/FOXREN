// src/infrastructure/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyATPsAPFbbbwqRkqawII9uZhLARz6l0hm8",
  authDomain: "frp-santiago-del-estero.firebaseapp.com",
  projectId: "frp-santiago-del-estero",
  storageBucket: "frp-santiago-del-estero.firebasestorage.app",
  messagingSenderId: "586728514339",
  appId: "1:586728514339:web:4ca4e3c80e55d5403e6296"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
