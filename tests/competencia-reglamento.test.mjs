import test from "node:test";
import assert from "node:assert/strict";
import {
  REGLAMENTO_BASE_FOXREN,
  reglamentoCompetenciaEsValido,
} from "../src/domain/competencia/competencia.reglamento.rules.ts";
import { clasificarParejasZona } from "../src/domain/competencia/competencia.tabla.ts";

test("el reglamento base FOXREN es válido y fija su desempate final", () => {
  assert.equal(reglamentoCompetenciaEsValido(REGLAMENTO_BASE_FOXREN), true);
  assert.equal(REGLAMENTO_BASE_FOXREN.empatePersistente, "partido_desempate");
});

test("una propuesta queda explícitamente pendiente y puede aprobarse", () => {
  const propuesta = {
    ...REGLAMENTO_BASE_FOXREN,
    origen: "propuesta_organizador",
    referencia: "Propuesta presentada para el torneo de prueba",
    estado: "pendiente_revision",
  };
  assert.equal(reglamentoCompetenciaEsValido(propuesta), true);
  assert.equal(reglamentoCompetenciaEsValido({ ...propuesta, estado: "aprobado" }), true);
});

test("rechaza criterios repetidos o referencias vacías", () => {
  assert.equal(reglamentoCompetenciaEsValido({
    ...REGLAMENTO_BASE_FOXREN,
    criteriosDesempate: ["victorias", "victorias", "diferencia_games"],
  }), false);
  assert.equal(reglamentoCompetenciaEsValido({
    ...REGLAMENTO_BASE_FOXREN,
    referencia: "  ",
  }), false);
});

test("aplica el orden de criterios guardado por competencia", () => {
  const tabla = {
    completa: true,
    partidosPendientes: 0,
    filas: [
      { parejaId: "A", posicion: 1, partidosJugados: 3, victorias: 2, derrotas: 1,
        setsGanados: 4, setsPerdidos: 4, diferenciaSets: 0,
        gamesGanados: 20, gamesPerdidos: 20, diferenciaGames: 0 },
      { parejaId: "B", posicion: 2, partidosJugados: 3, victorias: 1, derrotas: 2,
        setsGanados: 4, setsPerdidos: 3, diferenciaSets: 1,
        gamesGanados: 20, gamesPerdidos: 20, diferenciaGames: 0 },
    ],
  };
  const criterios = ["diferencia_sets", "victorias", "diferencia_games"];
  assert.deepEqual(
    clasificarParejasZona(tabla, 1, criterios).clasificados,
    ["B"],
  );
});
