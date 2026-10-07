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
    <section>
      <h1>Solicitudes de registro</h1>

      {cargando && <p>Cargando solicitudes...</p>}

      {error && <p>{error}</p>}

      {!cargando && !error && solicitudes.length === 0 && (
        <p>No hay solicitudes pendientes.</p>
      )}

      {!cargando && solicitudes.length > 0 && (
        <div>
          {solicitudes.map((solicitud) => (
            <article key={solicitud.id}>
              <h2>
                {solicitud.nombre} {solicitud.apellido}
              </h2>

              <p>DNI: {solicitud.dni}</p>

              <p>
                Ciudad: {solicitud.ciudad},{" "}
                {solicitud.provincia}
              </p>

              <p>
                Categoría declarada:{" "}
                {solicitud.categoriaDeclarada}
              </p>

              <p>
                Lado: {solicitud.ladoJuego}
              </p>

              <p>
                Estado: {solicitud.estado}
              </p>

              <button
                type="button"
                onClick={() => aprobarSolicitud(solicitud)}
                disabled={procesando === solicitud.id}
              >
                {procesando === solicitud.id
                  ? "Aprobando..."
                  : "Aprobar"}
              </button>
              <button
                type="button"
                onClick={() => rechazarSolicitud(solicitud)}
                disabled={procesando === solicitud.id}
              >
                {procesando === solicitud.id
                  ? "Rechazando..."
                  : "Rechazar"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}