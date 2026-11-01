import test from "node:test";
import assert from "node:assert/strict";

import {
  calcularGanadorDesdeSets,
  evaluarMarcador,
  validarResultado,
} from "../src/domain/resultado/resultado.rules.ts";
import type { SetResultado } from "../src/domain/partido/partido.types.ts";

const set = (n: number, j1: number, j2: number, tb?: [number, number]): SetResultado => ({
  setNumero: n,
  juegosPareja1: j1,
  juegosPareja2: j2,
  ...(tb ? { tieBreakPareja1: tb[0], tieBreakPareja2: tb[1] } : {}),
});

const superTb = (n: number, p1: number, p2: number): SetResultado => ({
  setNumero: n,
  juegosPareja1: p1 > p2 ? 1 : 0,
  juegosPareja2: p1 > p2 ? 0 : 1,
  tieBreakPareja1: p1,
  tieBreakPareja2: p2,
  tipo: "super_tiebreak",
});

test("un set: 6-4 es válido y gana la pareja 1", () => {
  const r = evaluarMarcador([set(1, 6, 4)], "un_set");
  assert.equal(r.valido, true);
  assert.equal(r.ganador, 1);
});

test("un set: 7-6 con tie-break a 7 es válido", () => {
  assert.equal(evaluarMarcador([set(1, 6, 7, [5, 7])], "un_set").ganador, 2);
});

test("un set: 6-5 y 7-6 sin tie-break son inválidos", () => {
  assert.equal(evaluarMarcador([set(1, 6, 5)], "un_set").valido, false);
  assert.equal(evaluarMarcador([set(1, 7, 6)], "un_set").valido, false);
});

test("un set: no admite dos sets ni súper tie-break", () => {
  assert.equal(evaluarMarcador([set(1, 6, 4), set(2, 6, 3)], "un_set").valido, false);
  assert.equal(evaluarMarcador([superTb(1, 10, 5)], "un_set").valido, false);
});

test("mejor de 3: 2-0 y 2-1 con tercer set", () => {
  assert.equal(evaluarMarcador([set(1, 6, 4), set(2, 6, 3)], "mejor_de_3").ganador, 1);
  const r = evaluarMarcador([set(1, 6, 4), set(2, 3, 6), set(3, 2, 6)], "mejor_de_3");
  assert.equal(r.valido, true);
  assert.equal(r.ganador, 2);
});

test("mejor de 3: 1-1 con súper tie-break a 10", () => {
  const r = evaluarMarcador([set(1, 6, 4), set(2, 3, 6), superTb(3, 10, 8)], "mejor_de_3");
  assert.equal(r.valido, true);
  assert.equal(r.ganador, 1);
});

test("mejor de 3: súper tie-break inválido (10-9) o fuera del tercer set", () => {
  assert.equal(
    evaluarMarcador([set(1, 6, 4), set(2, 3, 6), superTb(3, 10, 9)], "mejor_de_3").valido,
    false,
  );
  assert.equal(
    evaluarMarcador([set(1, 6, 4), superTb(2, 10, 5)], "mejor_de_3").valido,
    false,
  );
});

test("mejor de 3: marcadores incompletos o pasados", () => {
  const incompleto = evaluarMarcador([set(1, 6, 4), set(2, 3, 6)], "mejor_de_3");
  assert.equal(incompleto.valido, false);
  assert.match(incompleto.error!, /1-1/);
  assert.equal(evaluarMarcador([set(1, 6, 4)], "mejor_de_3").valido, false);
  assert.equal(
    evaluarMarcador([set(1, 6, 4), set(2, 6, 3), set(3, 6, 1)], "mejor_de_3").valido,
    false,
  );
});

test("calcularGanadorDesdeSets devuelve el id o null", () => {
  assert.equal(calcularGanadorDesdeSets([set(1, 4, 6)], "un_set", "A", "B"), "B");
  assert.equal(calcularGanadorDesdeSets([set(1, 5, 6)], "un_set", "A", "B"), null);
});

test("validarResultado: walkover, abandono, suspensión", () => {
  const base = { partidoId: "p", oficial: true, fechaRegistro: new Date() };
  assert.equal(validarResultado({ ...base, tipo: "walkover", sets: [], ganadorParejaId: "A" }).valido, true);
  assert.equal(validarResultado({ ...base, tipo: "walkover", sets: [], ganadorParejaId: undefined }).valido, false);
  assert.equal(validarResultado({ ...base, tipo: "abandono", sets: [set(1, 3, 2)], ganadorParejaId: "A" }).valido, true);
  assert.equal(validarResultado({ ...base, tipo: "suspension", sets: [], ganadorParejaId: undefined }).valido, true);
  assert.equal(validarResultado({ ...base, tipo: "suspension", sets: [], ganadorParejaId: "A" }).valido, false);
});

test("validarResultado normal respeta el formato", () => {
  const base = { partidoId: "p", oficial: true, fechaRegistro: new Date(), tipo: "normal" as const };
  const unSet = { ...base, sets: [set(1, 6, 2)], ganadorParejaId: "A" };
  assert.equal(validarResultado(unSet, "un_set").valido, true);
  assert.equal(validarResultado(unSet, "mejor_de_3").valido, false);
});
