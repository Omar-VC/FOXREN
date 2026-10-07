import { useEffect, useState } from "react";

import { solicitudesRegistroRepository } from "../../../../infrastructure/repositories/solicitudesRegistroRepository";
import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";

import type { SolicitudRegistro } from "../../../../domain/SolicitudRegistro/solicitudRegistro.types";

export function useSolicitudesRegistro() {
  const [solicitudes, setSolicitudes] = useState<SolicitudRegistro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargarSolicitudes() {
    try {
      setCargando(true);
      setError(null);

      const datos = await solicitudesRegistroRepository.obtenerPendientes();

      setSolicitudes(datos);
    } catch {
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  }

  async function aprobarSolicitud(solicitud: SolicitudRegistro) {
    try {
      setProcesando(solicitud.id);
      setError(null);

      await jugadoresRepository.crearDesdeSolicitud(solicitud);

      await solicitudesRegistroRepository.cambiarEstado(
        solicitud.id,
        "aprobada",
      );

      await cargarSolicitudes();
    } catch (error) {
      console.error("Error al aprobar solicitud:", error);
      setError("No se pudo aprobar la solicitud.");
    } finally {
      setProcesando(null);
    }
  }

  async function rechazarSolicitud(solicitud: SolicitudRegistro) {
    try {
      setProcesando(solicitud.id);
      setError(null);

      await solicitudesRegistroRepository.cambiarEstado(
        solicitud.id,
        "rechazada",
      );

      await cargarSolicitudes();
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      setError("No se pudo rechazar la solicitud.");
    } finally {
      setProcesando(null);
    }
  }

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  return {
    solicitudes,
    cargando,
    procesando,
    error,
    cargarSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud,
  };
}
