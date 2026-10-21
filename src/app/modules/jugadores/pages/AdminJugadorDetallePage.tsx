import { useState } from "react";
import { useParams } from "react-router-dom";

import { useJugador } from "../hooks/useJugador";
import JugadorForm from "../components/JugadorForm";
import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";

export default function AdminJugadorDetallePage() {
  const { id } = useParams();

  const {
    jugador,
    cargando,
    error,
    guardando,
    actualizarJugador,
    recargar,
  } = useJugador(id);

  const [editando, setEditando] = useState(false);
  const [metodoVerificacion, setMetodoVerificacion] = useState("");
  const [confirmoVerificacion, setConfirmoVerificacion] = useState(false);
  const [metodoRetiro, setMetodoRetiro] = useState("");
  const [confirmoRetiro, setConfirmoRetiro] = useState(false);
  const [procesandoConsentimiento, setProcesandoConsentimiento] = useState(false);
  const [errorConsentimiento, setErrorConsentimiento] = useState<string | null>(null);
  const [mensajeConsentimiento, setMensajeConsentimiento] = useState<string | null>(null);

  async function verificarConsentimiento() {
    if (!id || !confirmoVerificacion) return;
    try {
      setProcesandoConsentimiento(true);
      setErrorConsentimiento(null);
      await jugadoresRepository.verificarConsentimientoPublicacion(
        id,
        metodoVerificacion,
      );
      setMensajeConsentimiento("Consentimiento verificado y registrado. El perfil no se publicó.");
      setMetodoVerificacion("");
      setConfirmoVerificacion(false);
      await recargar();
    } catch (error) {
      setErrorConsentimiento(
        error instanceof Error ? error.message : "No se pudo verificar el consentimiento.",
      );
    } finally {
      setProcesandoConsentimiento(false);
    }
  }

  async function revocarConsentimiento() {
    if (!id || !confirmoRetiro) return;
    try {
      setProcesandoConsentimiento(true);
      setErrorConsentimiento(null);
      await jugadoresRepository.revocarConsentimientoPublicacion(id, metodoRetiro);
      setMensajeConsentimiento("Retiro registrado. El historial deportivo privado se conserva.");
      setMetodoRetiro("");
      setConfirmoRetiro(false);
      await recargar();
    } catch (error) {
      setErrorConsentimiento(
        error instanceof Error ? error.message : "No se pudo registrar el retiro.",
      );
    } finally {
      setProcesandoConsentimiento(false);
    }
  }

  if (cargando) {
    return <section className="p-6 text-center"><p className="text-muted">Cargando jugador...</p></section>;
  }

  if (error) {
    return <section className="p-6 text-center"><p className="text-red-500 font-medium">{error}</p></section>;
  }

  if (!jugador) {
    return <section className="p-6 text-center"><p className="text-muted">Jugador no encontrado.</p></section>;
  }

  if (editando) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="admin-page-title">Editar jugador</h1>
          <p className="admin-page-description">Modificá los datos del perfil oficial.</p>
        </div>
        <div className="fox-card">
          <JugadorForm
            jugador={jugador}
            guardando={guardando}
            onGuardar={async (datos) => {
              await actualizarJugador(datos);
              setEditando(false);
            }}
            onCancelar={() => setEditando(false)}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Cabecera de la página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="admin-page-title m-0">
              {jugador.nombre} {jugador.apellido}
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)]">
              {jugador.estado}
            </span>
          </div>
          <p className="admin-page-description mt-1">
            Apodo: <strong className="text-white">{jugador.apodo || "Sin apodo"}</strong> | DNI: <span className="font-mono">{jugador.dni}</span>
          </p>
        </div>
        <button
          type="button"
          className="fox-button-primary self-start sm:self-auto"
          onClick={() => setEditando(true)}
        >
          Editar Jugador
        </button>
      </div>

      {/* Grid de Información Personal y Deportiva */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta de Datos Personales */}
        <div className="fox-card space-y-3">
          <h2 className="text-base font-bold text-white border-b border-[var(--color-border)] pb-2 m-0">
            Información Personal
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)]">Sexo</span>
              <span className="text-white font-medium">{jugador.sexo}</span>
            </div>
            <div>
              <span className="block text-xs text-[var(--color-text-muted)]">Ubicación</span>
              <span className="text-white font-medium">{jugador.ciudad}, {jugador.provincia}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Datos Deportivos */}
        <div className="fox-card space-y-3">
          <h2 className="text-base font-bold text-white border-b border-[var(--color-border)] pb-2 m-0">
            Perfil Deportivo
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="block text-xs text-[var(--color-text-muted)]">Categoría Declarada</span>
              <span className="text-white font-medium">{jugador.categoriaDeclarada}</span>
            </div>
            <div>
              <span className="block text-xs text-[var(--color-text-muted)]">Lado de Juego</span>
              <span className="text-white font-medium">{jugador.ladoJuego}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Consentimiento de Publicación */}
      <div className="fox-card space-y-4">
        <div className="border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white m-0">Consentimiento de Publicación</h2>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--color-bg-surface)] text-[var(--color-accent)] border border-[var(--color-border)]">
              Estado: {jugador.consentimientoPublicacion?.estado ?? "sin_decision"}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
            La respuesta del formulario público es una declaración del remitente; no demuestra por sí sola la identidad del titular. No hay publicación activa de perfiles.
          </p>
        </div>

        {/* Formulario de Verificación si está pendiente */}
        {jugador.consentimientoPublicacion?.estado === "pendiente_verificacion" && (
          <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-[var(--color-border)] space-y-4">
            <h3 className="text-sm font-bold text-white m-0">Acción requerida: Verificar Consentimiento</h3>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[var(--color-text-muted)]">
                Medio externo usado para verificar a la persona
                <input
                  className="mt-1 w-full p-2.5 rounded-lg bg-[#17141a] border border-[var(--color-border)] text-white text-sm focus:border-[var(--color-accent)] outline-none"
                  value={metodoVerificacion}
                  onChange={(event) => setMetodoVerificacion(event.target.value)}
                  maxLength={120}
                  placeholder="Ej: Llamada telefónica, WhatsApp, DNI presencial..."
                />
              </label>
              <label className="flex items-start gap-2.5 text-xs text-white font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 accent-[var(--color-accent)] rounded"
                  checked={confirmoVerificacion}
                  onChange={(event) => setConfirmoVerificacion(event.target.checked)}
                />
                Confirmo que verifiqué externamente que el titular autorizó esta publicación.
              </label>
              <button
                type="button"
                className="fox-button-primary w-full sm:w-auto"
                onClick={() => void verificarConsentimiento()}
                disabled={procesandoConsentimiento || !confirmoVerificacion || metodoVerificacion.trim().length < 3}
              >
                {procesandoConsentimiento ? "Registrando..." : "Confirmar verificación"}
              </button>
            </div>
          </div>
        )}

        {/* Formulario de Retiro si está activo */}
        {jugador.consentimientoPublicacion?.autorizaPerfil === true &&
          jugador.consentimientoPublicacion.estado !== "revocado" && (
            <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-[var(--color-border)] space-y-4">
              <h3 className="text-sm font-bold text-white m-0">Revocar Consentimiento</h3>
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--color-text-muted)]">
                  Medio por el que se recibió y verificó el retiro
                  <input
                    className="mt-1 w-full p-2.5 rounded-lg bg-[#17141a] border border-[var(--color-border)] text-white text-sm focus:border-[var(--color-accent)] outline-none"
                    value={metodoRetiro}
                    onChange={(event) => setMetodoRetiro(event.target.value)}
                    maxLength={120}
                    placeholder="Describir el medio de recepción/verificación"
                  />
                </label>
                <label className="flex items-start gap-2.5 text-xs text-white font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 accent-[var(--color-accent)] rounded"
                    checked={confirmoRetiro}
                    onChange={(event) => setConfirmoRetiro(event.target.checked)}
                  />
                  Confirmo que recibí y verifiqué externamente el retiro del titular.
                </label>
                <button
                  type="button"
                  className="py-2 px-4 rounded-[0.7rem] bg-transparent border border-[var(--color-danger)] text-[var(--color-danger)] font-semibold text-sm transition-all hover:bg-[var(--color-danger)] hover:text-white disabled:opacity-50"
                  onClick={() => void revocarConsentimiento()}
                  disabled={procesandoConsentimiento || !confirmoRetiro || metodoRetiro.trim().length < 3}
                >
                  {procesandoConsentimiento ? "Registrando..." : "Registrar retiro y revocar"}
                </button>
              </div>
            </div>
          )}

        {errorConsentimiento && <p className="text-red-500 text-xs font-medium" role="alert">{errorConsentimiento}</p>}
        {mensajeConsentimiento && <p className="text-green-400 text-xs font-medium" role="status">{mensajeConsentimiento}</p>}
      </div>
    </section>
  );
}