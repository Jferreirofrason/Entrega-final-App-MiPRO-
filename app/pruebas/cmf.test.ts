import test from "node:test";
import assert from "node:assert/strict";
import {
  PENDIENTE_DE_CMF,
  afirmaSinIntereses,
  alcanzaCredito,
  calcularPlan,
  estadoDePlanes,
  planesDeLaCompra,
} from "../src/app/logic/cmf.ts";
import { PLANES_DEMO } from "../src/app/data/cmf.ts";

test("CM · un plan sin recargo reparte el importe de la compra", () => {
  const p = calcularPlan(45, { id: "x", cuotas: 3, recargo: 0 });
  assert.equal(p.total, 45);
  assert.equal(p.montoCuota, 15);
  assert.equal(p.conCargos, false);
});

test("CM · un plan con recargo lo suma al total y la cuota sale de ahí", () => {
  const p = calcularPlan(100, { id: "x", cuotas: 6, recargo: 0.1 });
  assert.equal(p.total, 110);
  assert.equal(p.montoCuota, 18.33);
  assert.equal(p.conCargos, true);
});

test("CM · una sola cuota es el total de la compra", () => {
  const p = calcularPlan(45, { id: "x", cuotas: 1, recargo: 0 });
  assert.equal(p.montoCuota, 45);
  assert.equal(p.total, 45);
});

test("CM · si cambia el importe, los planes se recalculan", () => {
  const antes = planesDeLaCompra(PLANES_DEMO, 45);
  const despues = planesDeLaCompra(PLANES_DEMO, 40);
  assert.equal(antes.length, PLANES_DEMO.length);
  assert.notDeepEqual(
    antes.map((p) => p.montoCuota),
    despues.map((p) => p.montoCuota),
    "las cuotas no pueden quedar con el importe viejo",
  );
  for (const p of despues) {
    assert.equal(p.total, Math.round(40 * (1 + p.recargo) * 100) / 100);
  }
});

test("CM · el crédito disponible manda", () => {
  assert.equal(alcanzaCredito(50, 100), true);
  assert.equal(alcanzaCredito(50, 50), true, "justo alcanza");
  assert.equal(alcanzaCredito(50, 20), false);
  assert.equal(alcanzaCredito(50, undefined), true, "sin dato no se inventa un rechazo");
});

test("CM · los estados de la consulta de planes", () => {
  const planes = planesDeLaCompra(PLANES_DEMO, 45);
  assert.equal(estadoDePlanes(planes, 500), "ok");
  assert.equal(estadoDePlanes([], 500), "sin-planes");
  assert.equal(estadoDePlanes(planes, 1), "credito-insuficiente");
  assert.equal(estadoDePlanes(planes), "ok", "sin dato de crédito, se ofrecen");
});

test("CM · lo pendiente de CMF queda declarado en el código", () => {
  assert.ok(PENDIENTE_DE_CMF.length >= 5);
  const texto = PENDIENTE_DE_CMF.join(" ").toLowerCase();
  for (const tema of ["integración", "cuotas", "cargos", "crédito"]) {
    assert.ok(texto.includes(tema), `falta declarar: ${tema}`);
  }
});

test('CM · "sin intereses" solo se dice cuando el plan lo confirma', () => {
  const sinDato = calcularPlan(45, { id: "x", cuotas: 3, recargo: 0 });
  assert.equal(
    afirmaSinIntereses(sinDato),
    false,
    "un recargo en cero sin la bandera no alcanza para afirmarlo",
  );

  const confirmado = calcularPlan(45, { id: "y", cuotas: 3, recargo: 0, sinIntereses: true });
  assert.equal(afirmaSinIntereses(confirmado), true);

  // Si trae cargos informados, no se dice, aunque venga la bandera: la
  // pantalla no puede contradecirse sola.
  const contradictorio = calcularPlan(45, {
    id: "z",
    cuotas: 6,
    recargo: 0.08,
    sinIntereses: true,
    cargos: "Incluye cargos de financiación",
  });
  assert.equal(afirmaSinIntereses(contradictorio), false);
});

test("CM · en la demo, el plan con recargo no se presenta sin intereses", () => {
  const planes = planesDeLaCompra(PLANES_DEMO, 45);
  const conCargos = planes.filter((p) => p.conCargos);
  assert.ok(conCargos.length > 0, "la demo tiene que mostrar el caso con cargos");
  for (const p of conCargos) {
    assert.equal(afirmaSinIntereses(p), false);
  }
});
