import test from "node:test";
import assert from "node:assert/strict";

import {
  calcularRankingGenero,
  construirFilasPublicas,
  competenciaCuentaParaRanking,
} from "../src/domain/ranking/ranking.circuito.ts";
import type { CompetenciaParaRanking } from "../src/domain/ranking/ranking.circuito.ts";
import type { Partido } from "../src/domain/partido/partido.types.ts";

let n = 0;
function partido(datos: Partial<Partido>): Partido {
  n += 1;
  return { id: `p${n}`, competenciaId: "c", pareja1Id: null, pareja2Id: null, estado: "pendiente", sets: [], orden: n, ...datos };
}
const final = (p1: string, p2: string, ganador: string) =>
  partido({ tipoPartido: "eliminacion_directa", fase: "final", pareja1Id: p1, pareja2Id: p2, estado: "finalizado", ganadorParejaId: ganador });

function competencia(datos: Partial<CompetenciaParaRanking>): CompetenciaParaRanking {
  return {
    competenciaId: "c1",
    genero: "MASCULINO",
    estado: "finalizada",
    categoria: 5,
    partidos: [final("P1", "P2", "P1")],
    parejas: [
      { id: "P1", jugador1Id: "j1", jugador2Id: "j2", estado: "activa" },
      { id: "P2", jugador1Id: "j3", jugador2Id: "j4", estado: "activa" },
    ],
    ...datos,
  };
}

const todos = ["j1", "j2", "j3", "j4"].map((id) => ({ id, categoria: 5 }));

test("ranking: los dos jugadores de la pareja campeona suman los mismos puntos", () => {
  const filas = calcularRankingGenero([competencia({})], todos, "MASCULINO");
  const porId = Object.fromEntries(filas.map((f) => [f.jugadorId, f]));
  // campeón de 5ta: (10 + 120) × 1,0 = 130; finalista: (10 + 80) × 1,0 = 90; más 140 iniciales
  assert.equal(porId.j1.puntosCompetencias, 130);
  assert.equal(porId.j2.puntosCompetencias, 130);
  assert.equal(porId.j3.puntosCompetencias, 90);
  assert.equal(porId.j1.puntos, 270);
  assert.equal(porId.j1.posicion, 1);
  assert.equal(porId.j3.posicion, 3);
});

test("ranking: solo entran jugadores publicables y se renumera entre ellos", () => {
  const filas = calcularRankingGenero(
    [competencia({})],
    [{ id: "j3", categoria: 5 }, { id: "j1", categoria: 5 }],
    "MASCULINO",
  );
  assert.deepEqual(filas.map((f) => [f.jugadorId, f.posicion]), [["j1", 1], ["j3", 2]]);
});

test("ranking: filtra por género y por estado de la competencia", () => {
  const competencias = [
    competencia({ competenciaId: "fem", genero: "FEMENINO" }),
    competencia({ competenciaId: "borrador", estado: "borrador" }),
    competencia({ competenciaId: "cancelada", estado: "cancelada" }),
  ];
  assert.equal(calcularRankingGenero(competencias, todos, "MASCULINO").length, 0);
  assert.equal(calcularRankingGenero(competencias, todos, "FEMENINO").length, 4);
  assert.equal(competenciaCuentaParaRanking("en_curso"), true);
  assert.equal(competenciaCuentaParaRanking("finalizada"), true);
  // con zonas, la competencia sigue "inscripciones cerradas" mientras se juegan las zonas
  assert.equal(competenciaCuentaParaRanking("inscripciones_cerradas"), true);
  assert.equal(competenciaCuentaParaRanking("borrador"), false);
  assert.equal(competenciaCuentaParaRanking("cancelada"), false);
});

test("ranking: parejas dadas de baja y jugadores que no jugaron no suman", () => {
  const filas = calcularRankingGenero(
    [competencia({ parejas: [
      { id: "P1", jugador1Id: "j1", jugador2Id: "j2", estado: "activa" },
      { id: "P2", jugador1Id: "j3", jugador2Id: "j4", estado: "baja" },
    ] })],
    [...todos, { id: "j9", categoria: 3 }],
    "MASCULINO",
  );
  assert.deepEqual(filas.map((f) => f.jugadorId).sort(), ["j1", "j2"]);
});

test("ranking: la categoría de la competencia multiplica los puntos", () => {
  const baja = calcularRankingGenero([competencia({ categoria: 8 })], todos, "MASCULINO");
  const alta = calcularRankingGenero([competencia({ categoria: 3 })], todos, "MASCULINO");
  const puntos = (filas: typeof baja) => filas.find((f) => f.jugadorId === "j1")!.puntosCompetencias;
  assert.equal(puntos(baja), 33); // 130 × 0,25 = 32,5 → 33
  assert.equal(puntos(alta), 195); // 130 × 1,5
});

test("proyección pública: omite sin permiso y nunca incluye datos privados", () => {
  const vigente = {
    autorizaPerfil: true, autorizaApodo: false, origen: "formulario_publico" as const,
    estado: "vigente" as const, fechaDecision: new Date("2026-01-01"), fechaVerificacion: new Date("2026-01-02"),
  };
  const jugador = (id: string, extra: object = {}) => ({
    id, dni: "12345678", nombre: "Ana", apellido: `Pérez${id}`, apodo: "Anita", sexo: "femenino" as const,
    ciudad: "Neuquén", provincia: "Neuquén", ladoJuego: "drive" as const, categoriaDeclarada: "5ta",
    estado: "activo" as const, fechaRegistro: new Date(), ...extra,
  });
  const jugadores = [
    jugador("j1", { consentimientoPublicacion: vigente }),
    jugador("j2", { consentimientoPublicacion: { ...vigente, autorizaApodo: true } }),
    jugador("j3"),
  ];
  const filas = ["j1", "j2", "j3"].map((id, i) => ({
    jugadorId: id, posicion: i + 1, puntos: 100 - i, puntosIniciales: 0, puntosCompetencias: 100 - i,
    competenciasJugadas: 1, resultadosContados: 1,
  }));

  const publicas = construirFilasPublicas(filas, jugadores);
  assert.equal(publicas.length, 2);
  assert.equal(publicas[0].apodo, undefined);
  assert.equal(publicas[1].apodo, "Anita");
  const claves = new Set(publicas.flatMap((f) => Object.keys(f)));
  for (const privada of ["jugadorId", "dni", "ciudad", "provincia", "id"]) {
    assert.ok(!claves.has(privada), `no debe publicar ${privada}`);
  }
});

import { idRankingPublico } from "../src/domain/ranking/ranking.circuito.ts";

test("el ID del ranking público no contiene barras ni espacios", () => {
  assert.equal(idRankingPublico("abc", "2026/2027", "MASCULINO"), "abc_2026-2027_MASCULINO");
  assert.equal(idRankingPublico("abc", " 2026 ", "FEMENINO"), "abc_2026_FEMENINO");
});
