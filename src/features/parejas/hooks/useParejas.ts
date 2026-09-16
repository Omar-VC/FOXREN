import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';

export const useParejas = () => {
  const [parejas, setParejas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParejas = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'parejas'));
      const lista: any[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setParejas(lista);
    } catch (err: any) {
      console.error('Error al obtener parejas:', err);
      setError(err.message || 'Error al cargar parejas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParejas();
  }, []);

  return {
    parejas,
    loading,
    error,
    refetch: fetchParejas
  };
};

export default useParejas;