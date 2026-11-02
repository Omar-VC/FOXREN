import test from "node:test";
import assert from "node:assert/strict";

import {
  calcularDestinoAvance,
  calcularTamanoCuadro,
  datosAvance,
  generarCuadro,
  nombreFasePorRonda,
  ordenSiembraEstandar,
  etiquetaFase,
  partidoListoParaJugar,
  sembrarDesdeZonas,
  semillaDesdeTexto,
  sortearSiembra,
} from "../src/domain/competencia/competencia.playoff.rules.ts";
import type { PartidoPlayoff } from "../src/domain/competencia/competencia.playoff.types.ts";

const parejas = (n: number) => Array.from({ length: n }, (_, i) => `S${i + 1}`);
const seedDe = (id: string | null) => (id ? Number(id.slice(1)) : Infinity);

test("orden de siembra estándar", () => {
  assert.deepEqual(ordenSiembraEstandar(2), [1, 2]);
  assert.deepEqual(ordenSiembraEstandar(4), [1, 4, 2, 3]);
  assert.deepEqual(ordenSiembraEstandar(8), [1, 8, 4, 5, 2, 7, 3, 6]);
});

test("tamaño del cuadro y nombres de fase", () => {
  assert.equal(calcularTamanoCuadro(2), 2);
  assert.equal(calcularTamanoCuadro(6), 8);
  assert.equal(calcularTamanoCuadro(8), 8);
  assert.equal(calcularTamanoCuadro(9), 16);
  assert.throws(() => calcularTamanoCuadro(1));
  assert.equal(nombreFasePorRonda(3, 3), "final");
  assert.equal(nombreFasePorRonda(1, 3), "cuartos_final");
  assert.equal(nombreFasePorRonda(1, 6), "ronda_de_64");
});

for (const n of [2, 3, 4, 5, 6, 7, 8, 12, 16, 20]) {
  test(`cuadro de ${n} parejas: estructura, byes y enlaces`, () => {
    const cuadro = generarCuadro("C1", parejas(n));
    const tamano = calcularTamanoCuadro(n);

    assert.equal(cuadro.partidos.length, tamano - 1, "partidos totales = tamaño - 1");
    assert.equal(cuadro.byes, tamano - n);
    assert.equal(cuadro.partidos.filter((p) => p.esBye).length, tamano - n);
    assert.equal(new Set(cuadro.partidos.map((p) => p.id)).size, cuadro.partidos.length);
    assert.equal(new Set(cuadro.partidos.map((p) => p.orden)).size, cuadro.partidos.length);

    const porId = new Map(cuadro.partidos.map((p) => [p.id, p]));
    const alimentadores = new Map<string, number[]>();

    for (const p of cuadro.partidos) {
      if (p.ronda === cuadro.totalRondas) {
        assert.equal(p.partidoSiguienteId, undefined);
        assert.equal(p.fase, "final");
        continue;
      }
      assert.ok(porId.has(p.partidoSiguienteId!), "el destino existe");
      const lados = alimentadores.get(p.partidoSiguienteId!) ?? [];
      lados.push(p.ladoSiguiente!);
      alimentadores.set(p.partidoSiguienteId!, lados);
    }
    for (const lados of alimentadores.values()) {
      assert.deepEqual([...lados].sort(), [1, 2], "cada partido recibe un 1 y un 2");
    }

    // Ninguna pareja repetida en la ronda 1 y todas aparecen
    const r1 = cuadro.partidos.filter((p) => p.ronda === 1);
    const ids = r1.flatMap((p) => [p.pareja1Id, p.pareja2Id]).filter(Boolean);
    assert.equal(new Set(ids).size, n);
  });
}

