import test from "node:test";
import assert from "node:assert/strict";

import { calcularIdPublico } from "../src/domain/jugador/jugador.idPublico.ts";
import {
  calcularParticipaciones,
  resumirEstadisticas,
} from "../src/domain/jugador/jugador.estadisticas.ts";
import type { CompetenciaParaPerfil } from "../src/domain/jugador/jugador.estadisticas.ts";
import {
  calcularEdad,
  construirPerfilPublico,
} from "../src/domain/jugador/jugador.perfilPublico.ts";
import type { Partido } from "../src/domain/partido/partido.types.ts";

let n = 0;
function partido(datos: Partial<Partido>): Partido {
  n += 1;
  return { id: `p${n}`, competenciaId: "c", pareja1Id: null, pareja2Id: null, estado: "pendiente", sets: [], orden: n, ...datos };
}

function competencia(datos: Partial<CompetenciaParaPerfil> = {}): CompetenciaParaPerfil {
  return {
    competenciaId: "c1",
    genero: "MASCULINO",
    estado: "finalizada",
    categoria: 5,
    torneoNombre: "Torneo Apertura",
    competenciaNombre: "5ta caballeros",
    circuitoNombre: "Circuito Norte",
    partidos: [
      partido({ tipoPartido: "zona", estado: "finalizado", pareja1Id: "P1", pareja2Id: "P2", ganadorParejaId: "P1" }),
      partido({ tipoPartido: "eliminacion_directa", fase: "final", estado: "finalizado", pareja1Id: "P1", pareja2Id: "P2", ganadorParejaId: "P1" }),
    ],
    parejas: [
      { id: "P1", jugador1Id: "j1", jugador2Id: "j2", estado: "activa" },
      { id: "P2", jugador1Id: "j3", jugador2Id: "j4", estado: "activa" },
    ],
    ...datos,
  };
}

test("idPublico: estable, distinto del ID interno y sin revelarlo", async () => {
  const a = await calcularIdPublico("abc123");
  assert.equal(a, await calcularIdPublico("abc123"));
  assert.notEqual(a, await calcularIdPublico("abc124"));
  assert.match(a, /^[0-9a-f]{24}$/);
  assert.ok(!a.includes("abc123"));
});

test("edad: se calcula por fecha, acepta Timestamp de Firestore y descarta fechas inválidas", () => {
  const hoy = new Date(2026, 10, 8);
  assert.equal(calcularEdad(new Date(1990, 10, 8), hoy), 36);
  assert.equal(calcularEdad(new Date(1990, 10, 9), hoy), 35);
  assert.equal(calcularEdad({ toDate: () => new Date(2000, 0, 1) }, hoy), 26);
  assert.equal(calcularEdad(undefined, hoy), undefined);
  assert.equal(calcularEdad("1990-01-01", hoy), undefined);
  assert.equal(calcularEdad(new Date(2030, 0, 1), hoy), undefined);
});

test("participaciones: campeón con sus partidos y puntos", () => {
  const [p] = calcularParticipaciones("j1", [competencia()]);
  assert.equal(p.resultado, "Campeón");
  assert.equal(p.partidosJugados, 2);
  assert.equal(p.partidosGanados, 2);
  assert.equal(p.puntos, 135); // (10 + 5 por victoria de zona + 120) × 1,0
  const [rival] = calcularParticipaciones("j3", [competencia()]);
  assert.equal(rival.resultado, "Finalista");
  assert.equal(rival.partidosGanados, 0);
});

test("participaciones: ignora borradores, bajas, byes y jugadores de otra pareja", () => {
  assert.equal(calcularParticipaciones("j1", [competencia({ estado: "borrador" })]).length, 0);
  assert.equal(calcularParticipaciones("j9", [competencia()]).length, 0);
  const conBaja = competencia({
    parejas: [
      { id: "P1", jugador1Id: "j1", jugador2Id: "j2", estado: "baja" },
      { id: "P2", jugador1Id: "j3", jugador2Id: "j4", estado: "activa" },
    ],
  });
  assert.equal(calcularParticipaciones("j1", [conBaja]).length, 0);
});

test("estadísticas: totales, efectividad, títulos y finales", () => {
  const participaciones = [
    ...calcularParticipaciones("j1", [competencia()]),
    ...calcularParticipaciones("j3", [competencia({ competenciaId: "c2" })]),
  ];
  const resumen = resumirEstadisticas(participaciones);
  assert.equal(resumen.competenciasJugadas, 2);
  assert.equal(resumen.titulos, 1);
  assert.equal(resumen.finales, 2);
  assert.equal(resumen.partidosJugados, 4);
  assert.equal(resumen.partidosGanados, 2);
  assert.equal(resumen.partidosPerdidos, 2);
  assert.equal(resumen.efectividad, 50);
  assert.equal(resumirEstadisticas([]).efectividad, 0);
});

test("perfil público: solo campos públicos y sin valores undefined", () => {
  const vigente = {
    autorizaPerfil: true, autorizaApodo: false, origen: "formulario_publico" as const,
    estado: "vigente" as const, fechaDecision: new Date("2026-01-01"), fechaVerificacion: new Date("2026-01-02"),
  };
  const jugador = {
    id: "interno-1", dni: "12345678", nombre: " Ana ", apellido: "Pérez", apodo: "Anita", sexo: "femenino" as const,
    ciudad: "Neuquén", provincia: "Neuquén", fechaNacimiento: { toDate: () => new Date(1995, 5, 1) } as unknown as Date,
    ladoJuego: "drive" as const, categoriaDeclarada: "5ta", estado: "activo" as const, fechaRegistro: new Date(),
    consentimientoPublicacion: vigente,
  };
  const perfil = construirPerfilPublico({
    jugador, idPublico: "abc", participaciones: [], posiciones: [], hoy: new Date(2026, 10, 8),
  });

  assert.equal(perfil.nombre, "Ana");
  assert.equal(perfil.apodo, undefined); // sin permiso de apodo
  assert.equal(perfil.edad, 31);
  assert.equal(perfil.ciudad, "Neuquén");
  const claves = Object.keys(perfil);
  for (const privada of ["id", "dni", "fechaNacimiento", "ladoJuego", "sexo", "consentimientoPublicacion"]) {
    assert.ok(!claves.includes(privada), `no debe publicar ${privada}`);
  }
  assert.ok(!Object.values(perfil).includes(undefined as never));
});
