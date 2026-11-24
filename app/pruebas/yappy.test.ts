import test from "node:test";
import assert from "node:assert/strict";
import {
  PENDIENTE_DE_YAPPY,
  crearSolicitud,
  estaAprobada,
  estaVencida,
  formatearCuenta,
  hayPendiente,
  puedeIniciar,
  segundosRestantes,
} from "../src/app/logic/yappy.ts";

const AHORA = 1_700_000_000_000;

test("YA · la solicitud nace esperando y con su vencimiento", () => {
  const s = crearSolicitud(AHORA, 120);
  assert.equal(s.estado, "esperando");
  assert.equal(s.venceEn, AHORA + 120_000);
});

test("YA · la cuenta regresiva no baja de cero", () => {
  const s = crearSolicitud(AHORA, 120);
  assert.equal(segundosRestantes(s.venceEn, AHORA), 120);
  assert.equal(segundosRestantes(s.venceEn, AHORA + 60_000), 60);
  assert.equal(segundosRestantes(s.venceEn, AHORA + 120_000), 0);
  assert.equal(segundosRestantes(s.venceEn, AHORA + 999_000), 0);
});

test("YA · el tiempo se lee como reloj", () => {
  assert.equal(formatearCuenta(120), "2:00");
  assert.equal(formatearCuenta(9), "0:09");
  assert.equal(formatearCuenta(0), "0:00");
  assert.equal(formatearCuenta(61), "1:01");
});

test("YA · vence solo si estaba esperando y se acabó el tiempo", () => {
  const s = crearSolicitud(AHORA, 120);
  assert.equal(estaVencida(s, AHORA + 60_000), false);
  assert.equal(estaVencida(s, AHORA + 120_000), true);
  assert.equal(estaVencida({ ...s, estado: "aprobada" }, AHORA + 999_000), false);
  assert.equal(estaVencida({ ...s, estado: "rechazada" }, AHORA + 999_000), false);
});

test("YA · con una solicitud esperando no se pide otra", () => {
  assert.equal(puedeIniciar("esperando"), false, "nada de cobros duplicados");
  assert.equal(puedeIniciar("inactiva"), true);
  assert.equal(puedeIniciar("vencida"), true, "se puede reintentar");
  assert.equal(puedeIniciar("rechazada"), true);
});

test("YA · el pago está hecho SOLO con la aprobación", () => {
  assert.equal(estaAprobada("aprobada"), true);
  for (const estado of ["inactiva", "esperando", "rechazada", "vencida"] as const) {
    assert.equal(estaAprobada(estado), false, `${estado} no es un pago hecho`);
  }
});

test("YA · lo pendiente queda a la vista, y esperando se puede volver a consultar", () => {
  assert.equal(hayPendiente("esperando"), true);
  assert.equal(hayPendiente("vencida"), false);
  assert.ok(PENDIENTE_DE_YAPPY.length >= 4);
  assert.ok(PENDIENTE_DE_YAPPY.join(" ").toLowerCase().includes("integración"));
});
