import { useState } from 'react';
import { db } from '../../../infrastructure/firebase/firebase'; // Ajustá la ruta según la ubicación de tu config de Firebase
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export interface JugadorData {
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string;
  existe: boolean | null;
}

export const useInscripcionPareja = (competencia: any, onSuccess: () => void) => {
  const [j1, setJ1] = useState<JugadorData>({
    dni: '',
    nombre: '',
    apellido: '',
    telefono: '',
    existe: null,
  });

  const [j2, setJ2] = useState<JugadorData>({
    dni: '',
    nombre: '',
    apellido: '',
    telefono: '',
    existe: null,
  });

  const [comprobantePago, setComprobantePago] = useState('');
  const [aliasCopiado, setAliasCopiado] = useState(false);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [loadingGuardado, setLoadingGuardado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fallbacks para datos de la competencia
  const precioCalculado = competencia?.precioInscripcion || competencia?.precio || 0;
  const aliasPago = competencia?.aliasPago || competencia?.alias || 'FOXREN.PADEL.MP';

  const copiarAlias = () => {
    if (!aliasPago) return;
    navigator.clipboard.writeText(aliasPago);
    setAliasCopiado(true);
    setTimeout(() => setAliasCopiado(false), 2000);
  };

  const buscarJugadores = async (): Promise<boolean> => {
    if (!j1.dni.trim() || !j2.dni.trim()) {
      setErrorMsg('Ingresá el DNI de ambos jugadores.');
      return false;
    }

    if (j1.dni.trim() === j2.dni.trim()) {
      setErrorMsg('Los DNI de ambos jugadores no pueden ser iguales.');
      return false;
    }

    setErrorMsg(null);
    setLoadingBusqueda(true);

    try {
      // Buscar Jugador 1 en padrón
      const q1 = query(collection(db, 'jugadores'), where('dni', '==', j1.dni.trim()));
      const snap1 = await getDocs(q1);

      let updatedJ1: JugadorData = { ...j1, existe: false };
      if (!snap1.empty) {
        const data1 = snap1.docs[0].data();
        updatedJ1 = {
          ...j1,
          nombre: data1.nombre || '',
          apellido: data1.apellido || '',
          telefono: data1.telefono || j1.telefono,
          existe: true,
        };
      }

      // Buscar Jugador 2 en padrón
      const q2 = query(collection(db, 'jugadores'), where('dni', '==', j2.dni.trim()));
      const snap2 = await getDocs(q2);

      let updatedJ2: JugadorData = { ...j2, existe: false };
      if (!snap2.empty) {
        const data2 = snap2.docs[0].data();
        updatedJ2 = {
          ...j2,
          nombre: data2.nombre || '',
          apellido: data2.apellido || '',
          telefono: data2.telefono || j2.telefono,
          existe: true,
        };
      }

      setJ1(updatedJ1);
      setJ2(updatedJ2);
      return true;
    } catch (err: any) {
      console.error('Error al verificar DNI:', err);
      setErrorMsg('Ocurrió un error al consultar la base de datos. Intentalo de nuevo.');
      return false;
    } finally {
      setLoadingBusqueda(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, restriccionHoraria: string) => {
    e.preventDefault();

    if (!comprobantePago.trim()) {
      setErrorMsg('Ingresá el número de comprobante o referencia del pago.');
      return;
    }

    setErrorMsg(null);
    setLoadingGuardado(true);

    try {
      const payload = {
        competenciaId: competencia?.id || '',
        categoria: competencia?.categoria || competencia?.nombre || '',
        jugador1: {
          dni: j1.dni.trim(),
          nombre: j1.nombre.trim(),
          apellido: j1.apellido.trim(),
          telefono: j1.telefono.trim(),
        },
        jugador2: {
          dni: j2.dni.trim(),
          nombre: j2.nombre.trim(),
          apellido: j2.apellido.trim(),
          telefono: j2.telefono.trim(),
        },
        restriccionHoraria: restriccionHoraria.trim(),
        comprobantePago: comprobantePago.trim(),
        montoTotal: precioCalculado,
        estadoPago: 'pendiente', // 'pendiente' | 'aprobado' | 'rechazado'
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'inscripciones'), payload);

      onSuccess();
    } catch (err: any) {
      console.error('Error guardando inscripción:', err);
      setErrorMsg('No se pudo completar la inscripción. Verificá tu conexión.');
    } finally {
      setLoadingGuardado(false);
    }
  };

  return {
    j1,
    setJ1,
    j2,
    setJ2,
    comprobantePago,
    setComprobantePago,
    precioCalculado,
    aliasPago,
    aliasCopiado,
    loadingBusqueda,
    loadingGuardado,
    errorMsg,
    setErrorMsg,
    copiarAlias,
    buscarJugadores,
    handleSubmit,
  };
};