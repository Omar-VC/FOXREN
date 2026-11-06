import test from "node:test";
import assert from "node:assert/strict";

import {
  NOMBRE_JUGADOR_RESERVADO,
  nombreVisibleJugador,
} from "../src/domain/jugador/jugador.nombrePublico.ts";

const vigente = (autorizaApodo: boolean) => ({
  autorizaPerfil: true,
  autorizaApodo,
  origen: "formulario_publico" as const,
  estado: "vigente" as const,
  fechaDecision: new Date("2026-01-01"),
  fechaVerificacion: new Date("2026-01-02"),
});

const base = { nombre: "Ana", apellido: "Pérez", apodo: "Anita" };

test("sin consentimiento o sin jugador: nombre reservado", () => {
  assert.equal(nombreVisibleJugador(undefined), NOMBRE_JUGADOR_RESERVADO);
  assert.equal(nombreVisibleJugador(base), NOMBRE_JUGADOR_RESERVADO);
  assert.equal(
    nombreVisibleJugador({
      ...base,
      consentimientoPublicacion: {
        autorizaPerfil: true,
        autorizaApodo: true,
        origen: "formulario_publico",
        estado: "pendiente_verificacion",
        fechaDecision: new Date(),
      },
    }),
    NOMBRE_JUGADOR_RESERVADO,
  );
});

test("consentimiento vigente: nombre y apellido, apodo solo si lo autorizó", () => {
  assert.equal(
    nombreVisibleJugador({ ...base, consentimientoPublicacion: vigente(false) }),
    "Ana Pérez",
  );
  assert.equal(
    nombreVisibleJugador({ ...base, consentimientoPublicacion: vigente(true) }),
    'Ana Pérez "Anita"',
  );
});

test("consentimiento revocado vuelve a reservar el nombre", () => {
  assert.equal(
    nombreVisibleJugador({
      ...base,
      consentimientoPublicacion: { ...vigente(true), estado: "revocado", fechaRetiro: new Date() },
    }),
    NOMBRE_JUGADOR_RESERVADO,
  );
});

import { consentimientoVigentePorAprobacion } from "../src/domain/jugador/jugador.publicacion.rules.ts";

const pendiente = {
  autorizaPerfil: true,
  autorizaApodo: false,
  origen: "formulario_publico" as const,
  estado: "pendiente_verificacion" as const,
  fechaDecision: new Date("2026-01-01"),
};

test("aprobar la solicitud deja vigente un permiso explícito del formulario", () => {
  const resultado = consentimientoVigentePorAprobacion(pendiente, "uid-admin", new Date("2026-02-01"));
  assert.equal(resultado.estado, "vigente");
  assert.equal(resultado.verificadoPorUid, "uid-admin");
  assert.equal(
    nombreVisibleJugador({ nombre: "Ana", apellido: "Pérez", consentimientoPublicacion: resultado }),
    "Ana Pérez",
  );
});

test("aprobar no publica sin permiso explícito ni reactiva un permiso revocado", () => {
  const sinDecision = {
    autorizaPerfil: false,
    autorizaApodo: false,
    origen: "sin_decision_explicita" as const,
    estado: "sin_decision" as const,
  };
  assert.deepEqual(consentimientoVigentePorAprobacion(sinDecision, "uid-admin"), sinDecision);
  assert.equal(
    consentimientoVigentePorAprobacion({ ...pendiente, autorizaPerfil: false, estado: "no_autorizado" }, "uid-admin").estado,
    "no_autorizado",
  );
  const revocado = { ...pendiente, estado: "revocado" as const, fechaRetiro: new Date() };
  assert.equal(consentimientoVigentePorAprobacion(revocado, "uid-admin").estado, "revocado");
});
