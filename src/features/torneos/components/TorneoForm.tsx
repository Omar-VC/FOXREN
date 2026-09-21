import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../infrastructure/firebase/firebase";
import { CompetenciaForm } from "../../competencias/components/CompetenciaForm";

// 1. Interfaz de Props actualizada
interface TorneoFormProps {
  circuitos: any[];
  organizadorLlaveId: string;
  organizadorId?: string;
  organizadorContacto?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TorneoForm: React.FC<TorneoFormProps> = ({
  circuitos,
  organizadorLlaveId,
  organizadorId,
  organizadorContacto,
  onSuccess,
  onCancel,
}) => {
  // Datos del Torneo
  const [nombre, setNombre] = useState("");
  const [circuitoId, setCircuitoId] = useState("");
  const [sede, setSede] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [premios, setPremios] = useState("");
  const [aliasPago, setAliasPago] = useState("");
  const [cbuPago, setCbuPago] = useState("");
  const [titularCuenta, setTitularCuenta] = useState("");

  // Estados de Control
  const [loading, setLoading] = useState(false);
  const [torneoCreadoId, setTorneoCreadoId] = useState<string | null>(null);
  const [categoriasCreadasCount, setCategoriasCreadasCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!nombre.trim() || !sede.trim()) {
    alert("Completa el nombre y la sede del torneo.");
    return;
  }

  setLoading(true);
  try {
    const docRef = await addDoc(collection(db, "torneos"), {
      nombre: nombre.trim(),
      circuitoId: circuitoId || null,
      sede: sede.trim(),
      fechaInicio: fechaInicio ? new Date(fechaInicio) : serverTimestamp(),
      premios: premios.trim() || "A confirmar",
      datosPago: {
        alias: aliasPago.trim(),
        cbu: cbuPago.trim(),
        titular: titularCuenta.trim(),
      },
      organizadorLlaveId,
      organizadorId: organizadorId || "",
      contactoOrganizador: organizadorContacto || "", // 👈 Guarda "2994630150" en la base de datos
      estado: "PENDIENTE_APROBACION",
      fechaCreacion: serverTimestamp(),
    });

    setTorneoCreadoId(docRef.id);
  } catch (error) {
    console.error("Error al crear el torneo:", error);
    alert("Error al guardar el torneo.");
  } finally {
    setLoading(false);
  }
};

  // ... Resto del JSX y renderizado de formulario / categorías
  return (
    <div className="text-white">
      {!torneoCreadoId ? (
        /* PASO 1: CREAR DATOS GENERALES DEL TORNEO */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre del Torneo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Torneo Aniversario Padel Club"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Sede / Club</label>
              <input
                type="text"
                required
                value={sede}
                onChange={(e) => setSede(e.target.value)}
                placeholder="Ej: Central Padel"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Circuito / Serie (Opcional)</label>
            <select
              value={circuitoId}
              onChange={(e) => setCircuitoId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
            >
              <option value="">Sin Circuito Asociado</option>
              {circuitos.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Detalle de Premios por Categoría</label>
            <textarea
              rows={3}
              value={premios}
              onChange={(e) => setPremios(e.target.value)}
              placeholder="Ej: 8va Masc: $800.000 a repartir / 7ma Fem: Trofeos + Indumentaria de sponsors"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white resize-none"
            />
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider">
              Datos de Cobro (Mercado Pago / Transferencia)
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Alias Mercado Pago</label>
                <input
                  type="text"
                  value={aliasPago}
                  onChange={(e) => setAliasPago(e.target.value)}
                  placeholder="Ej: TORNEOS.PADEL.MP"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">CBU / CVU</label>
                <input
                  type="text"
                  value={cbuPago}
                  onChange={(e) => setCbuPago(e.target.value)}
                  placeholder="Ej: 0000003100012345678901"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Titular de la Cuenta</label>
              <input
                type="text"
                value={titularCuenta}
                onChange={(e) => setTitularCuenta(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition"
            >
              {loading ? "Creando Torneo..." : "Continuar a Cargar Categorías ➔"}
            </button>
          </div>
        </form>
      ) : (
        /* PASO 2: AGREGAR CATEGORÍAS AL TORNEO RECIÉN CREADO */
        <div className="space-y-5">
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-green-400">
              ¡Torneo creado exitosamente!
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Quedó registrado en estado <strong>PENDIENTE DE APROBACIÓN</strong>. Ahora agrega las categorías que competirán.
            </p>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
              Agregar Categoría (#{categoriasCreadasCount + 1})
            </h4>
            <CompetenciaForm
              torneoId={torneoCreadoId}
              onSuccess={() => {
                setCategoriasCreadasCount((prev) => prev + 1);
                alert("Categoría agregada. Puedes agregar otra o finalizar.");
              }}
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Categorías agregadas en esta sesión: <strong>{categoriasCreadasCount}</strong>
            </span>
            <button
              type="button"
              onClick={onSuccess}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition"
            >
              Finalizar Carga del Torneo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};