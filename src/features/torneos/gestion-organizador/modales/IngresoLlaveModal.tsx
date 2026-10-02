import React, { useState } from "react";

interface IngresoLlaveModalProps {
  titulo: string;
  subtitulo: string;
  onValidar: (llave: string) => void;
  onClose: () => void;
}

export const IngresoLlaveModal: React.FC<IngresoLlaveModalProps> = ({
  titulo,
  subtitulo,
  onValidar,
  onClose,
}) => {
  const [llave, setLlave] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!llave.trim()) {
      alert("Por favor ingresa una llave de acceso.");
      return;
    }
    onValidar(llave.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
        <h3 className="text-xl font-bold mb-1 text-blue-400">{titulo}</h3>
        <p className="text-xs text-slate-400 mb-4">{subtitulo}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Llave de Organizador</label>
            <input
              type="password"
              value={llave}
              onChange={(e) => setLlave(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition"
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};