import test from "node:test";
import assert from "node:assert/strict";

import { planificarPlayoff } from "../src/domain/competencia/competencia.playoff.preparacion.ts";
import { calcularTablaZona } from "../src/domain/competencia/competencia.tabla.ts";
import type { Partido, SetResultado } from "../src/domain/partido/partido.types.ts";
import type { Resultado } from "../src/domain/resultado/resultado.types.ts";
import type { Zona } from "../src/domain/competencia/competencia.zonas.types.ts";

const CRITERIOS = ["victorias", "diferencia_sets", "diferencia_games"] as const;
const criterios = [...CRITERIOS];

const set = (n: number, j1: number, j2: number): SetResultado => ({
  setNumero: n,
  juegosPareja1: j1,
  juegosPareja2: j2,
});

const zona = (id: string, ids: string[], orden: number): Zona => ({
  id,
  competenciaId: "C1",
  nombre: `Zona ${id}`,
  parejaIds: ids,
  orden,
});

/** Todos contra todos; `gana(a, b)` decide quién gana cada cruce (siempre 6-2 6-2). */
function liga(
  zonaId: string,
  ids: string[],
  gana: (a: string, b: string) => string,
  sinResultadoHasta?: number,
) {
  const partidos: Partido[] = [];
  const resultados: Resultado[] = [];
  let n = 0;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i];
      const b = ids[j];
      const id = `${zonaId}-${i}-${j}`;
      const ganador = gana(a, b);
      const sets = ganador === a ? [set(1, 6, 2), set(2, 6, 2)] : [set(1, 2, 6), set(2, 2, 6)];
      const conResultado = sinResultadoHasta === undefined || n < sinResultadoHasta;
      partidos.push({
        id,
        competenciaId: "C1",
        zonaId,
        pareja1Id: a,
        pareja2Id: b,
        estado: conResultado ? "finalizado" : "pendiente",
        sets: conResultado ? sets : [],
        ganadorParejaId: conResultado ? ganador : undefined,
        orden: n,
      });
      if (conResultado) {
        resultados.push({
          id,
          partidoId: id,
          tipo: "normal",
          sets,
          ganadorParejaId: ganador,
          oficial: true,
          fechaRegistro: new Date(),
        } as Resultado);
      }
      n++;
    }
  }
  return { partidos, resultados };
}

const ganaElPrimero = (a: string, b: string) => (a < b ? a : b);

function entradaZonas(
  definicion: Array<{ id: string; ids: string[]; gana?: (a: string, b: string) => string; sinResultadoHasta?: number }>,
  clasifican: number,
) {
  const zonas: Zona[] = [];
  const partidos: Partido[] = [];
  const resultados: Resultado[] = [];
  definicion.forEach((d, indice) => {
    zonas.push(zona(d.id, d.ids, indice + 1));
    const l = liga(d.id, d.ids, d.gana ?? ganaElPrimero, d.sinResultadoHasta);
    partidos.push(...l.partidos);
    resultados.push(...l.resultados);
  });
  return {
    competenciaId: "C1",
    formato: "zonas_eliminacion_directa" as const,
    parejaIdsActivas: [],
    zonas,
    partidos,
    resultados,
    parejasClasificanPorZona: clasifican,
    formatoPartidoZona: "mejor_de_3" as const,
    criteriosDesempate: criterios,
    semilla: 1,
  };
}

test("2 zonas de 3, clasifican 2: cuadro de 4 sin byes y sin cruces de la misma zona", () => {
  const plan = planificarPlayoff(
    entradaZonas([{ id: "A", ids: ["A1", "A2", "A3"] }, { id: "B", ids: ["B1", "B2", "B3"] }], 2),
  );
  assert.equal(plan.ok, true);
  if (!plan.ok) return;
  assert.equal(plan.cuadro.tamano, 4);
  assert.equal(plan.cuadro.byes, 0);
  assert.equal(plan.cuadro.partidos.length, 3);
  assert.deepEqual([...plan.siembra].sort(), ["A1", "A2", "B1", "B2"]);
  for (const p of plan.cuadro.partidos.filter((x) => x.ronda === 1)) {
    assert.notEqual(p.pareja1Id![0], p.pareja2Id![0], "no se cruzan dos de la misma zona");
  }
});

test("3 zonas de 3, clasifican 2: 6 parejas, cuadro de 8 con 2 byes", () => {
  const plan = planificarPlayoff(
    entradaZonas(
      [
        { id: "A", ids: ["A1", "A2", "A3"] },
        { id: "B", ids: ["B1", "B2", "B3"] },
        { id: "C", ids: ["C1", "C2", "C3"] },
      ],
      2,
    ),
  );
  assert.equal(plan.ok, true);
  if (!plan.ok) return;
  assert.equal(plan.cuadro.tamano, 8);
  assert.equal(plan.cuadro.byes, 2);
  assert.equal(plan.cuadro.partidos.length, 7);
  // Los tres primeros de zona van primero (el orden entre ellos lo define el sorteo).
  assert.deepEqual([...plan.siembra.slice(0, 3)].sort(), ["A1", "B1", "C1"]);
});

test("zona con partidos sin resultado oficial bloquea el playoff", () => {
  const plan = planificarPlayoff(
    entradaZonas(
      [{ id: "A", ids: ["A1", "A2", "A3"], sinResultadoHasta: 2 }, { id: "B", ids: ["B1", "B2", "B3"] }],
      2,
    ),
  );
  assert.equal(plan.ok, false);
  if (plan.ok) return;
  assert.equal(plan.bloqueos.length, 1);
  assert.match(plan.bloqueos[0], /Zona A.*faltan 1 partido/);
});

