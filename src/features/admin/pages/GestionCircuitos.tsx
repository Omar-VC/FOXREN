// src/features/admin/pages/GestionCircuitos.tsx

import React, { useEffect, useState } from "react";
import { circuitosRepository } from "../../../infrastructure/repositories/circuitosRepository";
import { organizadoresRepository } from "../../../infrastructure/repositories/organizadoresRepository";
import { db } from "../../../infrastructure/firebase/firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "../../../infrastructure/firebase/collections";
import type { Circuito } from "../../../domain/circuito/circuito.types";
import type { Organizador } from "../../../domain/organizador/organizador.types";

interface LlaveData {
  id: string;
  codigo: string;
  circuitoId: string;
  organizadorId: string;
  nombreOrganizador: string;
  dniCuitOrganizador?: string;
  estado: string;
}

export const GestionCircuitos: React.FC = () => {
  const [circuitos, setCircuitos] = useState<Circuito[]>([]);
  const [llaves, setLlaves] = useState<LlaveData[]>([]);
  const [organizadores, setOrganizadores] = useState<Organizador[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario Circuito
  const [nombreCircuito, setNombreCircuito] = useState("");
  const [temporada, setTemporada] = useState("2026");

  // Formulario Llave
  const [circuitoSeleccionado, setCircuitoSeleccionado] = useState("");
  const [busquedaDni, setBusquedaDni] = useState("");
  const [organizadorSeleccionado, setOrganizadorSeleccionado] = useState<Organizador | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [llaveGenerada, setLlaveGenerada] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [dataCircuitos, dataOrgs] = await Promise.all([
        circuitosRepository.obtenerCircuitos(),
        organizadoresRepository.obtenerTodos()
      ]);
      setCircuitos(dataCircuitos);
      setOrganizadores(dataOrgs);

      const snapLlaves = await getDocs(collection(db, COLLECTIONS.llavesOrganizadores));
      const listLlaves = snapLlaves.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LlaveData[];
      setLlaves(listLlaves);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCircuito = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await circuitosRepository.crearCircuito({
        nombre: nombreCircuito,
        temporada: temporada, // <- Se envía directamente como string ("2026")
        estado: "activo",     // <- En minúscula para coincidir con EstadoCircuito
      });
      alert("Circuito creado exitosamente");
      setNombreCircuito("");
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert("Error al crear circuito");
    }
  };

  const handleBuscarOrganizador = async () => {
    setErrorBusqueda("");
    if (!busquedaDni.trim()) return;

    const orgEncontrado = await organizadoresRepository.buscarPorDni(busquedaDni.trim());
    if (orgEncontrado) {
      setOrganizadorSeleccionado(orgEncontrado);
    } else {
      setOrganizadorSeleccionado(null);
      setErrorBusqueda("No se encontró ningún organizador con ese DNI/CUIT.");
    }
  };

  const handleGenerarLlave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circuitoSeleccionado) {
      alert("Seleccioná un circuito");
      return;
    }
    if (!organizadorSeleccionado) {
      alert("Debés buscar y seleccionar un organizador válido por DNI/CUIT.");
      return;
    }

    const codigo = `FOX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;

    try {
      await addDoc(collection(db, COLLECTIONS.llavesOrganizadores), {
        codigo,
        circuitoId: circuitoSeleccionado,
        organizadorId: organizadorSeleccionado.id,
        nombreOrganizador: organizadorSeleccionado.nombreCompleto,
        dniCuitOrganizador: organizadorSeleccionado.dniCuit,
        estado: "activa",
        fechaCreacion: Timestamp.now(),
      });

      setLlaveGenerada(codigo);
      setOrganizadorSeleccionado(null);
      setBusquedaDni("");
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert("Error al generar la llave");
    }
  };

  if (loading) return <p className="text-gray-400">Cargando gestión de circuitos...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary-light)]">Gestión de Circuitos y Llaves</h1>

      {/* SECCIÓN CREAR Y EMITIR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crear Circuito */}
        <div className="bg-gray-900/60 p-5 rounded-[var(--border-radius)] border border-gray-800">
          <h2 className="text-lg font-bold mb-4">Nuevo Circuito</h2>
          <form onSubmit={handleCrearCircuito} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre del Circuito</label>
              <input
                type="text"
                required
                placeholder="Ej: Circuito Patagónico"
                value={nombreCircuito}
                onChange={(e) => setNombreCircuito(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Temporada</label>
              <input
                type="number"
                required
                value={temporada}
                onChange={(e) => setTemporada(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-[var(--color-primary)] font-bold rounded text-sm hover:opacity-90 transition">
              Guardar Circuito
            </button>
          </form>
        </div>

        {/* Generar Llave */}
        <div className="bg-gray-900/60 p-5 rounded-[var(--border-radius)] border border-gray-800">
          <h2 className="text-lg font-bold mb-4">Emitir Llave de Organizador</h2>
          <form onSubmit={handleGenerarLlave} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Circuito Asignado</label>
              <select
                required
                value={circuitoSeleccionado}
                onChange={(e) => setCircuitoSeleccionado(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none"
              >
                <option value="">Seleccionar Circuito...</option>
                {circuitos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.temporada})</option>
                ))}
              </select>
            </div>

            {/* Búsqueda por DNI/CUIT o Selector */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Buscar Organizador por DNI / CUIT</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ingrese DNI o CUIT"
                  value={busquedaDni}
                  onChange={(e) => setBusquedaDni(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleBuscarOrganizador}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold transition"
                >
                  Buscar
                </button>
              </div>
              
              {/* Opción rápida de selección manual desde la lista */}
              <div className="mt-2">
                <span className="text-[10px] text-gray-500 block mb-1">O seleccioná uno de la lista:</span>
                <select
                  onChange={(e) => {
                    const org = organizadores.find((o) => o.id === e.target.value);
                    if (org) {
                      setOrganizadorSeleccionado(org);
                      setBusquedaDni(org.dniCuit);
                      setErrorBusqueda("");
                    }
                  }}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-300 text-xs"
                >
                  <option value="">-- Seleccionar de la lista --</option>
                  {organizadores.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.nombreCompleto} (DNI: {org.dniCuit})
                    </option>
                  ))}
                </select>
              </div>

              {errorBusqueda && <p className="text-xs text-red-400 mt-1">{errorBusqueda}</p>}

              {organizadorSeleccionado && (
                <div className="mt-3 p-2 bg-blue-950/40 border border-blue-500/40 rounded text-xs">
                  <p className="text-blue-300 font-bold">{organizadorSeleccionado.nombreCompleto}</p>
                  <p className="text-gray-400">DNI/CUIT: {organizadorSeleccionado.dniCuit} | Sede: {organizadorSeleccionado.clubSede}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!organizadorSeleccionado || !circuitoSeleccionado}
              className="w-full py-2 bg-amber-600 font-bold rounded text-sm hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Generar Llave
            </button>
          </form>

          {llaveGenerada && (
            <div className="mt-4 p-3 bg-green-900/40 border border-green-500/50 rounded text-center">
              <span className="text-xs text-gray-300 block">Llave Generada Exitosamente:</span>
              <strong className="text-lg text-green-300 font-mono select-all">{llaveGenerada}</strong>
            </div>
          )}
        </div>
      </div>

      {/* TABLAS DE VISUALIZACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
        <div>
          <h2 className="text-lg font-bold mb-3 text-[var(--color-primary-light)]">Circuitos Activos</h2>
          {circuitos.length === 0 ? (
            <p className="text-sm text-gray-500">No hay circuitos creados.</p>
          ) : (
            <ul className="space-y-2">
              {circuitos.map((c) => (
                <li key={c.id} className="p-3 bg-gray-900/80 border border-gray-800 rounded flex justify-between items-center text-sm">
                  <div>
                    <strong className="text-white block">{c.nombre}</strong>
                    <span className="text-xs text-gray-400">Temporada {c.temporada}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-green-900/60 text-green-300 border border-green-700/50 rounded">
                    {c.estado}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3 text-[var(--color-primary-light)]">Llaves Emitidas</h2>
          {llaves.length === 0 ? (
            <p className="text-sm text-gray-500">No se han emitido llaves.</p>
          ) : (
            <ul className="space-y-2">
              {llaves.map((l) => {
                const circuitoAsociado = circuitos.find((c) => c.id === l.circuitoId);
                return (
                  <li key={l.id} className="p-3 bg-gray-900/80 border border-gray-800 rounded flex justify-between items-center text-sm">
                    <div>
                      <strong className="text-amber-400 font-mono block">{l.codigo}</strong>
                      <span className="text-xs text-gray-300">{l.nombreOrganizador} {l.dniCuitOrganizador ? `(${l.dniCuitOrganizador})` : ""}</span>
                      <span className="text-xs text-gray-500 block">
                        Circuito: {circuitoAsociado ? circuitoAsociado.nombre : "No asignado"}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded">
                      {l.estado}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};