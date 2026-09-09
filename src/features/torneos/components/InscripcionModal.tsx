// src/features/torneos/components/InscripcionModal.tsx

import React, { useState } from "react";
import { createPortal } from "react-dom";
import type { Torneo } from "../../../domain/torneo/torneo.types";
import { jugadoresRepository } from "../../../infrastructure/repositories/jugadoresRepository";
import { torneosRepository } from "../../../infrastructure/repositories/torneosRepository";

interface Props {
  torneo: Torneo;
  onClose: () => void;
  onInscripcionExitosa: () => void;
}

export const InscripcionModal: React.FC<Props> = ({
  torneo,
  onClose,
  onInscripcionExitosa,
}) => {
  // Datos Pareja / Jugador 1
  const [dniJ1, setDniJ1] = useState("");
  const [nombreJ1, setNombreJ1] = useState("");
  const [apellidoJ1, setApellidoJ1] = useState("");
  const [j1Encontrado, setJ1Encontrado] = useState<boolean | null>(null);

  // Datos Pareja / Jugador 2
  const [dniJ2, setDniJ2] = useState("");
  const [nombreJ2, setNombreJ2] = useState("");
  const [apellidoJ2, setApellidoJ2] = useState("");
  const [j2Encontrado, setJ2Encontrado] = useState<boolean | null>(null);

  // Categória seleccionada
  const [categoria, setCategoria] = useState<string>(
    torneo.categoriasValidas?.[0] || "QUINTA"
  );

  const [cargando, setCargando] = useState(false);
  const [buscandoNum, setBuscandoNum] = useState<1 | 2 | null>(null);
  const [mensajeError, setMensajeError] = useState("");

  // FUNCIÓN PARA BUSCAR JUGADOR POR DNI
  const handleBuscarJugador = async (numJugador: 1 | 2) => {
    const dniBusqueda = numJugador === 1 ? dniJ1 : dniJ2;

    if (!dniBusqueda.trim()) {
      setMensajeError(`Por favor ingresá un DNI para el Jugador ${numJugador}.`);
      return;
    }

    setMensajeError("");
    setBuscandoNum(numJugador);

    try {
      const jugadorEncontrado = await jugadoresRepository.buscarPorDni(
        dniBusqueda.trim()
      );

      if (jugadorEncontrado) {
        if (numJugador === 1) {
          setNombreJ1(jugadorEncontrado.nombre || "");
          setApellidoJ1(jugadorEncontrado.apellido || "");
          setJ1Encontrado(true);
        } else {
          setNombreJ2(jugadorEncontrado.nombre || "");
          setApellidoJ2(jugadorEncontrado.apellido || "");
          setJ2Encontrado(true);
        }
      } else {
        // No se encontró en BD, se habilita carga manual de datos
        if (numJugador === 1) {
          setJ1Encontrado(false);
        } else {
          setJ2Encontrado(false);
        }
      }
    } catch (err) {
      console.error("Error al buscar jugador:", err);
      if (numJugador === 1) setJ1Encontrado(false);
      else setJ2Encontrado(false);
    } finally {
      setBuscandoNum(null);
    }
  };

  const handleSubmitInscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError("");

    if (!nombreJ1 || !apellidoJ1 || !nombreJ2 || !apellidoJ2) {
      setMensajeError("Completá los datos de ambos jugadores para inscribirte.");
      return;
    }

    setCargando(true);

    try {
      await torneosRepository.inscribirPareja({
        torneoId: torneo.id,
        categoria,
        jugador1: {
          dni: dniJ1.trim(),
          nombre: nombreJ1.trim(),
          apellido: apellidoJ1.trim(),
        },
        jugador2: {
          dni: dniJ2.trim(),
          nombre: nombreJ2.trim(),
          apellido: apellidoJ2.trim(),
        },
        estadoPago: "pendiente",
      });

      alert("¡Inscripción realizada con éxito!");
      onInscripcionExitosa();
    } catch (err: any) {
      console.error(err);
      setMensajeError("Ocurrió un error al registrar la inscripción.");
    } finally {
      setCargando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full p-6 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-1">
          Inscripción de Pareja
        </h2>
        <p className="text-xs text-gray-400 mb-4">{torneo.nombre}</p>

        {mensajeError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-xs text-red-300">
            {mensajeError}
          </div>
        )}

        <form onSubmit={handleSubmitInscripcion} className="space-y-5">
          {/* Categoría */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Seleccionar Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none"
            >
              {torneo.categoriasValidas?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* JUGADOR 1 */}
          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 space-y-3">
            <span className="text-xs font-bold text-amber-400 block">
              Jugador 1
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="DNI Jugador 1"
                value={dniJ1}
                onChange={(e) => setDniJ1(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => handleBuscarJugador(1)}
                disabled={buscandoNum === 1}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs rounded transition shrink-0 cursor-pointer"
              >
                {buscandoNum === 1 ? "..." : "Buscar"}
              </button>
            </div>

            {j1Encontrado !== null && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombreJ1}
                  onChange={(e) => setNombreJ1(e.target.value)}
                  disabled={j1Encontrado === true}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs disabled:opacity-70"
                  required
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={apellidoJ1}
                  onChange={(e) => setApellidoJ1(e.target.value)}
                  disabled={j1Encontrado === true}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs disabled:opacity-70"
                  required
                />
              </div>
            )}
          </div>

          {/* JUGADOR 2 */}
          <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 space-y-3">
            <span className="text-xs font-bold text-amber-400 block">
              Jugador 2 (Compañero/a)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="DNI Jugador 2"
                value={dniJ2}
                onChange={(e) => setDniJ2(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => handleBuscarJugador(2)}
                disabled={buscandoNum === 2}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs rounded transition shrink-0 cursor-pointer"
              >
                {buscandoNum === 2 ? "..." : "Buscar"}
              </button>
            </div>

            {j2Encontrado !== null && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombreJ2}
                  onChange={(e) => setNombreJ2(e.target.value)}
                  disabled={j2Encontrado === true}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs disabled:opacity-70"
                  required
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={apellidoJ2}
                  onChange={(e) => setApellidoJ2(e.target.value)}
                  disabled={j2Encontrado === true}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-xs disabled:opacity-70"
                  required
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 bg-green-600 hover:bg-green-500 font-bold text-white text-xs rounded transition cursor-pointer"
          >
            {cargando ? "Confirmando..." : "Confirmar Inscripción"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};