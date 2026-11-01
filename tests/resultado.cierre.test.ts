import test from "node:test";
import assert from "node:assert/strict";

import {
  estadoPartidoDesdeResultado,
  exigirParejasDefinidas,
  formatoDelPartido,
  planificarCierreResultado,
} from "../src/domain/resultado/resultado.cierre.ts";
import type { PartidoParaCierre } from "../src/domain/resultado/resultado.cierre.ts";
import { generarCuadro } from "../src/domain/competencia/competencia.playoff.rules.ts";
import type { Resultado } from "../src/domain/resultado/resultado.types.ts";
import type { SetResultado } from "../src/domain/partido/partido.types.ts";

const set = (n: number, j1: number, j2: number): SetResultado => ({
  setNumero: n,
  juegosPareja1: j1,
  juegosPareja2: j2,
});

const superTb = (n: number, p1: number, p2: number): SetResultado => ({
  setNumero: n,
  juegosPareja1: p1 > p2 ? 1 : 0,
  juegosPareja2: p1 > p2 ? 0 : 1,
  tieBreakPareja1: p1,
  tieBreakPareja2: p2,
  tipo: "super_tiebreak",
});

type NuevoResultado = Omit<Resultado, "id">;

const base = { partidoId: "p", oficial: true, fechaRegistro: new Date() };

/** Resultado normal 6-2 6-2 a favor de la pareja indicada. */
const gana = (ladoGanador: 1 | 2, ganadorParejaId: string): NuevoResultado => ({
  ...base,
  tipo: "normal",
  sets: ladoGanador === 1 ? [set(1, 6, 2), set(2, 6, 2)] : [set(1, 2, 6), set(2, 2, 6)],
  ganadorParejaId,
});

const compEnCurso = {
  estado: "en_curso" as const,
  formatoPartidoZona: "mejor_de_3" as const,
  formatoPartidoPlayoff: "mejor_de_3" as const,
};

const partidoZona: PartidoParaCierre = {
  pareja1Id: "A",
  pareja2Id: "B",
  tipoPartido: "normal",
  esBye: false,
};

const partidoLlave: PartidoParaCierre = {
  pareja1Id: "A",
  pareja2Id: "B",
  tipoPartido: "eliminacion_directa",
  fase: "semifinal",
  partidoSiguienteId: "SIG",
  ladoSiguiente: 2,
  esBye: false,
};

const destinoVacio = { pareja1Id: null, pareja2Id: null };

/* ------------------------------ Zona ------------------------------ */

test("zona: resultado normal cierra el partido, sin avance ni campeón", () => {
  const plan = planificarCierreResultado({
    partido: partidoZona,
    competencia: { ...compEnCurso, estado: "inscripciones_cerradas" },
    resultado: gana(1, "A"),
    destino: null,
  });
  assert.equal(plan.estadoPartido, "finalizado");
  assert.equal(plan.ganadorParejaId, "A");
  assert.equal(plan.esLlave, false);
  assert.equal(plan.avance, null);
  assert.equal(plan.campeonParejaId, null);
});

test("zona: usa el formato de zona (un set) y no el del playoff", () => {
  const comp = { ...compEnCurso, formatoPartidoZona: "un_set" as const, formatoPartidoPlayoff: "mejor_de_3" as const };
  const unSet: NuevoResultado = { ...base, tipo: "normal", sets: [set(1, 6, 3)], ganadorParejaId: "A" };
  const plan = planificarCierreResultado({ partido: partidoZona, competencia: comp, resultado: unSet, destino: null });
  assert.equal(plan.ganadorParejaId, "A");
  assert.throws(
    () => planificarCierreResultado({ partido: partidoLlave, competencia: comp, resultado: unSet, destino: destinoVacio }),
    /no terminó: ninguna pareja ganó 2 sets/,
  );
});

test("llave: usa el formato del playoff (un set) aunque la zona sea mejor de 3", () => {
  const comp = { ...compEnCurso, formatoPartidoZona: "mejor_de_3" as const, formatoPartidoPlayoff: "un_set" as const };
  const unSet: NuevoResultado = { ...base, tipo: "normal", sets: [set(1, 6, 3)], ganadorParejaId: "A" };
  const plan = planificarCierreResultado({ partido: partidoLlave, competencia: comp, resultado: unSet, destino: destinoVacio });
  assert.equal(plan.ganadorParejaId, "A");
  assert.deepEqual(plan.avance, { partidoId: "SIG", datos: { pareja2Id: "A" } });
});

test("sin formato guardado se asume mejor de 3", () => {
  assert.equal(formatoDelPartido({ tipoPartido: "normal" }, {}), "mejor_de_3");
  assert.equal(formatoDelPartido({ tipoPartido: "eliminacion_directa" }, {}), "mejor_de_3");
});

test("zona: competencia finalizada o cancelada no admite resultados", () => {
  for (const estado of ["finalizada", "cancelada"] as const) {
    assert.throws(
      () => planificarCierreResultado({ partido: partidoZona, competencia: { ...compEnCurso, estado }, resultado: gana(1, "A"), destino: null }),
      /no se pueden cargar resultados/,
    );
  }
});

