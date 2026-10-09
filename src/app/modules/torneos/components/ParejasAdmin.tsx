import { useEffect, useState } from "react";

import type { Pareja } from "../../../../domain/pareja/pareja.types";
import type { Jugador } from "../../../../domain/jugador/jugador.types";

import { parejasRepository } from "../../../../infrastructure/repositories/parejasRepository";
import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";
import { registrarPareja } from "../../../../application/parejas/registrarPareja";

interface Props {
  competenciaId: string;
  onParejaRegistrada: () => void;
}

export default function ParejasAdmin({
  competenciaId,
  onParejaRegistrada,
}: Props) {
  const [parejas, setParejas] = useState<Pareja[]>([]);
  const [jugadoresPorId, setJugadoresPorId] = useState<Record<string, Jugador>>(
    {},
  );

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dniJugador1, setDniJugador1] = useState("");
  const [dniJugador2, setDniJugador2] = useState("");

  const [jugador1, setJugador1] = useState<Jugador | null>(null);
  const [jugador2, setJugador2] = useState<Jugador | null>(null);

  const [buscandoJugador1, setBuscandoJugador1] = useState(false);

  const [buscandoJugador2, setBuscandoJugador2] = useState(false);

  const [errorJugador1, setErrorJugador1] = useState<string | null>(null);

  const [errorJugador2, setErrorJugador2] = useState<string | null>(null);

  const [registrando, setRegistrando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);

  useEffect(() => {
    async function cargarParejas() {
      try {
        setError(null);

        const datos =
          await parejasRepository.obtenerPorCompetenciaId(competenciaId);

        setParejas(datos);

        const idsJugadores = Array.from(
          new Set(
            datos.flatMap((pareja) => [pareja.jugador1Id, pareja.jugador2Id]),
          ),
        );

        const jugadores = await Promise.all(
          idsJugadores.map((id) => jugadoresRepository.obtenerJugadorPorId(id)),
        );

        const jugadoresEncontrados: Record<string, Jugador> = {};

        jugadores.forEach((jugador) => {
          if (jugador) {
            jugadoresEncontrados[jugador.id] = jugador;
          }
        });

        setJugadoresPorId(jugadoresEncontrados);
      } catch {
        setError("No se pudieron cargar las parejas.");
      } finally {
        setCargando(false);
      }
    }

    cargarParejas();
  }, [competenciaId]);

  async function buscarJugador1() {
    if (!dniJugador1.trim()) {
      setErrorJugador1("Ingresá un DNI.");
      return;
    }

    try {
      setBuscandoJugador1(true);
      setErrorJugador1(null);
      setJugador1(null);

      const jugador = await jugadoresRepository.obtenerJugadorPorDni(
        dniJugador1.trim(),
      );

      if (!jugador) {
        setErrorJugador1("No se encontró un jugador con ese DNI.");
        return;
      }

      setJugador1(jugador);
    } catch {
      setErrorJugador1("No se pudo buscar el jugador.");
    } finally {
      setBuscandoJugador1(false);
    }
  }

  async function buscarJugador2() {
    if (!dniJugador2.trim()) {
      setErrorJugador2("Ingresá un DNI.");
      return;
    }

    try {
      setBuscandoJugador2(true);
      setErrorJugador2(null);
      setJugador2(null);

      const jugador = await jugadoresRepository.obtenerJugadorPorDni(
        dniJugador2.trim(),
      );

      if (!jugador) {
        setErrorJugador2("No se encontró un jugador con ese DNI.");
        return;
      }

      setJugador2(jugador);
    } catch {
      setErrorJugador2("No se pudo buscar el jugador.");
    } finally {
      setBuscandoJugador2(false);
    }
  }

  async function registrarNuevaPareja() {
    if (!jugador1 || !jugador2) {
      setErrorRegistro("Debes seleccionar ambos jugadores.");
      return;
    }

    const jugador1Seleccionado = jugador1;
    const jugador2Seleccionado = jugador2;

    try {
      setRegistrando(true);
      setErrorRegistro(null);

      await registrarPareja({
        competenciaId,
        jugador1Id: jugador1Seleccionado.id,
        jugador2Id: jugador2Seleccionado.id,
      });

      const datos =
        await parejasRepository.obtenerPorCompetenciaId(competenciaId);

      setParejas(datos);

      setJugadoresPorId((actuales) => ({
        ...actuales,
        [jugador1Seleccionado.id]: jugador1Seleccionado,
        [jugador2Seleccionado.id]: jugador2Seleccionado,
      }));

      onParejaRegistrada();

      setDniJugador1("");
      setDniJugador2("");
      setJugador1(null);
      setJugador2(null);
    } catch (error) {
      setErrorRegistro(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la pareja.",
      );
    } finally {
      setRegistrando(false);
    }
  }

  if (cargando) {
    return <p>Cargando parejas...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <h2>Parejas</h2>

      <h3>Registrar pareja</h3>

      <div>
        <h4>Jugador 1</h4>

        <input
          type="text"
          value={dniJugador1}
          onChange={(e) => setDniJugador1(e.target.value)}
          placeholder="DNI"
        />

        <button
          type="button"
          onClick={buscarJugador1}
          disabled={buscandoJugador1}
        >
          {buscandoJugador1 ? "Buscando..." : "Buscar"}
        </button>

        {errorJugador1 && <p>{errorJugador1}</p>}

        {jugador1 && (
          <p>
            {jugador1.nombre} {jugador1.apellido}
            {" — "}
            Categoría: {jugador1.categoriaDeclarada}
          </p>
        )}
      </div>

      <div>
        <h4>Jugador 2</h4>

        <input
          type="text"
          value={dniJugador2}
          onChange={(e) => setDniJugador2(e.target.value)}
          placeholder="DNI"
        />

        <button
          type="button"
          onClick={buscarJugador2}
          disabled={buscandoJugador2}
        >
          {buscandoJugador2 ? "Buscando..." : "Buscar"}
        </button>

        {errorJugador2 && <p>{errorJugador2}</p>}

        {jugador2 && (
          <p>
            {jugador2.nombre} {jugador2.apellido}
            {" — "}
            Categoría: {jugador2.categoriaDeclarada}
          </p>
        )}
      </div>

      {errorRegistro && <p>{errorRegistro}</p>}

      <button
        type="button"
        onClick={registrarNuevaPareja}
        disabled={registrando || !jugador1 || !jugador2}
      >
        {registrando ? "Registrando..." : "Registrar pareja"}
      </button>

      <hr />

      {parejas.length === 0 ? (
        <p>Todavía no hay parejas registradas.</p>
      ) : (
        <ul>
          {parejas.map((pareja) => (
            <li key={pareja.id}>
              {jugadoresPorId[pareja.jugador1Id]
                ? `${jugadoresPorId[pareja.jugador1Id].nombre} ${jugadoresPorId[pareja.jugador1Id].apellido}`
                : pareja.jugador1Id}
              {" / "}
              {jugadoresPorId[pareja.jugador2Id]
                ? `${jugadoresPorId[pareja.jugador2Id].nombre} ${jugadoresPorId[pareja.jugador2Id].apellido}`
                : pareja.jugador2Id}
              {" — "}
              {pareja.estado}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
