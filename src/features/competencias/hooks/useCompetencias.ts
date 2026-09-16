import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';

export const useCompetencias = () => {
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetencias = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'competencias'));
      const lista: any[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setCompetencias(lista);
    } catch (err: any) {
      console.error('Error al obtener competencias:', err);
      setError(err.message || 'Error al cargar competencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetencias();
  }, []);

  return {
    competencias,
    loading,
    error,
    refetch: fetchCompetencias
  };
};

export default useCompetencias;