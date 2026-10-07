import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { COLLECTIONS } from "../firebase/collections";

import type { Categoria } from "../../domain/categoria/categoria.types";

export const categoriasRepository = {
  async obtenerCategorias(): Promise<Categoria[]> {
    const snapshot = await getDocs(
      collection(db, COLLECTIONS.categorias)
    );

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Categoria[];
  },

  async crearCategoria(
    datos: Omit<Categoria, "id">
  ): Promise<string> {
    const docRef = await addDoc(
      collection(db, COLLECTIONS.categorias),
      datos
    );

    return docRef.id;
  },

  async actualizarCategoria(
    id: string,
    datos: Partial<Categoria>
  ): Promise<void> {
    const categoriaRef = doc(
      db,
      COLLECTIONS.categorias,
      id
    );

    await updateDoc(categoriaRef, datos);
  },

  async eliminarCategoria(
    id: string
  ): Promise<void> {
    const categoriaRef = doc(
      db,
      COLLECTIONS.categorias,
      id
    );

    await deleteDoc(categoriaRef);
  },
};