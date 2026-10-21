import { useSolicitudesRegistro } from "../hooks/useSolicitudesRegistro";

export default function AdminSolicitudesRegistroPage() {
  const {
    solicitudes,
    cargando,
    procesando,
    error,
    aprobarSolicitud,
    rechazarSolicitud,
  } = useSolicitudesRegistro();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="admin-page-title">Solicitudes de registro</h1>
        <p className="admin-page-description">
          Administrá y autoriza el ingreso de nuevos jugadores al sistema.
        </p>
      </div>

      {cargando && <p className="text-muted">Cargando solicitudes...</p>}

      {error && <p className="text-red-500 font-medium">{error}</p>}

      {!cargando && !error && solicitudes.length === 0 && (
        <div className="fox-card text-center py-8">
          <p className="text-muted">No hay solicitudes pendientes en este momento.</p>
        </div>
      )}

      {!cargando && solicitudes.length > 0 && (
        <div className="fox-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Jugador</th>
                <th>DNI</th>
                <th>Ubicación</th>
                <th>Categoría / Lado</th>
                <th>Publicación perfil</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => {
                const isProcessing = procesando === solicitud.id;

                return (
                  <tr key={solicitud.id}>
                    <td>
                      <span className="font-bold text-white block">
                        {solicitud.nombre} {solicitud.apellido}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-[var(--color-text-muted)]">
                      {solicitud.dni}
                    </td>
                    <td>
                      {solicitud.ciudad}, {solicitud.provincia}
                    </td>
                    <td>
                      <span className="font-medium">{solicitud.categoriaDeclarada}</span>{" "}
                      <span className="text-xs text-[var(--color-text-muted)]">({solicitud.ladoJuego})</span>
                    </td>
                    <td className="text-xs text-[var(--color-text-muted)] max-w-xs truncate">
                      {solicitud.autorizaPublicacionPerfil === true &&
                      solicitud.origenDecisionPublicacion === "formulario_publico" &&
                      solicitud.fechaDecisionPublicacion
                        ? `Solicitada${solicitud.autorizaPublicacionApodo ? " (con apodo)" : ""}`
                        : solicitud.autorizaPublicacionPerfil === false &&
                          solicitud.origenDecisionPublicacion === "formulario_publico"
                        ? "No autorizada"
                        : "Sin decisión"}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)]">
                        {solicitud.estado}
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        type="button"
                        className="py-1.5 px-3 rounded-md bg-[var(--color-primary)] text-white font-semibold text-xs transition-all hover:brightness-110 disabled:opacity-50"
                        onClick={() => aprobarSolicitud(solicitud)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "..." : "Aprobar"}
                      </button>
                      <button
                        type="button"
                        className="py-1.5 px-3 rounded-md bg-transparent border border-[var(--color-danger)] text-[var(--color-danger)] font-semibold text-xs transition-all hover:bg-[var(--color-danger)] hover:text-white disabled:opacity-50"
                        onClick={() => rechazarSolicitud(solicitud)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "..." : "Rechazar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}