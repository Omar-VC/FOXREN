import React from "react";
import { JugadorForm } from "../../jugadores/components/JugadorForm";

export const UnirsePage: React.FC = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Unirse al sistema FOXREN</h1>
      <p className="text-gray-300 mb-6">
        Completa el formulario para registrarte como jugador oficial en FOXREN. 
        Tu solicitud será revisada por el administrador antes de ser aceptada.
      </p>
      <JugadorForm />
    </div>
  );
};

