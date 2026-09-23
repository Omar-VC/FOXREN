import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../../assets/logo.svg";

export const InicioPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
      {/* Hero Section / Logo Central */}
      <div className="relative mb-8 group">
        {/* Resplandor Neón de Fondo */}
        <div className="absolute -inset-4 bg-fox-neon/20 rounded-full blur-xl group-hover:bg-fox-neon/30 transition-all duration-500"></div>
        
        <img
          src={Logo}
          alt="Logo FOXREN"
          className="relative h-28 md:h-36 w-auto drop-shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Titulares */}
      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight max-w-2xl leading-tight">
        Bienvenido a <span className="text-fox-neon drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">FOXREN</span>
      </h1>
      
      <p className="mt-4 text-base md:text-xl text-fox-muted max-w-xl font-medium leading-relaxed">
        Plataforma integral de alto rendimiento para organizar, competir y gestionar tus circuitos deportivos sin complicaciones.
      </p>

      {/* Botones de Acción (CTAs) */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md justify-center">
        <Link
          to="/torneos"
          className="bg-fox-neon hover:bg-emerald-400 text-fox-bg font-bold px-6 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-fox-glow flex items-center justify-center gap-2 cursor-pointer"
        >
          🏆 Ver Torneos Activos
        </Link>
        <Link
          to="/circuitos"
          className="bg-fox-surface hover:bg-fox-card text-slate-200 border border-fox-border font-semibold px-6 py-3.5 rounded-xl text-sm transition-all duration-200 hover:border-fox-subtle flex items-center justify-center gap-2 cursor-pointer"
        >
          🌐 Explorar Circuitos
        </Link>
      </div>

      {/* Grid de Destacados / Métricas Rápidas */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl text-left">
        <div className="bg-fox-surface/80 border border-fox-border/60 p-5 rounded-2xl">
          <div className="text-fox-neon text-2xl font-black mb-1">⚡ Gestión Realtime</div>
          <p className="text-xs text-fox-muted">
            Actualización inmediata de cuadros, resultados y zonas de juego en tiempo real.
          </p>
        </div>

        <div className="bg-fox-surface/80 border border-fox-border/60 p-5 rounded-2xl">
          <div className="text-fox-accent text-2xl font-black mb-1">🥇 Ranking Oficial</div>
          <p className="text-xs text-fox-muted">
            Sistemas de puntos automatizados por categorías y seguimiento de jugadores.
          </p>
        </div>

        <div className="bg-fox-surface/80 border border-fox-border/60 p-5 rounded-2xl">
          <div className="text-fox-neon text-2xl font-black mb-1">🔒 Llaves de Control</div>
          <p className="text-xs text-fox-muted">
            Acceso seguro y exclusivo para organizadores mediante llaves de autenticación.
          </p>
        </div>
      </div>
    </div>
  );
};
