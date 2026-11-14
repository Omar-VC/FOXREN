import test from "node:test";
import assert from "node:assert/strict";

import {
  PROVINCIAS,
  buscarCoincidencia,
  formatearNombreLugar,
  normalizarTexto,
} from "../src/domain/ubicacion/ubicacion.ts";

test("hay 24 provincias sin repetidas", () => {
  assert.equal(PROVINCIAS.length, 24);
  assert.equal(new Set(PROVINCIAS).size, 24);
});

test("normalizarTexto ignora tildes, mayúsculas y espacios de más", () => {
  assert.equal(normalizarTexto("  CÓRDOBA  "), "cordoba");
  assert.equal(normalizarTexto("Río   Negro"), "rio negro");
});

test("buscarCoincidencia devuelve el nombre oficial o null", () => {
  assert.equal(buscarCoincidencia("cordoba", PROVINCIAS), "Córdoba");
  assert.equal(buscarCoincidencia(" CORDOBA ", PROVINCIAS), "Córdoba");
  assert.equal(buscarCoincidencia("neuquen", PROVINCIAS), "Neuquén");
  assert.equal(buscarCoincidencia("cba", PROVINCIAS), null);
  assert.equal(buscarCoincidencia("", PROVINCIAS), null);
});

test("formatearNombreLugar usa mayúscula inicial y respeta las palabras menores", () => {
  assert.equal(formatearNombreLugar("ALTA  GRACIA"), "Alta Gracia");
  assert.equal(formatearNombreLugar("san martin de los andes"), "San Martin de los Andes");
});