test("empate total en el corte bloquea (A1>A2, A3>A1, A2>A3)", () => {
  const ciclo = (a: string, b: string) => {
    const par = [a, b].sort().join("-");
    return par === "A1-A2" ? "A1" : par === "A1-A3" ? "A3" : "A2";
  };
  const plan = planificarPlayoff(
    entradaZonas([{ id: "A", ids: ["A1", "A2", "A3"], gana: ciclo }, { id: "B", ids: ["B1", "B2", "B3"] }], 1),
  );
  assert.equal(plan.ok, false);
  if (plan.ok) return;
  assert.match(plan.bloqueos[0], /Zona A.*empate/);
});

test("no pueden clasificar tantas parejas como tiene la zona", () => {
  const plan = planificarPlayoff(
    entradaZonas([{ id: "A", ids: ["A1", "A2"] }, { id: "B", ids: ["B1", "B2", "B3"] }], 2),
  );
  assert.equal(plan.ok, false);
  if (plan.ok) return;
  assert.match(plan.bloqueos[0], /Zona A tiene 2 parejas: no pueden clasificar 2/);
});

test("sin zonas generadas no se puede armar el playoff", () => {
  const plan = planificarPlayoff({ ...entradaZonas([], 2) });
  assert.equal(plan.ok, false);
});

test("eliminación directa: 6 parejas con byes, sorteo reproducible e independiente del orden de entrada", () => {
  const ids = ["P1", "P2", "P3", "P4", "P5", "P6"];
  const base = {
    competenciaId: "C1",
    formato: "eliminacion_directa" as const,
    zonas: [],
    partidos: [],
    resultados: [],
    parejasClasificanPorZona: 2,
    formatoPartidoZona: "mejor_de_3" as const,
    semilla: 7,
  };
  const a = planificarPlayoff({ ...base, parejaIdsActivas: ids });
  const b = planificarPlayoff({ ...base, parejaIdsActivas: [...ids].reverse() });
  assert.equal(a.ok && b.ok, true);
  if (!a.ok || !b.ok) return;
  assert.deepEqual(a.siembra, b.siembra);
  assert.equal(a.cuadro.cantidadParejas, 6);
  assert.equal(a.cuadro.byes, 2);

  const c = planificarPlayoff({ ...base, semilla: 8, parejaIdsActivas: ids });
  assert.equal(c.ok, true);
  if (c.ok) assert.notDeepEqual(c.siembra, a.siembra);
});

test("eliminación directa con menos de 2 parejas bloquea", () => {
  const plan = planificarPlayoff({
    competenciaId: "C1",
    formato: "eliminacion_directa",
    parejaIdsActivas: ["P1"],
    zonas: [],
    partidos: [],
    resultados: [],
    parejasClasificanPorZona: 2,
    formatoPartidoZona: "mejor_de_3",
    semilla: 1,
  });
  assert.equal(plan.ok, false);
});

/* ---------------- Tabla: formato y súper tie-break ---------------- */

const zonaDos = zona("A", ["A1", "A2"], 1);
const partidoDos = (sets: SetResultado[]): Partido => ({
  id: "p",
  competenciaId: "C1",
  zonaId: "A",
  pareja1Id: "A1",
  pareja2Id: "A2",
  estado: "finalizado",
  sets,
  ganadorParejaId: "A1",
  orden: 1,
});
const resultadoDos = (sets: SetResultado[]): Resultado =>
  ({
    id: "p",
    partidoId: "p",
    tipo: "normal",
    sets,
    ganadorParejaId: "A1",
    oficial: true,
    fechaRegistro: new Date(),
  }) as Resultado;

test("tabla: el súper tie-break cuenta como set ganado pero no suma games", () => {
  const sets: SetResultado[] = [
    set(1, 6, 4),
    set(2, 3, 6),
    { setNumero: 3, juegosPareja1: 1, juegosPareja2: 0, tieBreakPareja1: 10, tieBreakPareja2: 8, tipo: "super_tiebreak" },
  ];
  const tabla = calcularTablaZona(zonaDos, [partidoDos(sets)], [resultadoDos(sets)], criterios, "mejor_de_3");
  const a1 = tabla.filas.find((f) => f.parejaId === "A1")!;
  assert.equal(a1.setsGanados, 2);
  assert.equal(a1.setsPerdidos, 1);
  assert.equal(a1.gamesGanados, 9);
  assert.equal(a1.gamesPerdidos, 10);
  assert.equal(tabla.completa, true);
});

test("tabla: con formato explícito es estricto; sin formato acepta ambos (compatibilidad)", () => {
  const sets = [set(1, 6, 2)];
  const tabla = calcularTablaZona(zonaDos, [partidoDos(sets)], [resultadoDos(sets)], criterios, "un_set");
  assert.equal(tabla.filas.find((f) => f.parejaId === "A1")!.victorias, 1);
  assert.throws(
    () => calcularTablaZona(zonaDos, [partidoDos(sets)], [resultadoDos(sets)], criterios, "mejor_de_3"),
    /no cumple las reglas deportivas/,
  );
  // Sin formato (llamadores que todavía no lo pasan): un set válido se acepta.
  const sinFormato = calcularTablaZona(zonaDos, [partidoDos(sets)], [resultadoDos(sets)], criterios);
  assert.equal(sinFormato.filas.find((f) => f.parejaId === "A1")!.victorias, 1);
  // ...pero un marcador inválido en ambos formatos sigue rechazándose.
  const invalido = [set(1, 6, 5)];
  assert.throws(
    () => calcularTablaZona(zonaDos, [partidoDos(invalido)], [resultadoDos(invalido)], criterios),
    /no cumple las reglas deportivas/,
  );
});