for (const n of [4, 6, 8, 12, 16]) {
  test(`siembra: simulando que gana siempre la mejor semilla, la final es 1 vs 2 (${n})`, () => {
    const cuadro = generarCuadro("C1", parejas(n));
    const porId = new Map(cuadro.partidos.map((p) => [p.id, p]));

    for (let ronda = 1; ronda <= cuadro.totalRondas; ronda++) {
      for (const p of cuadro.partidos.filter((x) => x.ronda === ronda)) {
        if (!p.esBye) {
          assert.ok(p.pareja1Id && p.pareja2Id, `ronda ${ronda} debe tener ambas parejas`);
          p.ganadorParejaId = seedDe(p.pareja1Id) < seedDe(p.pareja2Id) ? p.pareja1Id! : p.pareja2Id!;
          p.estado = "finalizado";
        }
        const destino = calcularDestinoAvance(p);
        if (destino) {
          const sig = porId.get(destino.partidoId)!;
          Object.assign(sig, datosAvance(sig, destino.lado, p.ganadorParejaId!));
        }
      }
    }

    const final = cuadro.partidos.find((p) => p.fase === "final")!;
    assert.deepEqual([final.pareja1Id, final.pareja2Id].sort(), ["S1", "S2"]);
    assert.equal(final.ganadorParejaId, "S1");
  });
}

test("con byes, los byes son de las mejores semillas y la ronda 2 ya viene ubicada", () => {
  const cuadro = generarCuadro("C1", parejas(6));
  const byes = cuadro.partidos.filter((p) => p.esBye);
  assert.deepEqual(byes.map((p) => p.ganadorParejaId).sort(), ["S1", "S2"]);
  for (const b of byes) {
    assert.equal(b.estado, "finalizado");
    assert.equal(partidoListoParaJugar(b), false);
  }
  const semis = cuadro.partidos.filter((p) => p.ronda === 2);
  assert.equal(semis.filter((p) => p.pareja1Id || p.pareja2Id).length, 2);
});

test("partidoListoParaJugar exige las dos parejas", () => {
  const base = { esBye: false };
  assert.equal(partidoListoParaJugar({ ...base, pareja1Id: "A", pareja2Id: null }), false);
  assert.equal(partidoListoParaJugar({ ...base, pareja1Id: "A", pareja2Id: "B" }), true);
});

test("datosAvance rechaza pisar un lugar ocupado y acepta repetir la misma pareja", () => {
  assert.deepEqual(datosAvance({ pareja1Id: null, pareja2Id: null }, 2, "X"), { pareja2Id: "X" });
  assert.throws(() => datosAvance({ pareja1Id: "A", pareja2Id: null }, 1, "X"));
  assert.deepEqual(datosAvance({ pareja1Id: "X", pareja2Id: null }, 1, "X"), { pareja1Id: "X" });
});

test("calcularDestinoAvance: la final no tiene destino", () => {
  const final = generarCuadro("C1", parejas(2)).partidos[0] as PartidoPlayoff;
  assert.equal(calcularDestinoAvance(final), null);
});

test("generarCuadro rechaza repetidos y menos de 2 parejas", () => {
  assert.throws(() => generarCuadro("C1", ["A", "A"]));
  assert.throws(() => generarCuadro("C1", ["A"]));
});

test("sorteo con semilla es reproducible y es una permutación", () => {
  const ids = parejas(10);
  const a = sortearSiembra(ids, 42);
  assert.deepEqual(a, sortearSiembra(ids, 42));
  assert.deepEqual([...a].sort(), [...ids].sort());
  assert.notDeepEqual(a, sortearSiembra(ids, 43));
});

