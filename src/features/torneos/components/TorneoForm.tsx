// src/features/torneos/components/TorneoForm.tsx

import React, { useState } from "react";
import { torneosRepository } from "../../../infrastructure/repositories/torneosRepository";
import { CompetenciaForm } from "../../competencias/components/CompetenciaForm";
import type { Circuito } from "../../../domain/circuito/circuito.types";

interface TorneoFormProps {
  circuitos: Circuito[];
  organizadorLlaveId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TorneoForm: React.FC<TorneoFormProps> = ({
  circuitos,
  organizadorLlaveId = "",
  onSuccess,
  onCancel,
}) => {
  const [circuitoId, setCircuitoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [sede, setSede] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [torneoCreadoId, setTorneoCreadoId] = useState<string | null>(null);
  const [mostrandoFormCompetencia, setMostrandoFormCompetencia] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  const handleCrearTorneo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);

    if (!circuitoId) {
      setErrores(["Debes seleccionar un circuito válido."]);
      return;
    }

    try {
      setCargando(true);
      const id = await torneosRepository.crearTorneo({
        circuitoId,
        nombre,
        sede,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        categoriasValidas: [],
        estado: "PENDIENTE_APROBACION",
        organizadorLlaveId,
      });

      setTorneoCreadoId(id);
      alert("¡Torneo registrado correctamente! Ahora puedes agregar las categorías/competencias.");
    } catch (error) {
      console.error("Error al crear el torneo:", error);
      setErrores(["Ocurrió un error al guardar el torneo en la base de datos."]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-[var(--border-radius)] shadow-[var(--shadow-card)] max-w-2xl mx-auto space-y-6">
      {!torneoCreadoId ? (
        <form onSubmit={handleCrearTorneo} className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--color-primary-light)] border-b border-gray-800 pb-2">
            1. Registrar Nuevo Torneo
          </h2>

          {errores.length > 0 && (
            <div className="bg-red-900/40 border border-red-500 text-red-200 text-sm p-3 rounded">
              {errores.map((err, idx) => (
                <p key={idx}>• {err}</p>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Circuito Pertenezciente
            </label>
            <select
              required
              value={circuitoId}
              onChange={(e) => setCircuitoId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none"
            >
              <option value="">Seleccionar Circuito...</option>
              {circuitos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Nombre del Torneo
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Fecha 1 - Copa Apertura"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Sede / Club
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Padel Club Central"
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={cargando}
              className="px-5 py-2 rounded bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition shadow"
            >
              {cargando ? "Guardando..." : "Crear y Añadir Categorías"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800/80 border border-gray-700 p-4 rounded text-sm text-gray-300 space-y-1">
            <p className="font-bold text-white text-base">Torneo: {nombre}</p>
            <p>Sede: {sede}</p>
            <p className="text-xs text-green-400">✓ Guardado en base de datos</p>
          </div>

          {!mostrandoFormCompetencia ? (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-gray-400">
                Añade las categorías que competirán en este torneo (ej. 4ta, 5ta, Suma 11).
              </p>
              <button
                type="button"
                onClick={() => setMostrandoFormCompetencia(true)}
                className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-sm font-bold rounded shadow transition"
              >
                + Cargar Nueva Categoría
              </button>
            </div>
          ) : (
            <CompetenciaForm
              torneoId={torneoCreadoId}
              onSuccess={() => setMostrandoFormCompetencia(false)}
              onCancel={() => setMostrandoFormCompetencia(false)}
            />
          )}

          <div className="flex justify-end pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => {
                if (onSuccess) onSuccess();
              }}
              className="px-5 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition"
            >
              Finalizar Gestión de Torneo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};