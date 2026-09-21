import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import type { Pareja } from '../../../domain/pareja/pareja.types';

export const useParejas = () => {
  const [parejas, setParejas] = useState<Pareja[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const parejasRef = collection(db, 'parejas');
    const q = query(parejasRef);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const lista: Pareja[] = [];
        querySnapshot.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() } as Pareja);
        });
        setParejas(lista);
        setLoading(false);
      },
      (err: any) => {
        console.error('Error al escuchar parejas:', err);
        setError(err.message || 'Error al cargar parejas');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const cambiarEstadoPago = async (parejaId: string, nuevoEstado: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE') => {
    try {
      const parejaRef = doc(db, 'parejas', parejaId);
      await updateDoc(parejaRef, {
        estadoPago: nuevoEstado,
        actualizadoEn: new Date()
      });
    } catch (err: any) {
      console.error('Error al actualizar estado de pago:', err);
      throw err;
    }
  };

  const eliminarPareja = async (parejaId: string) => {
    try {
      const parejaRef = doc(db, 'parejas', parejaId);
      await deleteDoc(parejaRef);
    } catch (err: any) {
      console.error('Error al eliminar pareja:', err);
      throw err;
    }
  };

  return {
    parejas,
    loading,
    error,
    cambiarEstadoPago,
    eliminarPareja,
    refetch: () => {}
  };
};

export default useParejas;