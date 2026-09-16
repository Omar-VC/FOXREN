import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';

export const useTorneos = () => {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTorneos = async () => {
    setLoading(true);
    setError(null);
    try {
      const torneosRef = collection(db, 'torneos');
      const q = query(torneosRef, orderBy('creadoEn', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const lista: any[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });

      setTorneos(lista);
    } catch (err: any) {
      console.error('Error al obtener torneos:', err);
      setError(err.message || 'Error al cargar torneos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTorneos();
  }, []);

  return {
    torneos,
    loading,
    error,
    refetch: fetchTorneos
  };
};

export default useTorneos;