/* ------------------------- Validaciones comunes ------------------------- */

test("rechaza partidos con parejas sin definir, iguales o bye", () => {
  assert.throws(() => exigirParejasDefinidas({ pareja1Id: "A", pareja2Id: null, esBye: false }), /todavía no tiene las dos parejas/);
  assert.throws(() => exigirParejasDefinidas({ pareja1Id: null, pareja2Id: null, esBye: false }), /todavía no tiene las dos parejas/);
  assert.throws(() => exigirParejasDefinidas({ pareja1Id: "A", pareja2Id: "A", esBye: false }), /no pueden ser iguales/);
  assert.throws(() => exigirParejasDefinidas({ pareja1Id: "A", pareja2Id: null, esBye: true }), /bye/);
  assert.deepEqual(exigirParejasDefinidas({ pareja1Id: "A", pareja2Id: "B", esBye: false }), ["A", "B"]);
});

test("rechaza ganador que no coincide con el marcador o que no pertenece al partido", () => {
  assert.throws(
    () => planificarCierreResultado({ partido: partidoZona, competencia: compEnCurso, resultado: gana(1, "B"), destino: null }),
    /no coincide con el marcador/,
  );
  assert.throws(
    () => planificarCierreResultado({ partido: partidoZona, competencia: compEnCurso, resultado: gana(1, "Z"), destino: null }),
    /no pertenece al partido/,
  );
});

test("marcador 1-1 con dos sets devuelve un mensaje claro (antes asignaba la pareja 2 sin avisar)", () => {
  const r: NuevoResultado = { ...base, tipo: "normal", sets: [set(1, 6, 4), set(2, 3, 6)], ganadorParejaId: "B" };
  assert.throws(() => planificarCierreResultado({ partido: partidoZona, competencia: compEnCurso, resultado: r, destino: null }), /1-1/);
});

test("mejor de 3 con súper tie-break como tercer set", () => {
  const r: NuevoResultado = {
    ...base,
    tipo: "normal",
    sets: [set(1, 6, 4), set(2, 3, 6), superTb(3, 8, 10)],
    ganadorParejaId: "B",
  };
  const plan = planificarCierreResultado({ partido: partidoZona, competencia: compEnCurso, resultado: r, destino: null });
  assert.equal(plan.ganadorParejaId, "B");
});

test("walkover y abandono definen estado y ganador; suspensión deja el partido abierto", () => {
  const wo: NuevoResultado = { ...base, tipo: "walkover", sets: [], ganadorParejaId: "B" };
  assert.equal(planificarCierreResultado({ partido: partidoZona, competencia: compEnCurso, resultado: wo, destino: null }).estadoPartido, "walkover");
  const ab: NuevoResultado = { ...base, tipo: "abandono", sets: [set(1, 3, 2)], ganadorParejaId: "A" };
  assert.equal(planificarCierreResultado({ partido: partidoZona, competencia: compEnCurso, resultado: ab, destino: null }).estadoPartido, "abandono");
  const su: NuevoResultado = { ...base, tipo: "suspension", sets: [] };
  const plan = planificarCierreResultado({ partido: partidoZona, competencia: compEnCurso, resultado: su, destino: null });
  assert.equal(plan.estadoPartido, "suspendido");
  assert.equal(plan.ganadorParejaId, null);
  assert.equal(estadoPartidoDesdeResultado("suspension"), "suspendido");
});

/* ------------------------------ Llave ------------------------------ */

test("llave: avanza al ganador al lado guardado del partido siguiente", () => {
  const plan = planificarCierreResultado({ partido: partidoLlave, competencia: compEnCurso, resultado: gana(1, "A"), destino: destinoVacio });
  assert.deepEqual(plan.avance, { partidoId: "SIG", datos: { pareja2Id: "A" } });
  assert.equal(plan.campeonParejaId, null);

  const lado1 = { ...partidoLlave, ladoSiguiente: 1 as const };
  const plan1 = planificarCierreResultado({ partido: lado1, competencia: compEnCurso, resultado: gana(2, "B"), destino: destinoVacio });
  assert.deepEqual(plan1.avance, { partidoId: "SIG", datos: { pareja1Id: "B" } });
});

test("llave: walkover también avanza al ganador", () => {
  const wo: NuevoResultado = { ...base, tipo: "walkover", sets: [], ganadorParejaId: "B" };
  const plan = planificarCierreResultado({ partido: partidoLlave, competencia: compEnCurso, resultado: wo, destino: destinoVacio });
  assert.deepEqual(plan.avance?.datos, { pareja2Id: "B" });
});

test("llave: suspensión no avanza a nadie y no define campeón", () => {
  const su: NuevoResultado = { ...base, tipo: "suspension", sets: [] };
  const plan = planificarCierreResultado({ partido: partidoLlave, competencia: compEnCurso, resultado: su, destino: destinoVacio });
  assert.equal(plan.estadoPartido, "suspendido");
  assert.equal(plan.avance, null);
  assert.equal(plan.campeonParejaId, null);
});

