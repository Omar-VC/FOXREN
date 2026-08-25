import React, { useState } from "react";

export const CompetenciaForm: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("Inscripciones abiertas");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Por ahora solo mostramos en consola
    console.log({ nombre, fecha, estado });
    alert(`Competencia creada: ${nombre}`);
    setNombre("");
    setFecha("");
    setEstado("Inscripciones abiertas");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[rgba(255,255,255,0.05)] p-6 rounded-lg shadow-md max-w-md"
    >
      <h2 className="text-xl font-bold text-[var(--color-primary-light)] mb-4">
        Crear Competencia
      </h2>

      <div className="mb-3">
        <label className="block text-gray-300 mb-1">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-300 mb-1">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-300 mb-1">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white"
        >
          <option>Inscripciones abiertas</option>
          <option>En curso</option>
          <option>Finalizado</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-[var(--color-primary)] text-[var(--color-light)] px-4 py-2 rounded-lg hover:opacity-90"
      >
        Guardar
      </button>
    </form>
  );
};
