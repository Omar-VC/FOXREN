import test from "node:test";
import assert from "node:assert/strict";
import {
  validarPartidoEstandar,
  validarSet,
  validarTipoResultado,
} from "../src/domain/resultado/resultado.rules.ts";

test("valida sets estándar y tie-breaks con diferencia mínima de dos", () => {
  assert.equal(validarSet({
    setNumero: 1,
    juegosPareja1: 6,
    juegosPareja2: 4,
  }), true);
  assert.equal(validarSet({
    setNumero: 1,
    juegosPareja1: 7,
    juegosPareja2: 6,
    tieBreakPareja1: 8,
    tieBreakPareja2: 6,
  }), true);
  assert.equal(validarSet({
    setNumero: 1,
    juegosPareja1: 7,
    juegosPareja2: 6,
    tieBreakPareja1: 7,
    tieBreakPareja2: 6,
  }), false);
});

test("un partido normal termina exactamente al alcanzar dos sets", () => {
  assert.equal(validarPartidoEstandar([
    { setNumero: 1, juegosPareja1: 6, juegosPareja2: 2 },
    { setNumero: 2, juegosPareja1: 4, juegosPareja2: 6 },
    { setNumero: 3, juegosPareja1: 6, juegosPareja2: 3 },
  ]), true);
  assert.equal(validarPartidoEstandar([
    { setNumero: 1, juegosPareja1: 6, juegosPareja2: 2 },
    { setNumero: 2, juegosPareja1: 6, juegosPareja2: 3 },
    { setNumero: 3, juegosPareja1: 3, juegosPareja2: 6 },
  ]), false);
});

test("valida resultados especiales según las reglas implementadas", () => {
  assert.equal(validarTipoResultado({
    partidoId: "p1",
    tipo: "walkover",
    sets: [],
    ganadorParejaId: "a",
    oficial: true,
    fechaRegistro: new Date(),
  }), true);
  assert.equal(validarTipoResultado({
    partidoId: "p1",
    tipo: "suspension",
    sets: [],
    oficial: false,
    fechaRegistro: new Date(),
  }), true);
});
