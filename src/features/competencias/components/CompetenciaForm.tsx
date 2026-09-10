// src/features/competencias/components/CompetenciaForm.tsx

import React, { useState } from "react";
import type { EstadoCompetencia, GeneroCompetencia } from "../../../domain/competencia/competencia.types";
import { validarDatosCompetencia } from "../../../domain/competencia/competencia.rules";
import { competenciasRepository } from "../../../infrastructure/repositories/competenciasRepository";

interface CompetenciaFormProps {
  torneoId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CompetenciaForm: React.FC<CompetenciaFormProps> = ({
  torneoId,
  onSuccess,
  onCancel,
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("OCTAVA");
  const [genero, setGenero] = useState<GeneroCompetencia>("MASCULINO");
  const [cupoMaximoParejas, setCupoMaximoParejas] = useState<number>(16);
  const [precioInscripcionBase, setPrecioInscripcionBase] = useState<number>(0);
  const [parejasClasificanPorZona, setParejasClasificanPorZona] = useState<number>(2);

  const [errores, setErrores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);

    const estadoInicial: EstadoCompetencia = "inscripciones_abiertas";

    const nuevaCompetencia = {
      torneoId,
      nombre,
      descripcion,
      categoriaId,
      genero,
      cupoMaximoParejas: Number(cupoMaximoParejas),
      precioInscripcionBase: Number(precioInscripcionBase),
      parejasClasificanPorZona: Number(parejasClasificanPorZona),
      estado: estadoInicial,
    };

    // Validar usando las reglas del dominio
    const validacion = validarDatosCompetencia(nuevaCompetencia);

    if (!validacion.esValido) {
      setErrores(validacion.errores);
      return;
    }

    try {
      setCargando(true);
      
      // Guardado real en Firestore a través del repositorio
      await competenciasRepository.crearCompetencia({
        ...nuevaCompetencia,
        fechaInicio: new Date(),
        fechaFin: new Date(),
      });

      alert(`Categoría/Competencia "${nombre}" configurada y guardada correctamente.`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al guardar la competencia:", error);
      setErrores(["Ocurrió un error al intentar guardar la competencia en la base de datos."]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 p-6 rounded-[var(--border-radius)] shadow-[var(--shadow-card)] max-w-xl mx-auto space-y-4"
    >
      <h2 className="text-xl font-bold text-[var(--color-primary-light)] border-b border-gray-800 pb-2">
        + Nueva Categoría / Competencia
      </h2>

      {errores.length > 0 && (
        <div className="bg-red-900/40 border border-red-500 text-red-200 text-sm p-3 rounded space-y-1">
          {errores.map((err, idx) => (
            <p key={idx}>• {err}</p>
          ))}
        </div>
      )}

      {/* Nombre comercial */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1">
          Nombre de la Competencia (ej: "4ta Masculino")
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: 5ta Caballeros B"
          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 text-sm focus:outline-none focus:border-[var(--color-primary)]"
          required
        />
      </div>

      {/* Descripción opcional */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1">
          Descripción o Aclaraciones (Opcional)
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Se juega con bola rápida en canchas cubiertas."
          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 text-sm focus:outline-none resize-none h-16"
        />
      </div>

      {/* Grid: Categoría Oficial y Género */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Categoría Oficial
          </label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 text-sm focus:outline-none"
          >
            <option value="PRIMERA">Primera</option>
            <option value="SEGUNDA">Segunda</option>
            <option value="TERCERA">Tercera</option>
            <option value="CUARTA">Cuarta</option>
            <option value="QUINTA">Quinta</option>
            <option value="SEXTA">Sexta</option>
            <option value="SEPTIMA">Séptima</option>
            <option value="OCTAVA">Octava</option>
            <option value="SUMA_11">Suma 11</option>
            <option value="SUMA_13">Suma 13</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Rama / Género
          </label>
          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value as GeneroCompetencia)}
            className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 text-sm focus:outline-none"
          >
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
            <option value="MIXTO">Mixto</option>
          </select>
        </div>
      </div>

      {/* Grid: Cupo y Precio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Cupo Máximo de Parejas
          </label>
          <input
            type="number"
            min="2"
            max="64"
            value={cupoMaximoParejas}
            onChange={(e) => setCupoMaximoParejas(Number(e.target.value))}
            className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 text-sm focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Precio Inscripción por Pareja ($)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            value={precioInscripcionBase}
            onChange={(e) => setPrecioInscripcionBase(Number(e.target.value))}
            className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 text-sm focus:outline-none"
            required
          />
        </div>
      </div>

      {/* Clasificados por Zona */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1">
          Parejas que clasifican por Zona a Playoffs
        </label>
        <select
          value={parejasClasificanPorZona}
          onChange={(e) => setParejasClasificanPorZona(Number(e.target.value))}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 text-sm focus:outline-none"
        >
          <option value={1}>1 pareja por zona</option>
          <option value={2}>2 parejas por zona (Estándar)</option>
        </select>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
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
          className="px-5 py-2 rounded bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-sm font-bold transition shadow"
        >
          {cargando ? "Guardando..." : "Guardar Categoría"}
        </button>
      </div>
    </form>
  );
};