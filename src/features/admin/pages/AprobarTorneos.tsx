// src/features/admin/pages/AprobarTorneos.tsx

import React, { useEffect, useState } from 'react';
import { db } from '../../../infrastructure/firebase/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { COLLECTIONS } from '../../../infrastructure/firebase/collections';
import type { Torneo } from '../../../domain/torneo/torneo.types';

export const AprobarTorneos: React.FC = () => {
  const [torneosPendientes, setTorneosPendientes] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPendientes();
  }, []);

  const cargarPendientes = async () => {
    try {
      const q = query(
        collection(db, COLLECTIONS.torneos),
        where("estado", "==", "PENDIENTE_APROBACION")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Torneo[];
      setTorneosPendientes(list);
    } catch (err) {
      console.error("Error al cargar torneos pendientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (torneoId: string) => {
    if (confirm("¿Confirmas que recibiste el pago/canon y deseas oficializar este torneo?")) {
      try {
        await updateDoc(doc(db, COLLECTIONS.torneos, torneoId), {
          estado: 'INSCRIPCION_ABIERTA'
        });
        alert("Torneo aprobado y publicado en el calendario oficial.");
        cargarPendientes();
      } catch (err) {
        console.error(err);
        alert("Error al aprobar el torneo.");
      }
    }
  };

  const handleRechazar = async (torneoId: string) => {
    if (confirm("¿Deseas rechazar este torneo?")) {
      try {
        await updateDoc(doc(db, COLLECTIONS.torneos, torneoId), {
          estado: 'RECHAZADO'
        });
        alert("Torneo rechazado.");
        cargarPendientes();
      } catch (err) {
        console.error(err);
        alert("Error al rechazar el torneo.");
      }
    }
  };

  if (loading) return <p className="text-gray-400">Cargando solicitudes de torneos...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary-light)]">Aprobación y Canon de Torneos</h1>

      {torneosPendientes.length === 0 ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-[var(--border-radius)] p-8 text-center text-gray-400">
          No hay solicitudes de torneos pendientes de aprobación.
        </div>
      ) : (
        <ul className="space-y-4">
          {torneosPendientes.map((t) => (
            <li
              key={t.id}
              className="bg-gray-900/80 p-5 border border-gray-800 rounded-[var(--border-radius)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <span className="text-xs px-2.5 py-0.5 bg-yellow-900/60 text-yellow-300 border border-yellow-700/50 rounded uppercase font-semibold">
                  Pendiente de Aprobación
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{t.nombre}</h3>
                <p className="text-sm text-gray-400">
                  Sede: <strong className="text-gray-200">{t.sede}</strong> | Llave: <code className="text-amber-400">{t.organizadorLlaveId || 'N/A'}</code>
                </p>
                <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                  <p>Precio Torneo por pareja: <strong>${t.precioInscripcionBase || 0}</strong></p>
                  <p className="text-green-400 font-semibold">Comisión FOXREN estimada: ${t.feeFoxrenPorPareja || 10000} / pareja</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleAprobar(t.id)}
                  className="flex-1 md:flex-none px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-sm transition"
                >
                  Aprobar y Publicar
                </button>
                <button
                  onClick={() => handleRechazar(t.id)}
                  className="flex-1 md:flex-none px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded text-sm transition"
                >
                  Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};