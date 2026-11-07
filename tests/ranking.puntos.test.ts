import test from "node:test";
import assert from "node:assert/strict";

import {
  calcularRendimientoParejas,
  categoriaEfectivaCompetencia,
  construirRanking,
  multiplicadorDeCategoria,
  puntosDeCompetencia,
  puntosInicialesDeCategoria,
} from "../src/domain/ranking/ranking.puntos.ts";
import { CONFIG_RANKING } from "../src/domain/ranking/ranking.config.ts";
import type { Partido } from "../src/domain/partido/partido.types.ts";

let contador = 0;
function partido(datos: Partial<Partido>): Partido {
  contador += 1;
  return {
    id: `p${contador}`,
    competenciaId: "c1",
    pareja1Id: null,
    pareja2Id: null,
    estado: "pendiente",
    sets: [],
    orden: contador,
    ...datos,
  };
}

test("categoría efectiva: la suma se promedia", () => {
  assert.equal(categoriaEfectivaCompetencia("individual", 5), 5);
  assert.equal(categoriaEfectivaCompetencia("suma", 8), 4);
  assert.equal(categoriaEfectivaCompetencia("suma", 9), 4.5);
});

test("multiplicador: valores de la tabla, interpolación y topes", () => {
  assert.equal(multiplicadorDeCategoria(3), 1.5);
  assert.equal(multiplicadorDeCategoria(8), 0.25);
  assert.equal(multiplicadorDeCategoria(4.5), 1.125);
  assert.equal(multiplicadorDeCategoria(0), 2);
  assert.equal(multiplicadorDeCategoria(12), 0.25);
});

test("puntos iniciales: 3ra arranca con 320, 5ta con 140; sin categoría, 0", () => {
  assert.equal(puntosInicialesDeCategoria(3), 320);
  assert.equal(puntosInicialesDeCategoria(5), 140);
  assert.equal(puntosInicialesDeCategoria(null), 0);
  assert.equal(puntosInicialesDeCategoria(undefined), 0);
});

test("rendimiento: zona, semifinalista, finalista y campeón", () => {
  const partidos: Partido[] = [
    // zona: A le gana a B y a C; B le gana a C
    partido({ zonaId: "z1", pareja1Id: "A", pareja2Id: "B", estado: "finalizado", ganadorParejaId: "A" }),
    partido({ zonaId: "z1", pareja1Id: "A", pareja2Id: "C", estado: "finalizado", ganadorParejaId: "A" }),
    partido({ zonaId: "z1", pareja1Id: "B", pareja2Id: "C", estado: "finalizado", ganadorParejaId: "B" }),
    // llave: semis A-D (gana A), B-E (gana B); final A-B (gana A)
    partido({ tipoPartido: "eliminacion_directa", fase: "semifinal", pareja1Id: "A", pareja2Id: "D", estado: "finalizado", ganadorParejaId: "A" }),
    partido({ tipoPartido: "eliminacion_directa", fase: "semifinal", pareja1Id: "B", pareja2Id: "E", estado: "finalizado", ganadorParejaId: "B" }),
    partido({ tipoPartido: "eliminacion_directa", fase: "final", pareja1Id: "A", pareja2Id: "B", estado: "finalizado", ganadorParejaId: "A" }),
  ];

  const rend = Object.fromEntries(
    calcularRendimientoParejas(partidos, ["A", "B", "C", "D", "E", "F"]).map((r) => [r.parejaId, r]),
  );

  assert.equal(rend.A.faseAlcanzada, "campeon");
  assert.equal(rend.A.victoriasZona, 2);
  assert.equal(rend.B.faseAlcanzada, "finalista");
  assert.equal(rend.B.victoriasZona, 1);
  assert.equal(rend.D.faseAlcanzada, "semifinal");
  assert.equal(rend.C.faseAlcanzada, null);
  assert.equal(rend.C.participo, true);
  assert.equal(rend.F.participo, false);
});

