import test from "node:test";
import assert from "node:assert/strict";

import {
  MARCADOR_SET_VACIO,
  cantidadSetsVisibles,
  construirMarcador,
  requiereTieBreak,
} from "../src/domain/resultado/resultado.marcador.ts";
import type { MarcadorSetTexto } from "../src/domain/resultado/resultado.marcador.ts";

const m = (j1: string, j2: string, t1 = "", t2 = ""): MarcadorSetTexto => ({
  juegosPareja1: j1,
  juegosPareja2: j2,
  tieBreakPareja1: t1,
  tieBreakPareja2: t2,
});
const vacio = () => ({ ...MARCADOR_SET_VACIO });

/* ----------------------------- Un set ----------------------------- */

test("un set: solo se muestra un set y 6-4 gana la pareja 1", () => {
  const marcadores = [m("6", "4"), vacio(), vacio()];
  assert.equal(cantidadSetsVisibles(marcadores, "un_set"), 1);
  const r = construirMarcador(marcadores, "un_set");
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.sets.length, 1);
    assert.equal(r.ganador, 1);
  }
});

test("un set: 6-6 se completa con el tie-break a 7 (7-6 o 6-7 según quién lo gane)", () => {
  const r = construirMarcador([m("6", "6", "5", "7"), vacio(), vacio()], "un_set");
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.ganador, 2);
    assert.equal(r.sets[0].juegosPareja1, 6);
    assert.equal(r.sets[0].juegosPareja2, 7);
    assert.equal(r.sets[0].tieBreakPareja2, 7);
  }
});

test("un set: tie-break incompleto, empatado o corto se rechaza con mensaje claro", () => {
  const sinPuntos = construirMarcador([m("6", "6"), vacio(), vacio()], "un_set");
  assert.equal(sinPuntos.ok, false);
  if (!sinPuntos.ok) assert.match(sinPuntos.error, /puntos del tie-break del set 1/);

  const empatado = construirMarcador([m("6", "6", "7", "7"), vacio(), vacio()], "un_set");
  if (!empatado.ok) assert.match(empatado.error, /empatado/);
  assert.equal(empatado.ok, false);

  const corto = construirMarcador([m("6", "6", "7", "6"), vacio(), vacio()], "un_set");
  assert.equal(corto.ok, false);
});

test("un set: 7-6 cargado directamente exige los puntos del tie-break", () => {
  assert.equal(requiereTieBreak(m("7", "6")), true);
  assert.equal(requiereTieBreak(m("6", "7")), true);
  assert.equal(requiereTieBreak(m("6", "4")), false);
  assert.equal(construirMarcador([m("7", "6"), vacio(), vacio()], "un_set").ok, false);
  const r = construirMarcador([m("7", "6", "7", "4"), vacio(), vacio()], "un_set");
  assert.equal(r.ok, true);
});

test("un set: 6-5 no es un set válido y no se pregunta cuántos sets son", () => {
  const r = construirMarcador([m("6", "5"), vacio(), vacio()], "un_set");
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /set 1 no es válido/);
});

/* --------------------------- Mejor de 3 --------------------------- */

test("mejor de 3: siempre 2 sets visibles y 2-0 termina sin tercer set", () => {
  const marcadores = [m("6", "4"), m("6", "3"), vacio()];
  assert.equal(cantidadSetsVisibles(marcadores, "mejor_de_3"), 2);
  const r = construirMarcador(marcadores, "mejor_de_3");
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.sets.length, 2);
    assert.equal(r.ganador, 1);
  }
});

test("mejor de 3: el tercer set aparece solo con 1-1", () => {
  assert.equal(cantidadSetsVisibles([m("6", "4"), vacio(), vacio()], "mejor_de_3"), 2, "set 2 incompleto");
  assert.equal(cantidadSetsVisibles([m("6", "4"), m("6", "2"), vacio()], "mejor_de_3"), 2, "2-0");
  assert.equal(cantidadSetsVisibles([m("6", "4"), m("3", "6"), vacio()], "mejor_de_3"), 3, "1-1");
});

test("mejor de 3: 1-1 se define con un tercer set completo", () => {
  const r = construirMarcador([m("6", "4"), m("3", "6"), m("2", "6")], "mejor_de_3", "set");
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.sets.length, 3);
    assert.equal(r.ganador, 2);
  }
});

test("mejor de 3: 1-1 se define con súper tie-break a 10 si lo acuerdan", () => {
  const r = construirMarcador([m("6", "4"), m("3", "6"), m("", "", "10", "7")], "mejor_de_3", "super_tiebreak");
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.ganador, 1);
    assert.equal(r.sets[2].tipo, "super_tiebreak");
    assert.equal(r.sets[2].tieBreakPareja1, 10);
    assert.equal(r.sets[2].juegosPareja1, 1);
    assert.equal(r.sets[2].juegosPareja2, 0);
  }
});

test("mejor de 3: súper tie-break inválido (10-9, empatado o incompleto)", () => {
  const base = [m("6", "4"), m("3", "6")];
  const corto = construirMarcador([...base, m("", "", "10", "9")], "mejor_de_3", "super_tiebreak");
  assert.equal(corto.ok, false);
  if (!corto.ok) assert.match(corto.error, /súper tie-break/);
  assert.equal(construirMarcador([...base, m("", "", "10", "10")], "mejor_de_3", "super_tiebreak").ok, false);
  assert.equal(construirMarcador([...base, vacio()], "mejor_de_3", "super_tiebreak").ok, false);
});

test("mejor de 3: un tercer set cargado a mano se ignora si ya terminó 2-0", () => {
  const r = construirMarcador([m("6", "4"), m("6", "3"), m("1", "6")], "mejor_de_3");
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.sets.length, 2);
});

test("mejor de 3: faltan datos -> mensaje indicando qué set completar", () => {
  const r = construirMarcador([m("6", "4"), vacio(), vacio()], "mejor_de_3");
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /games del set 2/);
  const terceroVacio = construirMarcador([m("6", "4"), m("3", "6"), vacio()], "mejor_de_3", "set");
  assert.equal(terceroVacio.ok, false);
  if (!terceroVacio.ok) assert.match(terceroVacio.error, /games del set 3/);
});

test("el tipo de tercer set pendiente no afecta a un set ni a un 2-0", () => {
  assert.equal(construirMarcador([m("6", "4"), vacio(), vacio()], "un_set", "super_tiebreak").ok, true);
  assert.equal(construirMarcador([m("6", "4"), m("6", "3"), vacio()], "mejor_de_3", "super_tiebreak").ok, true);
});
