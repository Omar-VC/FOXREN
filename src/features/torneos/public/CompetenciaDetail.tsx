import React from 'react';
import { useParams } from 'react-router-dom';

export const CompetenciaDetail: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-light)] p-6">
      {/* Header translúcido */}
      <header className="flex justify-between items-center px-6 py-4 mb-6 
                         bg-[rgba(39,55,54,0.85)] backdrop-blur-md rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold">Detalle Competencia {id}</h2>
        <button className="bg-[var(--color-primary)] text-[var(--color-light)] px-4 py-2 rounded-lg hover:opacity-90">
          Editar competencia
        </button>
      </header>

      {/* Secciones */}
      <section className="mb-6 p-6 rounded-lg bg-[var(--color-dark)] shadow-[0_0_12px_var(--color-primary)]">
        <h3 className="text-xl font-semibold mb-2 text-[var(--color-primary)]">Partidos programados</h3>
        <p className="text-[var(--color-light)]">Bloque dummy...</p>
      </section>

      <section className="mb-6 p-6 rounded-lg bg-[var(--color-dark)] shadow-[0_0_12px_var(--color-primary)]">
        <h3 className="text-xl font-semibold mb-2 text-[var(--color-primary)]">Lista de inscriptos</h3>
        <p className="text-[var(--color-light)]">Bloque dummy...</p>
      </section>

      <section className="mb-6 p-6 rounded-lg bg-[var(--color-dark)] shadow-[0_0_12px_var(--color-primary)]">
        <h3 className="text-xl font-semibold mb-2 text-[var(--color-primary)]">Información del torneo/circuito</h3>
        <p className="text-[var(--color-light)]">Bloque dummy...</p>
      </section>

      {/* Acciones admin */}
      <section className="p-6 rounded-lg bg-[var(--color-dark)] shadow-[0_0_12px_var(--color-primary)]">
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-primary)]">Acciones admin</h3>
        <button className="bg-[var(--color-primary)] text-[var(--color-light)] px-4 py-2 rounded-lg mr-2 hover:opacity-90">
          Editar
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90">
          Eliminar
        </button>
      </section>
    </div>
  );
};
