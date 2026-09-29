// src/features/competencias/pages/CompetenciasPage.tsx

import React, { useEffect, useState } from "react";
import { circuitosRepository } from "../../../infrastructure/repositories/circuitosRepository";
import { torneosRepository } from "../../../infrastructure/repositories/torneosRepository";
import { competenciasRepository } from "../../../infrastructure/repositories/competenciasRepository";
import { TorneoDetalleModal } from "../../torneos/components/TorneoDetalleModal";
import { InscripcionParejaModal } from "../../parejas/components/InscripcionParejaModal";
import type { Circuito } from "../../../domain/circuito/circuito.types";
import type { Torneo } from "../../../domain/torneo/torneo.types";

export const CompetenciasPage: React.FC = () => {
  const [circuitos, setCircuitos] = useState<Circuito[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [circuitoExpandidoId, setCircuitoExpandidoId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<Torneo | null>(
    null,
  );
  const [competenciasTorneo, setCompetenciasTorneo] = useState<any[]>([]);
  const [competenciaAInscribir, setCompetenciaAInscribir] = useState<
    any | null
  >(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dataCircuitos, dataTorneos] = await Promise.all([
          circuitosRepository.obtenerCircuitos(),
          torneosRepository.obtenerTorneos(),
        ]);
        setCircuitos(dataCircuitos);
        setTorneos(dataTorneos);
      } catch (error) {
        console.error("Error al obtener datos de competencias:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const toggleExpandir = (id: string) => {
    setCircuitoExpandidoId((prev) => (prev === id ? null : id));
  };

  const handleAbrirDetalleTorneo = async (torneo: Torneo) => {
    setTorneoSeleccionado(torneo);
    try {
      // CORRECCIÓN 1: Se usa obtenerPorTorneoId
      const comps = await competenciasRepository.obtenerPorTorneoId(torneo.id);
      setCompetenciasTorneo(comps);
    } catch (err) {
      console.error(
        "Error al obtener categorías/competencias del torneo:",
        err,
      );
      setCompetenciasTorneo([]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center text-gray-400">
        Cargando circuitos del ecosistema...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary-light)]">
          Circuitos Oficiales
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Temporadas y campeonatos activos en la plataforma FOXREN.
        </p>
      </div>

      {circuitos.length === 0 ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-[var(--border-radius)] p-8 text-center text-gray-400">
          No hay circuitos registrados actualmente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circuitos.map((circuito) => {
            const torneosDelCircuito = torneos.filter(
              (t) => t.circuitoId === circuito.id,
            );
            const isExpanded = circuitoExpandidoId === circuito.id;

            return (
              <div
                key={circuito.id}
                className="bg-gray-900/60 border border-gray-800 hover:border-[var(--color-primary)] rounded-[var(--border-radius)] p-6 shadow-[var(--shadow-card)] transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 bg-[var(--color-primary)] text-white rounded">
                      Temporada {circuito.temporada}
                    </span>
                    <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                      {circuito.estado}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {circuito.nombre}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {torneosDelCircuito.length} torneo(s) vinculados
                  </p>

                  {/* Lista desplegable de torneos */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-gray-800 space-y-2">
                      <span className="text-xs font-semibold text-gray-300 block mb-1">
                        Torneos en este circuito:
                      </span>
                      {torneosDelCircuito.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                          No hay torneos registrados para este circuito.
                        </p>
                      ) : (
                        torneosDelCircuito.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleAbrirDetalleTorneo(t)}
                            className="p-2 bg-gray-800/80 hover:bg-gray-800 border border-gray-700/60 rounded flex justify-between items-center cursor-pointer transition"
                          >
                            <div>
                              <p className="text-xs font-bold text-white">
                                {t.nombre}
                              </p>
                              <span className="text-[10px] text-gray-400">
                                Sede: {t.sede}
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--color-primary-light)] font-bold">
                              Ver →
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div
                  onClick={() => toggleExpandir(circuito.id)}
                  className="mt-6 pt-4 border-t border-gray-800/80 flex justify-between items-center text-sm cursor-pointer select-none hover:text-[var(--color-primary-light)] transition"
                >
                  <span className="text-gray-300 font-medium">
                    {isExpanded ? "Ocultar torneos" : "Ver torneos asociados"}
                  </span>
                  <span className="text-[var(--color-primary-light)] font-bold">
                    {isExpanded ? "↑" : "→"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle del Torneo */}
      {torneoSeleccionado && (
        <TorneoDetalleModal
          torneo={torneoSeleccionado}
          competencias={competenciasTorneo}
          onClose={() => {
            setTorneoSeleccionado(null);
            setCompetenciasTorneo([]);
          }}
          onInscribirCompetencia={(comp) => {
            setCompetenciaAInscribir(comp);
          }}
        />
      )}

      {/* Modal de Inscripción de Pareja */}
      {competenciaAInscribir && (
        <InscripcionParejaModal
          competencia={competenciaAInscribir}
          onClose={() => setCompetenciaAInscribir(null)}
          onSuccess={() => {
            setCompetenciaAInscribir(null);
            setTorneoSeleccionado(null);
            // Acá podés agregar lógica adicional si querés recargar datos al completarse la inscripción
          }}
        />
      )}
    </div>
  );
};
