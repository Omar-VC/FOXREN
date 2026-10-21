import test from "node:test";
import assert from "node:assert/strict";
import {
  calcularTablaZona,
  clasificarParejasZona,
} from "../src/domain/competencia/competencia.tabla.ts";

const zona = {
  id: "zona-a",
  competenciaId: "competencia-1",
  nombre: "Zona A",
  parejaIds: ["A", "B", "C"],
  orden: 1,
};

function partido(id, pareja1Id, pareja2Id, ganadorParejaId, sets) {
  return {
    id,
    competenciaId: zona.competenciaId,
    zonaId: zona.id,
    pareja1Id,
    pareja2Id,
    estado: "finalizado",
    sets,
    ganadorParejaId,
    orden: 1,
  };
}

function resultado(partidoId, ganadorParejaId, sets, tipo = "normal") {
  return {
    id: `resultado-${partidoId}`,
    partidoId,
    tipo,
    sets,
    ganadorParejaId,
    oficial: true,
    fechaRegistro: new Date("2026-01-01T00:00:00.000Z"),
  };
}

const setsVictoria = [
  { setNumero: 1, juegosPareja1: 6, juegosPareja2: 4 },
  { setNumero: 2, juegosPareja1: 6, juegosPareja2: 4 },
];

test("ordena por victorias, diferencia de sets y diferencia de games", () => {
  const partidos = [
    partido("ab", "A", "B", "A", setsVictoria),
    partido("ac", "A", "C", "A", setsVictoria),
    partido("bc", "B", "C", "B", setsVictoria),
  ];
  const resultados = partidos.map((item) => resultado(
    item.id,
    item.ganadorParejaId,
    item.sets,
  ));

  const tabla = calcularTablaZona(zona, partidos, resultados);
  assert.equal(tabla.completa, true);
  assert.deepEqual(tabla.filas.map(({ parejaId, posicion, victorias }) => [
    parejaId, posicion, victorias,
  ]), [["A", 1, 2], ["B", 2, 1], ["C", 3, 0]]);
  assert.deepEqual(clasificarParejasZona(tabla, 2), {
    clasificados: ["A", "B"],
    empateEnCorte: [],
    bloqueadaPorEmpate: false,
  });
});

test("bloquea la clasificación automática cuando el empate cruza el corte", () => {
  const setsDerrota = [
    { setNumero: 1, juegosPareja1: 4, juegosPareja2: 6 },
    { setNumero: 2, juegosPareja1: 4, juegosPareja2: 6 },
  ];
  const partidos = [
    partido("ab", "A", "B", "A", setsVictoria),
    partido("ac", "A", "C", "C", setsDerrota),
    partido("bc", "B", "C", "B", setsVictoria),
  ];
  const resultados = partidos.map((item) => resultado(
    item.id,
    item.ganadorParejaId,
    item.sets,
  ));

  const tabla = calcularTablaZona(zona, partidos, resultados);
  assert.deepEqual(tabla.filas.map((fila) => fila.posicion), [1, 1, 1]);
  assert.deepEqual(clasificarParejasZona(tabla, 2), {
    clasificados: [],
    empateEnCorte: ["A", "B", "C"],
    bloqueadaPorEmpate: true,
  });
});

test("usa diferencia de games como tercer criterio", () => {
  const partidos = [
    partido("ab", "A", "B", "A", setsVictoria),
    partido("ac", "A", "C", "C", [
      { setNumero: 1, juegosPareja1: 0, juegosPareja2: 6 },
      { setNumero: 2, juegosPareja1: 0, juegosPareja2: 6 },
    ]),
    partido("bc", "B", "C", "B", [
      { setNumero: 1, juegosPareja1: 6, juegosPareja2: 0 },
      { setNumero: 2, juegosPareja1: 6, juegosPareja2: 0 },
    ]),
  ];
  const resultados = partidos.map((item) => resultado(
    item.id,
    item.ganadorParejaId,
    item.sets,
  ));

  const tabla = calcularTablaZona(zona, partidos, resultados);
  assert.deepEqual(tabla.filas.map(({ parejaId, victorias, diferenciaSets, diferenciaGames }) => [
    parejaId, victorias, diferenciaSets, diferenciaGames,
  ]), [
    ["B", 1, 0, 8],
    ["C", 1, 0, 0],
    ["A", 1, 0, -8],
  ]);
});

test("no clasifica una zona con partidos pendientes o resultados no oficiales", () => {
  const partidos = [
    partido("ab", "A", "B", "A", setsVictoria),
    partido("ac", "A", "C", "A", setsVictoria),
    partido("bc", "B", "C", "B", setsVictoria),
  ];
  const tabla = calcularTablaZona(
    zona,
    partidos,
    [resultado("ab", "A", setsVictoria), {
      ...resultado("ac", "A", setsVictoria),
      oficial: false,
    }],
  );
  assert.equal(tabla.completa, false);
  assert.equal(tabla.partidosPendientes, 2);
  assert.throws(() => clasificarParejasZona(tabla, 2), /completar todos los partidos/);
});

test("rechaza un resultado cuya fase no coincide con el estado del partido", () => {
  const partidoPendiente = partido("ab", "A", "B", "A", setsVictoria);
  partidoPendiente.estado = "pendiente";
  assert.throws(
    () => calcularTablaZona(zona, [partidoPendiente], [resultado("ab", "A", setsVictoria)]),
    /estado del partido no coincide/,
  );
});
