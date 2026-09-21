import type { Torneo } from '../../domain/torneo/torneo.types';

// Helper para convertir Timestamps de Firestore, objetos planos con segundos o objetos Date
export const formatFechaFirestore = (fechaRaw: any): string => {
  if (!fechaRaw) return 'A confirmar';

  // Si es un Timestamp de Firestore (tiene método toDate)
  if (typeof fechaRaw === 'object' && typeof fechaRaw.toDate === 'function') {
    return fechaRaw.toDate().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si viene como objeto plano de Timestamp (con propiedad seconds)
  if (typeof fechaRaw === 'object' && 'seconds' in fechaRaw) {
    return new Date(fechaRaw.seconds * 1000).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si ya es un objeto Date
  if (fechaRaw instanceof Date) {
    return fechaRaw.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si viene como string
  return String(fechaRaw);
};

export const mapDocToTorneo = (docId: string, data: any): Torneo => {
  return {
    id: docId,
    nombre: data.nombre || 'Torneo sin nombre',
    circuitoId: data.circuitoId || '',
    sede: data.sede || 'Sede a confirmar',
    premios: data.premios || 'A confirmar',
    estado: data.estado || 'INSCRIPCION_ABIERTA',
    validoParaRanking: Boolean(data.validoParaRanking),
    fechaInicio: formatFechaFirestore(data.fechaInicio),
    fechaFin: formatFechaFirestore(data.fechaFin),
    fechaCreacion: formatFechaFirestore(data.fechaCreacion),
    datosPago: {
      alias: data.datosPago?.alias || data.alias || '',
      cbu: data.datosPago?.cbu || data.cbu || '',
      titular: data.datosPago?.titular || data.titular || '',
    },
    // Captura el teléfono o contacto desde cualquiera de sus variantes en Firestore
    contactoOrganizador:
      data.contactoOrganizador ||
      data.telefonoOrganizador ||
      data.telefono ||
      data.celular ||
      '',
    organizadorLlaveId: data.organizadorLlaveId || '',
    organizadorId: data.organizadorId || '',
    comisionPorcentaje: data.comisionPorcentaje || 0,
    gananciaEstimadaFoxren: data.gananciaEstimadaFoxren || 0,
    modalidadPago: data.modalidadPago || 'POR_INSCRIPCION',
  };
};