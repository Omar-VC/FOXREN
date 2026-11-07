import test from "node:test";
import assert from "node:assert/strict";

import {
  CATEGORIAS_DECLARABLES,
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