test("llave: no pisa un lugar ocupado por otra pareja, pero tolera repetir la misma", () => {
  assert.throws(
    () => planificarCierreResultado({ partido: partidoLlave, competencia: compEnCurso, resultado: gana(1, "A"), destino: { pareja1Id: null, pareja2Id: "OTRA" } }),
    /ya está ocupado/,
  );
  const plan = planificarCierreResultado({ partido: partidoLlave, competencia: compEnCurso, resultado: gana(1, "A"), destino: { pareja1Id: null, pareja2Id: "A" } });
  assert.deepEqual(plan.avance?.datos, { pareja2Id: "A" });
});

test("llave: la final define al campeón", () => {
  const final: PartidoParaCierre = { pareja1Id: "A", pareja2Id: "B", tipoPartido: "eliminacion_directa", fase: "final", esBye: false };
  const plan = planificarCierreResultado({ partido: final, competencia: compEnCurso, resultado: gana(2, "B"), destino: null });
  assert.equal(plan.campeonParejaId, "B");
  assert.equal(plan.avance, null);
  assert.equal(plan.estadoPartido, "finalizado");
});

test("llave: exige competencia en curso y resultado oficial", () => {
  assert.throws(
    () => planificarCierreResultado({ partido: partidoLlave, competencia: { ...compEnCurso, estado: "inscripciones_cerradas" }, resultado: gana(1, "A"), destino: destinoVacio }),
    /en curso/,
  );
  assert.throws(
    () => planificarCierreResultado({ partido: partidoLlave, competencia: compEnCurso, resultado: { ...gana(1, "A"), oficial: false }, destino: destinoVacio }),
    /debe ser oficial/,
  );
});

test("llave: detecta una llave sin enlaces (generada con el sistema anterior)", () => {
  const sinEnlaces: PartidoParaCierre = { pareja1Id: "A", pareja2Id: "B", tipoPartido: "eliminacion_directa", fase: "semifinal", esBye: false };
  assert.throws(
    () => planificarCierreResultado({ partido: sinEnlaces, competencia: compEnCurso, resultado: gana(1, "A"), destino: null }),
    /sin enlaces/,
  );
});

test("llave: si el partido siguiente no existe lo informa", () => {
  assert.throws(
    () => planificarCierreResultado({ partido: partidoLlave, competencia: compEnCurso, resultado: gana(1, "A"), destino: null }),
    /No se encontró el partido siguiente/,
  );
});

/* ----------------- Simulación de llaves completas ----------------- */

const seedDe = (id: string) => Number(id.slice(1));

function jugarLlave(n: number, formatoPlayoff: "un_set" | "mejor_de_3") {
  const cuadro = generarCuadro("C1", Array.from({ length: n }, (_, i) => `S${i + 1}`));
  const porId = new Map(cuadro.partidos.map((p) => [p.id, { ...p }]));
  const competencia = { ...compEnCurso, formatoPartidoPlayoff: formatoPlayoff };

  let campeon: string | null = null;
  let jugados = 0;

  for (const original of [...porId.values()].sort((a, b) => a.orden - b.orden)) {
    if (original.esBye) continue;
    const partido = porId.get(original.id)!;
    assert.ok(partido.pareja1Id && partido.pareja2Id, `partido ${partido.id} sin parejas al llegarle el turno`);

    const lado = seedDe(partido.pareja1Id) < seedDe(partido.pareja2Id) ? 1 : 2;
    const ganador = lado === 1 ? partido.pareja1Id : partido.pareja2Id;
    const sets: SetResultado[] = formatoPlayoff === "un_set"
      ? [lado === 1 ? set(1, 6, 2) : set(1, 2, 6)]
      : lado === 1 ? [set(1, 6, 2), set(2, 6, 2)] : [set(1, 2, 6), set(2, 2, 6)];

    const plan = planificarCierreResultado({
      partido,
      competencia,
      resultado: { ...base, partidoId: partido.id, tipo: "normal", sets, ganadorParejaId: ganador },
      destino: partido.partidoSiguienteId ? porId.get(partido.partidoSiguienteId)! : null,
    });

    partido.estado = plan.estadoPartido;
    partido.ganadorParejaId = plan.ganadorParejaId ?? undefined;
    if (plan.avance) Object.assign(porId.get(plan.avance.partidoId)!, plan.avance.datos);
    if (plan.campeonParejaId) campeon = plan.campeonParejaId;
    jugados++;
  }

  return { campeon, jugados, cuadro };
}

for (const n of [2, 3, 4, 5, 6, 7, 8, 12, 16, 20]) {
  for (const formato of ["mejor_de_3", "un_set"] as const) {
    test(`simulación: llave de ${n} parejas (${formato}) se juega entera y la mejor semilla es campeona`, () => {
      const { campeon, jugados, cuadro } = jugarLlave(n, formato);
      assert.equal(campeon, "S1");
      assert.equal(jugados, cuadro.partidos.length - cuadro.byes, "se juegan todos los partidos salvo los byes");
    });
  }
}