test("zonas -> playoff: 3 zonas x 2 clasificados evita cruce de la misma zona", () => {
  const clasificados = [
    { parejaId: "A1", zonaId: "A", posicion: 1, victorias: 2 },
    { parejaId: "B1", zonaId: "B", posicion: 1, victorias: 2 },
    { parejaId: "C1", zonaId: "C", posicion: 1, victorias: 2 },
    { parejaId: "A2", zonaId: "A", posicion: 2, victorias: 1 },
    { parejaId: "B2", zonaId: "B", posicion: 2, victorias: 1 },
    { parejaId: "C2", zonaId: "C", posicion: 2, victorias: 1 },
  ];
  const siembra = sembrarDesdeZonas(clasificados);
  assert.deepEqual([...siembra.slice(0, 3)].sort(), ["A1", "B1", "C1"], "los primeros van primero");

  const zona = new Map(clasificados.map((c) => [c.parejaId, c.zonaId]));
  const cuadro = generarCuadro("C1", siembra);
  for (const p of cuadro.partidos.filter((x) => x.ronda === 1 && !x.esBye)) {
    assert.notEqual(zona.get(p.pareja1Id!), zona.get(p.pareja2Id!));
  }
});

test("zonas -> playoff: 4 zonas x 3 clasificados (12 parejas), sin repetidos", () => {
  const clasificados = ["A", "B", "C", "D"].flatMap((z) =>
    [1, 2, 3].map((pos) => ({ parejaId: `${z}${pos}`, zonaId: z, posicion: pos })),
  );
  const siembra = sembrarDesdeZonas(clasificados);
  assert.equal(new Set(siembra).size, 12);
  const cuadro = generarCuadro("C1", siembra);
  assert.equal(cuadro.byes, 4);
  assert.equal(cuadro.partidos.length, 15);
});

/* ------------- Criterio oficial de cruces (siembra desde zonas) ------------- */

test("criterio: se compara por promedio, no por victorias absolutas (zonas de 3 y de 4)", () => {
  // Y1 ganó 2 de 2 (100%); X1 ganó 2 de 3 (67%): con victorias absolutas empatan.
  const clasificados = [
    { parejaId: "X1", zonaId: "X", posicion: 1, partidosJugados: 3, victorias: 2, diferenciaSets: 3, diferenciaGames: 10 },
    { parejaId: "Y1", zonaId: "Y", posicion: 1, partidosJugados: 2, victorias: 2, diferenciaSets: 3, diferenciaGames: 10 },
  ];
  for (const semilla of [1, 2, 3, 4, 5, 6, 7, 8]) {
    assert.deepEqual(sembrarDesdeZonas(clasificados, semilla), ["Y1", "X1"], `semilla ${semilla}`);
  }
});

test("criterio: todos los primeros van antes que cualquier segundo, aunque el segundo rinda más", () => {
  const siembra = sembrarDesdeZonas(
    [
      { parejaId: "A1", zonaId: "A", posicion: 1, partidosJugados: 2, victorias: 1, diferenciaSets: 0, diferenciaGames: 0 },
      { parejaId: "B1", zonaId: "B", posicion: 1, partidosJugados: 2, victorias: 1, diferenciaSets: 0, diferenciaGames: 0 },
      { parejaId: "A2", zonaId: "A", posicion: 2, partidosJugados: 2, victorias: 2, diferenciaSets: 4, diferenciaGames: 20 },
      { parejaId: "B2", zonaId: "B", posicion: 2, partidosJugados: 2, victorias: 2, diferenciaSets: 4, diferenciaGames: 20 },
    ],
    5,
  );
  assert.deepEqual([...siembra.slice(0, 2)].sort(), ["A1", "B1"]);
  assert.deepEqual([...siembra.slice(2)].sort(), ["A2", "B2"]);
});

test("criterio: el desempate es un sorteo reproducible que no depende del orden de entrada ni favorece a la zona A", () => {
  const empatados = ["A", "B", "C", "D"].map((z) => ({
    parejaId: `${z}1`, zonaId: z, posicion: 1, partidosJugados: 2, victorias: 2, diferenciaSets: 4, diferenciaGames: 12,
  }));
  const a = sembrarDesdeZonas(empatados, 99);
  assert.deepEqual(a, sembrarDesdeZonas(empatados, 99), "misma semilla, mismo resultado");
  assert.deepEqual(a, sembrarDesdeZonas([...empatados].reverse(), 99), "no depende del orden de entrada");

  const primeros = new Set<string>();
  for (let semilla = 1; semilla <= 40; semilla++) primeros.add(sembrarDesdeZonas(empatados, semilla)[0]);
  assert.ok(primeros.size >= 3, "con semillas distintas el mejor sembrado empatado cambia (no es siempre la zona A)");
});

