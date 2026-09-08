// src/features/admin/services/llaveService.ts

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { COLLECTIONS } from '../../../infrastructure/firebase/collections';

export const validarLlaveOrganizador = async (codigoLlave: string): Promise<{ valida: boolean; mensaje?: string; idLlave?: string }> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.llavesOrganizadores), // <- Corregido
      where("codigo", "==", codigoLlave.trim().toUpperCase())
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { valida: false, mensaje: "La llave ingresada no existe." };
    }

    const docData = snapshot.docs[0].data();
    const idLlave = snapshot.docs[0].id;

    if (docData.estado !== "activa") {
      return { valida: false, mensaje: "La llave ingresada se encuentra inactiva o revocada." };
    }

    return { valida: true, idLlave };
  } catch (error) {
    console.error("Error al validar la llave:", error);
    return { valida: false, mensaje: "Error al verificar la llave en el servidor." };
  }
};