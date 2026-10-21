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
    return <p>Cargando jugador...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!jugador) {
    return <p>Jugador no encontrado.</p>;
  }

  if (editando) {
    return (
      <section>
        <h1>Editar jugador</h1>

        <JugadorForm
          jugador={jugador}
          guardando={guardando}
          onGuardar={async (datos) => {
            await actualizarJugador(datos);
            setEditando(false);
          }}
          onCancelar={() => setEditando(false)}
        />
      </section>
    );
  }

  return (
    <section>
      <h1>
        {jugador.nombre} {jugador.apellido}
      </h1>

      <p>DNI: {jugador.dni}</p>

      <p>
        Apodo: {jugador.apodo || "Sin apodo"}
      </p>

      <p>Sexo: {jugador.sexo}</p>

      <p>Ciudad: {jugador.ciudad}</p>

      <p>Provincia: {jugador.provincia}</p>

      <p>Lado de juego: {jugador.ladoJuego}</p>

      <p>
        Categoría declarada:{" "}
        {jugador.categoriaDeclarada}
      </p>

      <p>Estado: {jugador.estado}</p>

      <section aria-labelledby="consentimiento-publicacion">
        <h2 id="consentimiento-publicacion">Consentimiento de publicación</h2>
        <p>
          Estado: {jugador.consentimientoPublicacion?.estado ?? "sin_decision"}
        </p>
        <p>
          La respuesta del formulario público es una declaración del remitente;
          no demuestra por sí sola la identidad del titular. No hay publicación
          activa de perfiles.
        </p>

        {jugador.consentimientoPublicacion?.estado === "pendiente_verificacion" && (
          <div>
            <label>
              Medio externo usado para verificar a la persona
              <input
                value={metodoVerificacion}
                onChange={(event) => setMetodoVerificacion(event.target.value)}
                maxLength={120}
                placeholder="Describir el medio de verificación"
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={confirmoVerificacion}
                onChange={(event) => setConfirmoVerificacion(event.target.checked)}
              />
              Confirmo que verifiqué externamente que el titular autorizó esta publicación.
            </label>
            <button
              type="button"
              onClick={() => void verificarConsentimiento()}
              disabled={procesandoConsentimiento || !confirmoVerificacion || metodoVerificacion.trim().length < 3}
            >
              {procesandoConsentimiento ? "Registrando..." : "Confirmar verificación"}
            </button>
          </div>
        )}

        {jugador.consentimientoPublicacion?.autorizaPerfil === true &&
          jugador.consentimientoPublicacion.estado !== "revocado" && (
            <div>
              <label>
                Medio por el que se recibió y verificó el retiro
                <input
                  value={metodoRetiro}
                  onChange={(event) => setMetodoRetiro(event.target.value)}
                  maxLength={120}
                  placeholder="Describir el medio de recepción/verificación"
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={confirmoRetiro}
                  onChange={(event) => setConfirmoRetiro(event.target.checked)}
                />
                Confirmo que recibí y verifiqué externamente el retiro del titular.
              </label>
              <button
                type="button"
                onClick={() => void revocarConsentimiento()}
                disabled={procesandoConsentimiento || !confirmoRetiro || metodoRetiro.trim().length < 3}
              >
                {procesandoConsentimiento ? "Registrando..." : "Registrar retiro y revocar"}
              </button>
            </div>
          )}

        {errorConsentimiento && <p role="alert">{errorConsentimiento}</p>}
        {mensajeConsentimiento && <p role="status">{mensajeConsentimiento}</p>}
      </section>

      <button
        type="button"
        onClick={() => setEditando(true)}
      >
        Editar jugador
      </button>
    </section>
  );
}
