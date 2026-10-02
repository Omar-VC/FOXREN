import React, { useState } from 'react';
import { useInscripcionPareja } from '../hooks/useInscripcionPareja';
import { DniSearchStep } from './steps/DniSearchStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { PaymentStep } from './steps/PaymentStep';

interface InscripcionParejaModalProps {
  competencia: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const InscripcionParejaModal: React.FC<InscripcionParejaModalProps> = ({
  competencia,
  onClose,
  onSuccess,
}) => {
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);
  const [restriccionHoraria, setRestriccionHoraria] = useState('');

  const {
    j1,
    setJ1,
    j2,
    setJ2,
    comprobantePago,
    setComprobantePago,
    precioCalculado,
    aliasPago,
    aliasCopiado,
    loadingBusqueda,
    loadingGuardado,
    errorMsg,
    setErrorMsg,
    copiarAlias,
    buscarJugadores,
    handleSubmit,
  } = useInscripcionPareja(competencia, onSuccess);

  const handleBuscarYAvanzar = async () => {
    const ok = await buscarJugadores();
    if (ok) setPasoActual(2);
  };

  const handleValidarYIrAPago = () => {
    if (!j1.nombre.trim() || !j1.apellido.trim() || !j2.nombre.trim() || !j2.apellido.trim()) {
      setErrorMsg('Completá nombre y apellido de ambos jugadores.');
      return;
    }
    if (!j1.telefono || !j2.telefono) {
      setErrorMsg('Ingresá WhatsApp de contacto para ambos jugadores.');
      return;
    }
    setErrorMsg(null);
    setPasoActual(3);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-fox-surface border border-fox-border rounded-2xl p-5 text-slate-100 max-w-lg w-full max-h-[90vh] flex flex-col relative shadow-2xl">
        
        {/* Header Modal */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-fox-muted hover:text-white font-bold cursor-pointer"
        >
          ✕
        </button>

        <div className="shrink-0 mb-4 border-b border-fox-border pb-3 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-md border border-emerald-500/20">
              Paso {pasoActual} de 3
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            {competencia?.categoria || competencia?.nombre || 'Inscripción de Pareja'}
          </h3>
        </div>

        {/* Banner Error */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-xs p-3 rounded-xl mb-3">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Renderizado dinámico de los Steps */}
        <div className="overflow-y-auto flex-1 pr-1">
          {pasoActual === 1 && (
            <DniSearchStep
              dniJ1={j1.dni}
              dniJ2={j2.dni}
              onChangeDni1={(val) => setJ1({ ...j1, dni: val })}
              onChangeDni2={(val) => setJ2({ ...j2, dni: val })}
              onSearch={handleBuscarYAvanzar}
              loading={loadingBusqueda}
              onCancel={onClose}
            />
          )}

          {pasoActual === 2 && (
            <ScheduleStep
              j1={j1}
              j2={j2}
              onChangeJ1={(field, val) => setJ1({ ...j1, [field]: val })}
              onChangeJ2={(field, val) => setJ2({ ...j2, [field]: val })}
              restriccionHoraria={restriccionHoraria}
              onChangeRestriccion={setRestriccionHoraria}
              onNext={handleValidarYIrAPago}
              onBack={() => setPasoActual(1)}
            />
          )}

          {pasoActual === 3 && (
            <PaymentStep
              precio={precioCalculado}
              alias={aliasPago}
              aliasCopiado={aliasCopiado}
              onCopiarAlias={copiarAlias}
              comprobante={comprobantePago}
              onChangeComprobante={setComprobantePago}
              onSubmit={(e) => handleSubmit(e, restriccionHoraria)}
              onBack={() => setPasoActual(2)}
              loading={loadingGuardado}
            />
          )}
        </div>
      </div>
    </div>
  );
};