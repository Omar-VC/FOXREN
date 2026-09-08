// src/features/torneos/pages/TorneosPage.tsx

import React, { useEffect, useState } from "react";
import { torneosRepository } from "../../../infrastructure/repositories/torneosRepository";
import { circuitosRepository } from "../../../infrastructure/repositories/circuitosRepository";
import type { Torneo } from "../../../domain/torneo/torneo.types";
import type { Circuito } from "../../../domain/circuito/circuito.types";
import { validarLlaveOrganizador } from "../../admin/services/llaveService";

export const TorneosPage: React.FC = () => {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [circuitos, setCircuitos] = useState<Circuito[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal del Organizador
  const [mostrarModal, setMostrarModal] = useState(false);
  const [llaveIngresada, setLlaveIngresada] = useState("");
  const [llaveValida, setLlaveValida] = useState(false);
  const [errorLlave, setErrorLlave] = useState("");

  // Formulario de nuevo torneo
  const [circuitoId, setCircuitoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [sede, setSede] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [categorias, setCategorias] = useState<string[]>(["QUINTA", "SEXTA"]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [listTorneos, listCircuitos] = await Promise.all([
        torneosRepository.obtenerTorneos(),
        circuitosRepository.obtenerCircuitos(),
      ]);
      setTorneos(listTorneos);
      setCircuitos(listCircuitos);
    } catch (error) {
      console.error("Error al cargar torneos/circuitos:", error);
    } finally {
      setLoading(false);
    }
  };

  const validarLlave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLlave("");

    if (!llaveIngresada.trim()) {
      setErrorLlave("Ingresá una llave válida.");
      return;
    }

    const resultado = await validarLlaveOrganizador(llaveIngresada);

    if (resultado.valida) {
      setLlaveValida(true);
    } else {
      setErrorLlave(resultado.mensaje || "Llave inválida.");
    }
  };

  const handleCrearTorneo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circuitoId) {
      alert("Seleccioná un circuito válido");
      return;
    }

    try {
      await torneosRepository.crearTorneo({
        circuitoId,
        nombre,
        sede,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        categoriasValidas: categorias,
        precioInscripcionBase: 20000,   // Monto base referencial que cobra el organizador
        feeFoxrenPorPareja: 10000,      // Tu comisión fija por pareja
        estado: 'PENDIENTE_APROBACION', // Entra directo en revisión para tu aprobación/canon
        organizadorLlaveId: llaveIngresada,
      });

      alert("Torneo registrado con éxito. Quedó en estado 'Pendiente de Aprobación' hasta verificar el pago del canon.");
      setMostrarModal(false);
      setLlaveValida(false);
      setLlaveIngresada("");
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el torneo.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center text-gray-400">
        Cargando calendario de torneos...
      </div>
    );
  }

  const toggleCategoria = (cat: string) => {
    if (categorias.includes(cat)) {
      setCategorias(categorias.filter((c) => c !== cat));
    } else {
      setCategorias([...categorias, cat]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary-light)]">
            Calendario de Torneos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Fechas confirmadas, sedes e inscripciones abiertas para las
            distintas categorías.
          </p>
        </div>

        {/* BOTÓN PARA ORGANIZADORES */}
        <button
          onClick={() => setMostrarModal(true)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold text-sm rounded-[var(--border-radius)] transition shadow"
        >
          🔑 ¿Sos Organizador? Crear Torneo
        </button>
      </div>

      {torneos.length === 0 ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-[var(--border-radius)] p-8 text-center text-gray-400 shadow-[var(--shadow-card)]">
          No hay torneos programados o abiertos por el momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {torneos.map((torneo) => (
            <div
              key={torneo.id}
              className="bg-gray-900/60 border border-gray-800 hover:border-[var(--color-primary)] rounded-[var(--border-radius)] p-6 shadow-[var(--shadow-card)] transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 bg-green-600/80 text-white rounded">
                    {torneo.estado.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-400">
                    Sede: <strong className="text-white">{torneo.sede}</strong>
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                  {torneo.nombre}
                </h2>

                <div className="flex flex-wrap gap-1.5 my-3">
                  {torneo.categoriasValidas?.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs px-2 py-0.5 bg-gray-800 border border-gray-700 text-[var(--color-primary-light)] font-semibold rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-400">
                <span>
                  Inicio: {new Date(torneo.fechaInicio).toLocaleDateString()}
                </span>
                <button className="px-3 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white font-bold rounded transition">
                  Inscribirse / Ver Cuadro
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PARA ORGANIZADOR */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-[var(--border-radius)] max-w-lg w-full p-6 relative shadow-2xl">
            <button
              onClick={() => {
                setMostrarModal(false);
                setLlaveValida(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            {!llaveValida ? (
              <div>
                <h3 className="text-xl font-bold text-[var(--color-primary-light)] mb-2">
                  Acceso Organizador
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Ingresá tu Llave de Autorización emitido por FOXREN para dar
                  de alta un torneo.
                </p>

                {errorLlave && (
                  <p className="text-xs text-red-400 bg-red-900/30 p-2 rounded mb-3 border border-red-800">
                    {errorLlave}
                  </p>
                )}

                <form onSubmit={validarLlave} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Ej: FOX-KEY-8931"
                    value={llaveIngresada}
                    onChange={(e) => setLlaveIngresada(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[var(--color-primary)] text-white font-bold rounded hover:opacity-90 transition"
                  >
                    Validar Llave
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-[var(--color-primary-light)] mb-4">
                  Crear Nuevo Torneo
                </h3>

                <form
                  onSubmit={handleCrearTorneo}
                  className="space-y-3 text-sm"
                >
                  <div>
                    <label className="block text-gray-400 mb-1">
                      Circuito al que pertenece
                    </label>
                    <select
                      required
                      value={circuitoId}
                      onChange={(e) => setCircuitoId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
                    >
                      <option value="">Seleccionar Circuito...</option>
                      {circuitos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} ({c.temporada})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">
                      Nombre del Torneo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Fecha 1 - Copa Apertura"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">
                      Sede / Club
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Padel Club Central"
                      value={sede}
                      onChange={(e) => setSede(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        required
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        required
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">
                      Categorías Habilitadas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "PRIMERA",
                        "SEGUNDA",
                        "TERCERA",
                        "CUARTA",
                        "QUINTA",
                        "SEXTA",
                        "SEPTIMA",
                        "OCTAVA",
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategoria(cat)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded border transition ${
                            categorias.includes(cat)
                              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                              : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition mt-4"
                  >
                    Publicar Torneo
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
