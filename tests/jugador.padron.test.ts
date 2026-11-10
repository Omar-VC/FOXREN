import test from "node:test";
import assert from "node:assert/strict";

import {
  calcularCodigoDni,
  construirPadron,
  normalizarDni,
} from "../src/domain/jugador/jugador.padron.ts";

test("normalizarDni: deja solo dígitos", () => {
  assert.equal(normalizarDni("35.123.456"), "35123456");
  assert.equal(normalizarDni(" 35123456 "), "35123456");
  assert.equal(normalizarDni(""), "");
});

test("código de DNI: estable, igual con o sin puntos y sin contener el DNI", async () => {
  const a = await calcularCodigoDni("35123456");
  assert.equal(a, await calcularCodigoDni("35.123.456"));
  assert.notEqual(a, await calcularCodigoDni("35123457"));
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.ok(!a.includes("35123456"));
});

test("padrón: solo campos no sensibles", () => {
  const jugador = {
    nombre: " Ana ", apellido: "Pérez", categoriaDeclarada: "5ta", sexo: "femenino" as const,
    estado: "activo" as const,
    // campos que nunca deben llegar al padrón
    dni: "35123456", fechaNacimiento: new Date(), ladoJuego: "drive",
  };
  const padron = construirPadron(jugador);
  assert.deepEqual(padron, {
    nombre: "Ana", apellido: "Pérez", categoriaDeclarada: "5ta", sexo: "femenino", estado: "activo",
  });
});
