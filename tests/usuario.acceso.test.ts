import test from "node:test";
import assert from "node:assert/strict";

import { resolverAcceso } from "../src/domain/usuario/usuario.acceso.ts";

const OWNER = "uid-owner";

test("el propietario es superadmin aunque no tenga documento", () => {
  assert.deepEqual(resolverAcceso(OWNER, OWNER, null), { uid: OWNER, rol: "superadmin" });
});

test("el propietario no puede ser degradado por un documento en usuarios", () => {
  const sesion = resolverAcceso(OWNER, OWNER, { rol: "complejo", complejoId: "c1", activo: false });
  assert.equal(sesion?.rol, "superadmin");
});

test("una cuenta de complejo activa entra con su complejoId", () => {
  assert.deepEqual(
    resolverAcceso("u1", OWNER, { rol: "complejo", complejoId: "c1", activo: true }),
    { uid: "u1", rol: "complejo", complejoId: "c1" },
  );
});

test("sin documento, inactiva o sin complejoId no hay acceso", () => {
  assert.equal(resolverAcceso("u1", OWNER, null), null);
  assert.equal(resolverAcceso("u1", OWNER, { rol: "complejo", complejoId: "c1", activo: false }), null);
  assert.equal(resolverAcceso("u1", OWNER, { rol: "complejo", activo: true }), null);
});

test("un documento no puede otorgar rol superadmin a otra cuenta", () => {
  assert.equal(resolverAcceso("u1", OWNER, { rol: "superadmin", activo: true }), null);
});

import { validarNuevoAcceso, passwordDesdeBytes } from "../src/domain/usuario/usuario.acceso.ts";

test("nuevo acceso: exige email válido y contraseña de 8 o más caracteres", () => {
  assert.equal(validarNuevoAcceso("ivan@padelzone.com", "abcd2345"), null);
  assert.match(validarNuevoAcceso("ivan", "abcd2345") ?? "", /email/i);
  assert.match(validarNuevoAcceso("ivan@padelzone.com", "corta") ?? "", /8 caracteres/);
});

test("contraseña generada: largo pedido, solo caracteres legibles", () => {
  const bytes = Array.from({ length: 12 }, (_, i) => i * 37);
  const password = passwordDesdeBytes(bytes);
  assert.equal(password.length, 12);
  assert.match(password, /^[A-HJ-NP-Za-km-z2-9]+$/);
});
