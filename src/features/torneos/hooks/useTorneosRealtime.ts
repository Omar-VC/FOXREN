import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../infrastructure/firebase/firebase";

export const useTorneosRealtime = () => {
  const [torneos, setTorneos] = useState<any[]>([]);
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [circuitos, setCircuitos] = useState<any[]>([]);
  const [parejas, setParejas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTorneos = onSnapshot(collection(db, "torneos"), (snap) => {
      const lista: any[] = [];
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setTorneos(lista);
      setLoading(false);
    });

    const unsubCompetencias = onSnapshot(collection(db, "competencias"), (snap) => {
      const lista: any[] = [];
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setCompetencias(lista);
    });

    const unsubCircuitos = onSnapshot(collection(db, "circuitos"), (snap) => {
      const lista: any[] = [];
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setCircuitos(lista);
    });

    const unsubParejas = onSnapshot(collection(db, "parejas"), (snap) => {
      const lista: any[] = [];
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setParejas(lista);
    });

    return () => {
      unsubTorneos();
      unsubCompetencias();
      unsubCircuitos();
      unsubParejas();
    };
  }, []);

  return { torneos, competencias, circuitos, parejas, loading };
};