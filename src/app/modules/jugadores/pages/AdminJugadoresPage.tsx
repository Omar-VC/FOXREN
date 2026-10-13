import { useJugadores } from "../hooks/useJugadores";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminJugadoresPage() {
  const { jugadores, cargando, error } = useJugadores();
  const [busqueda, setBusqueda] = useState("");

  const jugadoresFiltrados = jugadores.filter((jugador) => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) {
      return true;
    }

    const nombreCompleto =
      `${jugador.nombre} ${jugador.apellido}`.toLowerCase();

    return nombreCompleto.includes(texto) || jugador.dni.includes(texto);
  });

  return (
    <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
      {/* Header y Buscador */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#0f172a" }}>
            Jugadores
          </h1>
          <p
            style={{
              margin: "0.25rem 0 0 0",
              color: "#64748b",
              fontSize: "0.9rem",
            }}
          >
            Administración del padrón de jugadores registrados.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            minWidth: "280px",
            flexGrow: 1,
            maxWidth: "400px",
          }}
        >
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.9rem",
              outline: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Estados de carga, error o sin resultados */}
      {cargando && (
        <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
          Cargando jugadores...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {!cargando && !error && jugadores.length === 0 && (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            color: "#64748b",
          }}
        >
          No hay jugadores registrados en el sistema.
        </div>
      )}

      {!cargando &&
        !error &&
        jugadores.length > 0 &&
        jugadoresFiltrados.length === 0 && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              color: "#64748b",
            }}
          >
            No se encontraron jugadores que coincidan con "
            <strong>{busqueda}</strong>".
          </div>
        )}

      {/* Tabla / Tarjetas de Jugadores */}
      {!cargando && jugadoresFiltrados.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#64748b",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ padding: "0.75rem 1rem" }}>Jugador</th>
                <th style={{ padding: "0.75rem 1rem" }}>DNI</th>
                <th style={{ padding: "0.75rem 1rem" }}>Ubicación</th>
                <th style={{ padding: "0.75rem 1rem" }}>Categoría</th>
                <th style={{ padding: "0.75rem 1rem" }}>Lado</th>
                <th style={{ padding: "0.75rem 1rem" }}>Estado</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {jugadoresFiltrados.map((jugador) => (
                <tr
                  key={jugador.id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {jugador.nombre} {jugador.apellido}
                  </td>
                  <td style={{ padding: "0.875rem 1rem", color: "#475569" }}>
                    {jugador.dni}
                  </td>
                  <td style={{ padding: "0.875rem 1rem", color: "#475569" }}>
                    {jugador.ciudad}, {jugador.provincia}
                  </td>
                  <td style={{ padding: "0.875rem 1rem", color: "#475569" }}>
                    {jugador.categoriaDeclarada}ª
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      color: "#475569",
                      textTransform: "capitalize",
                    }}
                  >
                    {jugador.ladoJuego}
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor:
                          jugador.estado === "activo"
                            ? "#dcfce7"
                            : jugador.estado === "inactivo"
                              ? "#fee2e2"
                              : "#f1f5f9",
                        color:
                          jugador.estado === "activo"
                            ? "#166534"
                            : jugador.estado === "inactivo"
                              ? "#991b1b"
                              : "#475569",
                        textTransform: "capitalize",
                      }}
                    >
                      {jugador.estado}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                    <Link
                      to={`/admin/jugadores/${jugador.id}`}
                      style={{
                        color: "#0284c7",
                        fontWeight: 600,
                        textDecoration: "none",
                        fontSize: "0.85rem",
                      }}
                    >
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
