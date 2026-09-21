import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import type { Torneo } from '../../../domain/torneo/torneo.types';

export const useTorneos = () => {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const torneosRef = collection(db, 'torneos');
    const q = query(torneosRef);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const lista: Torneo[] = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() } as Torneo);
        });

        lista.sort((a: any, b: any) => {
          const fechaA = a.creadoEn?.seconds || a.fechaInicio?.seconds || 0;
          const fechaB = b.creadoEn?.seconds || b.fechaInicio?.seconds || 0;
          return fechaB - fechaA;
        });

        setTorneos(lista);
        setLoading(false);
      },
      (err: any) => {
        console.error('Error al escuchar torneos en tiempo real:', err);
        setError(err.message || 'Error al cargar torneos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    torneos,
    loading,
    error,
    refetch: () => {}
  };
};

export default useTorneos;