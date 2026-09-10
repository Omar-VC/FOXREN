// src/features/parejas/components/InscripcionParejaModal.tsx

import React, { useState } from "react";
import type { Competencia } from "../../../domain/competencia/competencia.types";
import { parejasRepository } from "../../../infrastructure/repositories/parejasRepository";

interface InscripcionParejaModalProps {
  competencia: Competencia;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InscripcionParejaModal: React.FC<InscripcionParejaModalProps> = ({
  competencia,
  onClose,
  onSuccess,
}) => {
  const [dniJugador1, setDniJugador1] = useState("");
  const [nombreJugador1, setNombreJugador1] = useState("");
  
  const [dniJugador2, setDniJugador2] = useState("");
  const [nombreJugador2, setNombreJugador2] = useState("");

  const [errores, setErrores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  const handleInscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);

    // Regla de Negocio: DNI de compañeros no pueden ser idénticos
    if (dniJugador1.trim() === dniJugador2.trim()) {
      setErrores(["El DNI del Jugador 1 y del Jugador 2 no pueden ser iguales."]);
      return;
    }

    try {
      setCargando(true);

      // Guardar la pareja asociada a la competencia
      await parejasRepository.inscribirPareja({
        competenciaId: competencia.id,
        jugador1: { dni: dniJugador1.trim(), nombre: nombreJugador1.trim() },
        jugador2: { dni: dniJugador2.trim(), nombre: nombreJugador2.trim() },
        fechaInscripcion: new Date(),
        estadoPago: "PENDIENTE",
      });

      alert(`¡Inscripción exitosa para la competencia ${competencia.nombre}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al inscribir pareja:", error);
      setErrores([error.message || "Ocurrió un error al procesar la inscripción."]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-[var(--border-radius)] max-w-lg w-full space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-white">
            Inscripción: <span className="text-[var(--color-primary-light)]">{competencia.nombre}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold">
            ✕
          </button>
        </div>

        {errores.length > 0 && (
          <div className="bg-red-900/40 border border-red-500 text-red-200 text-xs p-3 rounded">
            {errores.map((err, idx) => (
              <p key={idx}>• {err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleInscripcion} className="space-y-4 text-xs">
          {/* Jugador 1 */}
          <div className="bg-gray-800/40 p-3 rounded border border-gray-700/50 space-y-2">
            <span className="font-bold text-[var(--color-primary-light)] block">Jugador 1 (Titular)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="DNI"
                required
                value={dniJugador1}
                onChange={(e) => setDniJugador1(e.target.value)}
                className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Nombre Completo"
                required
                value={nombreJugador1}
                onChange={(e) => setNombreJugador1(e.target.value)}
                className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Jugador 2 */}
          <div className="bg-gray-800/40 p-3 rounded border border-gray-700/50 space-y-2">
            <span className="font-bold text-[var(--color-primary-light)] block">Jugador 2 (Compañero)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="DNI"
                required
                value={dniJugador2}
                onChange={(e) => setDniJugador2(e.target.value)}
                className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Nombre Completo"
                required
                value={nombreJugador2}
                onChange={(e) => setNombreJugador2(e.target.value)}
                className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded flex justify-between items-center text-gray-300">
            <span>Monto Total Inscripción:</span>
            <strong className="text-green-400 text-sm">${competencia.precioInscripcionBase}</strong>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white font-bold rounded transition"
            >
              {cargando ? "Inscribiendo..." : "Confirmar Inscripción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};