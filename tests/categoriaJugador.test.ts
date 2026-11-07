import test from "node:test";
import assert from "node:assert/strict";

import {
  CATEGORIAS_ASIGNABLES,
  CATALOGO_CATEGORIAS,
  CATEGORIAS_DECLARABLES,
  descripcionDeCategoria,
  obtenerValorCategoriaJugador,
} from "../src/domain/jugador/categoriaJugador.ts";

test("las categorías declarables van de 3ra a 8va y todas se entienden", () => {
  assert.deepEqual([...CATEGORIAS_DECLARABLES], ["3ra", "4ta", "5ta", "6ta", "7ma", "8va"]);
  assert.deepEqual(
    CATEGORIAS_DECLARABLES.map(obtenerValorCategoriaJugador),
    [3, 4, 5, 6, 7, 8],
  );
});

test("texto sin número no es una categoría", () => {
  assert.equal(obtenerValorCategoriaJugador("tercera"), null);
  assert.equal(obtenerValorCategoriaJugador(""), null);
});

test("el administrador puede asignar también 1ra y 2da; el formulario público no las ofrece", () => {
  assert.deepEqual([...CATEGORIAS_ASIGNABLES].slice(0, 2), ["1ra", "2da"]);
  assert.equal(CATEGORIAS_ASIGNABLES.length, 8);
  assert.ok(!(CATEGORIAS_DECLARABLES as readonly string[]).includes("1ra"));
  assert.ok(!(CATEGORIAS_DECLARABLES as readonly string[]).includes("2da"));
});

test("el catálogo es la fuente única: declarables y asignables salen de él", () => {
  assert.deepEqual(
    CATALOGO_CATEGORIAS.map((c) => c.nombre),
    [...CATEGORIAS_ASIGNABLES],
  );
  assert.deepEqual(
    CATALOGO_CATEGORIAS.filter((c) => c.declarable).map((c) => c.nombre),
    [...CATEGORIAS_DECLARABLES],
  );
  assert.equal(descripcionDeCategoria("5ta"), "Quinta categoría");
  assert.equal(descripcionDeCategoria("9na"), undefined);
});