test("criterio: mejor rendimiento gana el desempate antes que el sorteo (victorias, luego sets, luego games)", () => {
  const base = { zonaId: "A", posicion: 1, partidosJugados: 2 };
  const porSets = sembrarDesdeZonas(
    [
      { ...base, parejaId: "P1", zonaId: "A", victorias: 2, diferenciaSets: 2, diferenciaGames: 20 },
      { ...base, parejaId: "P2", zonaId: "B", victorias: 2, diferenciaSets: 4, diferenciaGames: 1 },
    ],
    3,
  );
  assert.deepEqual(porSets, ["P2", "P1"]);
  const porGames = sembrarDesdeZonas(
    [
      { ...base, parejaId: "P1", zonaId: "A", victorias: 2, diferenciaSets: 4, diferenciaGames: 5 },
      { ...base, parejaId: "P2", zonaId: "B", victorias: 2, diferenciaSets: 4, diferenciaGames: 9 },
    ],
    3,
  );
  assert.deepEqual(porGames, ["P2", "P1"]);
});

test("criterio: evitar cruces de la misma zona solo intercambia parejas de la misma posición", () => {
  // 3 zonas, clasifican 2: cuadro de 8 con 2 byes; 3° vs 6° y 4° vs 5° se juegan.
  const datos = ["A", "B", "C"].flatMap((z) => [
    { parejaId: `${z}1`, zonaId: z, posicion: 1, partidosJugados: 2, victorias: 2, diferenciaSets: 4, diferenciaGames: 12 },
    { parejaId: `${z}2`, zonaId: z, posicion: 2, partidosJugados: 2, victorias: 1, diferenciaSets: 0, diferenciaGames: 0 },
  ]);
  for (let semilla = 1; semilla <= 30; semilla++) {
    const siembra = sembrarDesdeZonas(datos, semilla);
    assert.ok(siembra.slice(0, 3).every((id) => id.endsWith("1")), `primeros primero (semilla ${semilla})`);
    assert.ok(siembra.slice(3).every((id) => id.endsWith("2")), `segundos después (semilla ${semilla})`);
    const zona = new Map(datos.map((d) => [d.parejaId, d.zonaId]));
    const cuadro = generarCuadro("C1", siembra);
    for (const p of cuadro.partidos.filter((x) => x.ronda === 1 && !x.esBye)) {
      assert.notEqual(zona.get(p.pareja1Id!), zona.get(p.pareja2Id!), `cruce de la misma zona (semilla ${semilla})`);
    }
  }
});

test("semillaDesdeTexto es estable y distingue textos; etiquetaFase da nombres legibles", () => {
  assert.equal(semillaDesdeTexto("abc"), semillaDesdeTexto("abc"));
  assert.notEqual(semillaDesdeTexto("abc"), semillaDesdeTexto("abd"));
  assert.ok(Number.isInteger(semillaDesdeTexto("competencia-1")) && semillaDesdeTexto("competencia-1") >= 0);
  assert.equal(etiquetaFase("final"), "Final");
  assert.equal(etiquetaFase("semifinal"), "Semifinal");
  assert.equal(etiquetaFase("cuartos_final"), "Cuartos de final");
  assert.equal(etiquetaFase("octavos_final"), "Octavos de final");
  assert.equal(etiquetaFase("ronda_de_64"), "Ronda de 64");
  assert.equal(etiquetaFase("algo_raro"), "algo raro");
});
