import test from "node:test";
import assert from "node:assert/strict";

import { partidoMapper } from "../src/infrastructure/mappers/partido.mapper.ts";
import { generarCuadro } from "../src/domain/competencia/competencia.playoff.rules.ts";

test("toFirestore no deja valores undefined en ningún partido de la llave", () => {
  const cuadro = generarCuadro("C1", ["S1", "S2", "S3", "S4", "S5", "S6"]);
  for (const partido of cuadro.partidos) {
    const datos = partidoMapper.toFirestore(partido);
    assert.equal("id" in datos, false);
    for (const [clave, valor] of Object.entries(datos)) {
      assert.notEqual(valor, undefined, `campo ${clave} undefined`);
    }
  }
});

test("toFirestore: enlaces y bye se guardan; la final no tiene siguiente; huecos son null", () => {
  const cuadro = generarCuadro("C1", ["S1", "S2", "S3", "S4", "S5", "S6"]);

  const bye = cuadro.partidos.find((p) => p.esBye)!;
  const datosBye = partidoMapper.toFirestore(bye);
  assert.equal(datosBye.esBye, true);
  assert.equal(datosBye.ganadorParejaId, "S1");
  assert.ok(datosBye.partidoSiguienteId);
  assert.ok(datosBye.ladoSiguiente === 1 || datosBye.ladoSiguiente === 2);

  const final = cuadro.partidos.find((p) => p.fase === "final")!;
  const datosFinal = partidoMapper.toFirestore(final);
  assert.equal("partidoSiguienteId" in datosFinal, false);
  assert.equal(datosFinal.pareja1Id, null);
  assert.equal(datosFinal.pareja2Id, null);
});

test("fromFirestore: null de opcionales -> undefined, fechas -> Date, lugares sin pareja siguen en null", () => {
  const fecha = new Date("2026-11-01T10:00:00Z");
  const partido = partidoMapper.fromFirestore("P1", {
    competenciaId: "C1",
    pareja1Id: "A",
    pareja2Id: null,
    estado: "pendiente",
    sets: [],
    ganadorParejaId: null,
    orden: 3,
    fechaHora: { toDate: () => fecha },
    cancha: null,
    notas: null,
    ronda: 2,
    fase: "semifinal",
    partidoNumero: 1,
    tipoPartido: "eliminacion_directa",
    partidoSiguienteId: "SIG",
    ladoSiguiente: 2,
  });
  assert.equal(partido.id, "P1");
  assert.equal(partido.pareja1Id, "A");
  assert.equal(partido.pareja2Id, null);
  assert.equal(partido.ganadorParejaId, undefined);
  assert.equal(partido.cancha, undefined);
  assert.equal(partido.fechaHora?.getTime(), fecha.getTime());
  assert.equal(partido.ladoSiguiente, 2);
  assert.equal(partido.partidoSiguienteId, "SIG");
  assert.equal(partido.esBye, false);
});

test("fromFirestore: un partido de zona viejo (sin campos de llave) se lee sin errores", () => {
  const partido = partidoMapper.fromFirestore("P2", {
    competenciaId: "C1",
    zonaId: "Z1",
    pareja1Id: "A",
    pareja2Id: "B",
    estado: "finalizado",
    sets: [{ setNumero: 1, juegosPareja1: 6, juegosPareja2: 2 }],
    orden: 1,
  });
  assert.equal(partido.zonaId, "Z1");
  assert.equal(partido.tipoPartido, undefined);
  assert.equal(partido.partidoSiguienteId, undefined);
  assert.equal(partido.esBye, false);
  assert.equal(partido.sets.length, 1);
});

test("fromFirestore: un lado de enlace inválido se descarta", () => {
  const partido = partidoMapper.fromFirestore("P3", { competenciaId: "C1", ladoSiguiente: 3, estado: "pendiente" });
  assert.equal(partido.ladoSiguiente, undefined);
});
