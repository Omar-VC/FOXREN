import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';

export const useTorneos = () => {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const torneosRef = collection(db, 'torneos');
    // Quitamos la restricción estricta de orderBy para asegurar que se muestren todos los documentos
    const q = query(torneosRef);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const lista: any[] = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });

        // Ordenamos del lado del cliente por fecha de creación (si existe) o por ID
        lista.sort((a, b) => {
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
    refetch: () => {} // Se mantiene por compatibilidad, pero ya sincroniza en vivo
  };
};

export default useTorneos;