test("un bye que llega a cuartos cuenta como cuartos y la final sin jugar no da campeón", () => {
  const partidos: Partido[] = [
    partido({ tipoPartido: "eliminacion_directa", fase: "cuartos_final", pareja1Id: "A", pareja2Id: "B", estado: "pendiente" }),
    partido({ tipoPartido: "eliminacion_directa", fase: "final", pareja1Id: "A", pareja2Id: "B", estado: "pendiente" }),
  ];
  const [a] = calcularRendimientoParejas(partidos, ["A"]);
  assert.equal(a.faseAlcanzada, "finalista");
  assert.equal(a.participo, true);
});

test("puntos de competencia: campeón de 3ra con 2 victorias de zona", () => {
  const puntos = puntosDeCompetencia(
    { parejaId: "A", participo: true, victoriasZona: 2, faseAlcanzada: "campeon" },
    3,
  );
  // (10 + 2×5 + 120) × 1,5 = 210
  assert.equal(puntos, 210);
  assert.equal(
    puntosDeCompetencia({ parejaId: "X", participo: false, victoriasZona: 0, faseAlcanzada: null }, 3),
    0,
  );
});

test("ranking: puntos iniciales + mejores N resultados, empates comparten posición", () => {
  const config = { ...CONFIG_RANKING, mejoresResultados: 2 };
  const filas = construirRanking(
    [
      { jugadorId: "a", categoria: 5, resultados: [{ competenciaId: "1", puntos: 10 }, { competenciaId: "2", puntos: 50 }, { competenciaId: "3", puntos: 30 }] },
      { jugadorId: "b", categoria: 5, resultados: [{ competenciaId: "1", puntos: 70 }] },
      { jugadorId: "c", categoria: 5, resultados: [{ competenciaId: "1", puntos: 70 }] },
      { jugadorId: "d", categoria: null, resultados: [] },
    ],
    config,
  );

  const a = filas.find((f) => f.jugadorId === "a")!;
  assert.equal(a.puntosCompetencias, 80); // 50 + 30, el 10 queda afuera
  assert.equal(a.resultadosContados, 2);
  assert.equal(a.competenciasJugadas, 3);
  assert.equal(a.puntos, 220);

  const b = filas.find((f) => f.jugadorId === "b")!;
  const c = filas.find((f) => f.jugadorId === "c")!;
  assert.equal(b.posicion, 2);
  assert.equal(c.posicion, 2); // empate con b (210)
  assert.equal(b.puntos, 210);
  assert.equal(filas[0].jugadorId, "a");
  assert.equal(filas.find((f) => f.jugadorId === "d")!.posicion, 4);
});

test("protección de categorías altas: un 8va no alcanza a un 3ra solo por cantidad de torneos", () => {
  // 8 títulos de 8va (el máximo que cuenta): 8 × 30 = 240, más 15 iniciales = 255 < 320
  const resultados = Array.from({ length: 12 }, (_, i) => ({
    competenciaId: `c${i}`,
    puntos: puntosDeCompetencia(
      { parejaId: "x", participo: true, victoriasZona: 0, faseAlcanzada: "campeon" },
      8,
    ),
  }));
  const filas = construirRanking([
    { jugadorId: "grinder8va", categoria: 8, resultados },
    { jugadorId: "inactivo3ra", categoria: 3, resultados: [] },
  ]);
  assert.equal(filas[0].jugadorId, "inactivo3ra");
  assert.ok(filas[1].puntos < filas[0].puntos);
});

test("subir de categoría permite pasar: 6ta campeón dos veces supera a un 5ta inactivo", () => {
  const titulo6ta = puntosDeCompetencia(
    { parejaId: "x", participo: true, victoriasZona: 0, faseAlcanzada: "campeon" },
    6,
  );
  const filas = construirRanking([
    { jugadorId: "sube", categoria: 6, resultados: [{ competenciaId: "1", puntos: titulo6ta }, { competenciaId: "2", puntos: titulo6ta }] },
    { jugadorId: "quieto5ta", categoria: 5, resultados: [] },
  ]);
  assert.equal(filas[0].jugadorId, "sube");
});
