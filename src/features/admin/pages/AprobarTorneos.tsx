import React, { useEffect, useState } from 'react';
import { db } from '../../../infrastructure/firebase/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { COLLECTIONS } from '../../../infrastructure/firebase/collections';

interface CompetenciaInfo {
  id: string;
  nombre: string;
  categoria: string;
  precioInscripcionBase: number;
  cupoMaximoParejas: number;
}

interface TorneoFinanciero {
  id: string;
  nombre: string;
  sede?: string;
  clubSede?: string;
  organizadorLlaveId?: string;
  estado: string;
  competencias: CompetenciaInfo[];
  recaudacionEstimadaTotal: number;
  cuposTotales: number;
}

export const AprobarTorneos: React.FC = () => {
  const [torneosPendientes, setTorneosPendientes] = useState<TorneoFinanciero[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de configuración financiera por torneo (torneoId -> valor)
  const [comisionesPorcentaje, setComisionesPorcentaje] = useState<{ [key: string]: number }>({});
  const [modalidadesPago, setModalidadesPago] = useState<{ [key: string]: 'ANTICIPADO' | 'POR_INSCRIPCION' }>({});

  useEffect(() => {
    cargarPendientesFinancieros();
  }, []);

  const cargarPendientesFinancieros = async () => {
    try {
      setLoading(true);

      // 1. Obtener Torneos Pendientes
      const qTorneos = query(
        collection(db, COLLECTIONS.torneos),
        where("estado", "==", "PENDIENTE_APROBACION")
      );
      const snapTorneos = await getDocs(qTorneos);

      // 2. Obtener Competencias
      const snapCompetencias = await getDocs(collection(db, 'competencias'));
      const todasLasCompetencias = snapCompetencias.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as any[];

      // 3. Obtener Organizadores para vincular sus llaves reales
      const snapOrganizadores = await getDocs(collection(db, 'organizadores'));
      const mapaOrganizadores: { [key: string]: string } = {};
      
      snapOrganizadores.docs.forEach(docOrg => {
        const orgData = docOrg.data();
        // Guardamos la llave indexada por el ID del doc y por la llave en sí
        if (orgData.llave || orgData.llaveAcceso) {
          mapaOrganizadores[docOrg.id] = orgData.llave || orgData.llaveAcceso;
          if (orgData.usuarioId) mapaOrganizadores[orgData.usuarioId] = orgData.llave || orgData.llaveAcceso;
        }
      });

      // 4. Estructurar Torneos vinculando la Llave Real
      const listaEstructurada: TorneoFinanciero[] = snapTorneos.docs.map((docSnap) => {
        const tData = docSnap.data();
        const tId = docSnap.id;

        // Búsqueda exhaustiva de la llave
        const llaveDetectada = 
          tData.organizadorLlaveId || 
          tData.llave || 
          tData.llaveAcceso || 
          (tData.organizadorId ? mapaOrganizadores[tData.organizadorId] : null) ||
          'Llave No Vinculada';

        // Filtrar competencias de este torneo
        const compsTorneo: CompetenciaInfo[] = todasLasCompetencias
          .filter(c => c.torneoId === tId)
          .map(c => ({
            id: c.id,
            nombre: c.nombre || c.categoria || 'Categoría sin nombre',
            categoria: c.categoria || '',
            precioInscripcionBase: Number(c.precioInscripcionBase || c.precio || 0),
            cupoMaximoParejas: Number(c.cupoMaximoParejas || c.cupo || 0)
          }));

        let recaudacionTotal = 0;
        let totalCupos = 0;

        compsTorneo.forEach(c => {
          recaudacionTotal += c.precioInscripcionBase * c.cupoMaximoParejas;
          totalCupos += c.cupoMaximoParejas;
        });

        return {
          id: tId,
          nombre: tData.nombre,
          sede: tData.sede || tData.clubSede || 'Sede a definir',
          organizadorLlaveId: llaveDetectada,
          estado: tData.estado,
          competencias: compsTorneo,
          recaudacionEstimadaTotal: recaudacionTotal,
          cuposTotales: totalCupos
        };
      });

      setTorneosPendientes(listaEstructurada);

      // Inicializar comisiones y modalidades
      const inicialComisiones: { [key: string]: number } = {};
      const inicialModalidades: { [key: string]: 'ANTICIPADO' | 'POR_INSCRIPCION' } = {};

      listaEstructurada.forEach(t => {
        inicialComisiones[t.id] = 10;
        inicialModalidades[t.id] = 'POR_INSCRIPCION';
      });

      setComisionesPorcentaje(inicialComisiones);
      setModalidadesPago(inicialModalidades);

    } catch (err) {
      console.error("Error al cargar torneos financieros:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobarTorneo = async (torneo: TorneoFinanciero) => {
    const pct = comisionesPorcentaje[torneo.id] ?? 10;
    const modalidad = modalidadesPago[torneo.id] ?? 'POR_INSCRIPCION';
    const gananciaEstimadaFoxren = (torneo.recaudacionEstimadaTotal * pct) / 100;

    const mensajeConfirmacion = 
      `¿Aprobar el torneo "${torneo.nombre}"?\n\n` +
      `• Recaudación Bruta Est.: $${torneo.recaudacionEstimadaTotal.toLocaleString()}\n` +
      `• Comisión Acordada: ${pct}%\n` +
      `• Ganancia Est. FOXREN: $${gananciaEstimadaFoxren.toLocaleString()}\n` +
      `• Modalidad de Cobro: ${modalidad === 'ANTICIPADO' ? 'Pago Anticipado / Canon Fijo' : 'A medida que se inscriban'}`;

    if (confirm(mensajeConfirmacion)) {
      try {
        await updateDoc(doc(db, COLLECTIONS.torneos, torneo.id), {
          estado: 'INSCRIPCION_ABIERTA',
          comisionPorcentaje: pct,
          gananciaEstimadaFoxren: gananciaEstimadaFoxren,
          modalidadPago: modalidad,
          validoParaRanking: true,
          fechaAprobacion: new Date()
        });
        alert("Torneo aprobado oficialmente y publicado.");
        cargarPendientesFinancieros();
      } catch (err) {
        console.error(err);
        alert("Error al oficializar el torneo.");
      }
    }
  };

  const handleDarDeBajaSancion = async (torneoId: string, nombre: string) => {
    const motivo = prompt(`Ingresa el motivo para dar de baja / anular el torneo "${nombre}":`, "Incumplimiento de acuerdo de pago / canon FOXREN");
    if (motivo) {
      try {
        await updateDoc(doc(db, COLLECTIONS.torneos, torneoId), {
          estado: 'CANCELADO_POR_ADMIN',
          motivoBaja: motivo,
          validoParaRanking: false, // Quita cualquier suma de puntos oficial
        });
        alert("El torneo ha sido dado de baja y sus puntos para el ranking fueron anulados.");
        cargarPendientesFinancieros();
      } catch (err) {
        console.error(err);
        alert("Error al anular el torneo.");
      }
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Cargando balance de solicitudes...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Aprobación y Canon de Torneos</h1>
        <p className="text-xs text-slate-400 mt-1">
          Auditoría de competencias, facturación estimada y control de acuerdos con organizadores.
        </p>
      </div>

      {torneosPendientes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          No hay solicitudes de torneos pendientes de revisión comercial.
        </div>
      ) : (
        <div className="space-y-6">
          {torneosPendientes.map((torneo) => {
            const pct = comisionesPorcentaje[torneo.id] ?? 10;
            const gananciaEstimadaFoxren = (torneo.recaudacionEstimadaTotal * pct) / 100;
            const modalidad = modalidadesPago[torneo.id] ?? 'POR_INSCRIPCION';

            return (
              <div 
                key={torneo.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 hover:border-slate-700 transition"
              >
                {/* Encabezado del Torneo */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-2">
                  <div>
                    <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold uppercase">
                      Pendiente de Auditoría
                    </span>
                    <h2 className="text-xl font-bold text-white mt-2">{torneo.nombre}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      📍 Sede: <strong className="text-slate-200">{torneo.sede}</strong> | 🔑 Llave Org: <code className="text-amber-400">{torneo.organizadorLlaveId}</code>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Recaudación Bruta Proyectada</p>
                    <p className="text-2xl font-black text-green-400">${torneo.recaudacionEstimadaTotal.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">{torneo.cuposTotales} parejas en total</p>
                  </div>
                </div>

                {/* Desglose de Competencias Cargadas por el Organizador */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Competencias Declaradas ({torneo.competencias.length})
                  </h4>

                  {torneo.competencias.length === 0 ? (
                    <div className="bg-slate-950 p-3 rounded-xl text-xs text-amber-400/90 border border-amber-500/20">
                      ⚠️ El organizador aún no ha creado las categorías de este torneo.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {torneo.competencias.map((comp) => (
                        <div key={comp.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-200">{comp.nombre}</p>
                            <p className="text-[11px] text-slate-400">Cupo: {comp.cupoMaximoParejas} parejas</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-400">${comp.precioInscripcionBase.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">
                              Subtotal: ${(comp.precioInscripcionBase * comp.cupoMaximoParejas).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calculadora de Canon y Negociación FOXREN */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Configuración Comercial FOXREN
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Input % Comisión */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Comisión Acordada (%):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={pct}
                          onChange={(e) => setComisionesPorcentaje({ ...comisionesPorcentaje, [torneo.id]: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-green-500"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    </div>

                    {/* Selector Modalidad de Cobro */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Modalidad de Cobro:</label>
                      <select
                        value={modalidad}
                        onChange={(e) => setModalidadesPago({ ...modalidadesPago, [torneo.id]: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-green-500"
                      >
                        <option value="POR_INSCRIPCION">A medida que se inscriben</option>
                        <option value="ANTICIPADO">Pago Anticipado / Canon Previo</option>
                      </select>
                    </div>

                    {/* Total Estimado FOXREN */}
                    <div className="bg-blue-950/40 border border-blue-500/20 p-2.5 rounded-lg flex flex-col justify-center">
                      <span className="text-slate-400 font-medium">Ganancia Est. FOXREN:</span>
                      <span className="text-lg font-black text-blue-400">${gananciaEstimadaFoxren.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones del Administrador */}
                <div className="flex flex-col md:flex-row justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleDarDeBajaSancion(torneo.id, torneo.nombre)}
                    className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 font-bold rounded-xl text-xs transition"
                  >
                    🚫 Rechar / Dar de Baja (Invalida Puntos)
                  </button>

                  <button
                    onClick={() => handleAprobarTorneo(torneo)}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-green-600/20"
                  >
                    ✓ Aprobar Torneo y Pactar Canon
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};