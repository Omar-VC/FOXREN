import test from "node:test";
import assert from "node:assert/strict";
import {
  construirJugadorPublico,
  consentimientoDesdeSolicitud,
  consentimientoPermitePublicar,
} from "../src/domain/jugador/jugador.publicacion.rules.ts";

const jugador = {
  id: "jugador-interno-1",
  dni: "12345678",
  nombre: "Ana",
  apellido: "Pádel",
  apodo: "La Zurda",
  sexo: "femenino",
  ciudad: "Ciudad privada",
  provincia: "Provincia privada",
  fechaNacimiento: new Date("1990-01-01T00:00:00.000Z"),
  ladoJuego: "drive",
  categoriaDeclarada: "5ta",
  estado: "activo",
  fechaRegistro: new Date("2025-01-01T00:00:00.000Z"),
};

const consentimientoVigente = {
  autorizaPerfil: true,
  autorizaApodo: true,
  origen: "formulario_publico",
  estado: "vigente",
  fechaDecision: new Date("2025-01-01T00:00:00.000Z"),
  fechaVerificacion: new Date("2025-01-02T00:00:00.000Z"),
};

test("solo permite publicación con consentimiento vigente y verificable", () => {
  assert.equal(consentimientoPermitePublicar(consentimientoVigente), true);
  assert.equal(consentimientoPermitePublicar({
    ...consentimientoVigente,
    estado: "pendiente_verificacion",
  }), false);
  assert.equal(consentimientoPermitePublicar({
    ...consentimientoVigente,
    fechaRetiro: new Date(),
  }), false);
  assert.equal(consentimientoPermitePublicar(undefined), false);
});

test("solicitudes antiguas o incompletas quedan sin autorización", () => {
  const consentimiento = consentimientoDesdeSolicitud({
    id: "solicitud-antigua",
    autorizaPublicacionPerfil: true,
  });

  assert.equal(consentimiento.autorizaPerfil, false);
  assert.equal(consentimiento.estado, "sin_decision");
});

test("el constructor usa lista permitida y exige permiso independiente para apodo", () => {
  const sinApodo = construirJugadorPublico(
    jugador,
    { ...consentimientoVigente, autorizaApodo: false },
    "publico-ana-1",
  );
  assert.deepEqual(sinApodo, {
    idPublico: "publico-ana-1",
    nombre: "Ana",
    apellido: "Pádel",
  });

  const conApodo = construirJugadorPublico(
    jugador,
    consentimientoVigente,
    "publico-ana-1",
  );
  assert.deepEqual(conApodo, {
    idPublico: "publico-ana-1",
    nombre: "Ana",
    apellido: "Pádel",
    apodo: "La Zurda",
  });
  for (const datoPrivado of ["dni", "fechaNacimiento", "ciudad", "provincia", "id"]) {
    assert.equal(datoPrivado in conApodo, false);
  }
});

test("un identificador interno no puede reutilizarse como ID público", () => {
  assert.equal(
    construirJugadorPublico(jugador, consentimientoVigente, jugador.id),
    null,
  );
});
