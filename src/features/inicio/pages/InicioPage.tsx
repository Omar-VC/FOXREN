import React from "react";
import Logo from "../../../assets/logo.svg";

export const InicioPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[rgba(39,55,54,0.85)]">
      <img
        src={Logo}
        alt="Logo FOXREN"
        className="h-24 w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] animate-pulse"
      />
      <h1 className="mt-6 text-3xl font-bold text-white">
        Bienvenido a FOXREN
      </h1>
      <p className="mt-2 text-lg text-gray-300">
        Organizá tu circuito de pádel de forma simple.
      </p>
    </div>
  );
};
