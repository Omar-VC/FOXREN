import { useState } from "react";

import type { Competencia } from "../../../../domain/competencia/competencia.types";
import { useCategorias } from "../../categorias/hooks/useCategorias";

interface Props {
  torneoId: string;
  creando: boolean;
  onCrear: (datos: Omit<Competencia, "id">) => Promise<void>;
}

export default function CompetenciaForm({ torneoId, creando, onCrear }: Props) {
  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [tipoReglaCategoria, setTipoReglaCategoria] =
    useState<Competencia["tipoReglaCategoria"]>("individual");

  const [valorReglaCategoria, setValorReglaCategoria] = useState(0);
  const [genero, setGenero] = useState<Competencia["genero"]>("MASCULINO");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cupoMaximoParejas, setCupoMaximoParejas] = useState(16);
  const [precioInscripcionPorPareja, setPrecioInscripcionPorPareja] =
    useState(0);

  const { categorias, cargando: cargandoCategorias } = useCategorias();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await onCrear({
      torneoId,
      nombre,
      categoriaId,
      genero,
      estado: "borrador",
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      cupoMaximoParejas,
      precioInscripcionPorPareja,
      tipoReglaCategoria,
      formato: "zonas_eliminacion_directa",
      valorReglaCategoria,
    });

    setNombre("");
    setCategoriaId("");
    setGenero("MASCULINO");
    setFechaInicio("");
    setFechaFin("");
    setCupoMaximoParejas(16);
    setPrecioInscripcionPorPareja(0);
    setTipoReglaCategoria("individual");
    setValorReglaCategoria(0);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre de la competencia</label>

        <input
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Ej: 5ta Masculino"
          required
        />
      </div>

      <div>
        <label>Tipo de categoría</label>

        <select
          value={tipoReglaCategoria}
          onChange={(event) =>
            setTipoReglaCategoria(
              event.target.value as Competencia["tipoReglaCategoria"],
            )
          }
        >
          <option value="individual">Individual</option>
          <option value="suma">Suma</option>
        </select>
      </div>

      <div>
        <label htmlFor="formato">Formato de competencia</label>

        <select id="formato" value="zonas_eliminacion_directa" disabled>
          <option value="zonas_eliminacion_directa">
            Zonas + eliminación directa
          </option>
        </select>
      </div>

      {tipoReglaCategoria === "individual" && (
        <div>
          <label>Categoría</label>

          <select
            value={categoriaId}
            onChange={(event) => {
              const id = event.target.value;
              setCategoriaId(id);

              const categoriaSeleccionada = categorias.find(
                (categoria) => categoria.id === id,
              );

              if (categoriaSeleccionada) {
                const numero = parseInt(categoriaSeleccionada.nombre, 10);

                if (!Number.isNaN(numero)) {
                  setValorReglaCategoria(numero);
                }
              }
            }}
            required
            disabled={cargandoCategorias}
          >
            <option value="">
              {cargandoCategorias
                ? "Cargando categorías..."
                : "Seleccionar categoría"}
            </option>

            {categorias
              .filter((categoria) => categoria.estado === "activa")
              .map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
          </select>
        </div>
      )}

      {tipoReglaCategoria === "suma" && (
        <div>
          <label>Suma de categorías</label>

          <input
            type="number"
            min="1"
            value={valorReglaCategoria || ""}
            onChange={(event) =>
              setValorReglaCategoria(Number(event.target.value))
            }
            placeholder="Ej: 13"
            required
          />
        </div>
      )}

      <div>
        <label>Género</label>

        <select
          value={genero}
          onChange={(event) =>
            setGenero(event.target.value as Competencia["genero"])
          }
        >
          <option value="MASCULINO">Masculino</option>

          <option value="FEMENINO">Femenino</option>

          <option value="MIXTO">Mixto</option>
        </select>
      </div>

      <div>
        <label>Fecha de inicio</label>

        <input
          type="date"
          value={fechaInicio}
          onChange={(event) => setFechaInicio(event.target.value)}
          required
        />
      </div>

      <div>
        <label>Fecha de fin</label>

        <input
          type="date"
          value={fechaFin}
          onChange={(event) => setFechaFin(event.target.value)}
          required
        />
      </div>

      <div>
        <label>Cupo máximo de parejas</label>

        <input
          type="number"
          min="1"
          value={cupoMaximoParejas}
          onChange={(event) => setCupoMaximoParejas(Number(event.target.value))}
          required
        />
      </div>

      <div>
        <label>Precio de inscripción por pareja</label>

        <input
          type="number"
          min="0"
          value={precioInscripcionPorPareja}
          onChange={(event) =>
            setPrecioInscripcionPorPareja(Number(event.target.value))
          }
          required
        />
      </div>

      <button type="submit" disabled={creando}>
        {creando ? "Creando..." : "Crear competencia"}
      </button>
    </form>
  );
}
