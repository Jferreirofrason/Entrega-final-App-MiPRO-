import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validarPromociones,
  ordenarPromociones,
  puedeAvanzar,
  puedeRetroceder,
  type PromocionConfig,
} from "../src/app/logic/promociones.ts";

function promo(parcial: Partial<PromocionConfig> & { id: string }): PromocionConfig {
  return {
    imagen: "https://example.com/imagen.jpg",
    descripcion: "Descripción accesible",
    titulo: "Pintura interior",
    beneficio: "Renueva tus espacios",
    detalle: "Renueva tus espacios con profesionales.",
    servicioDestino: null,
    orden: 1,
    ...parcial,
  };
}

test("las promociones se muestran según su orden de aparición, sin mutar la configuración", () => {
  const config = [
    promo({ id: "c", orden: 3 }),
    promo({ id: "a", orden: 1 }),
    promo({ id: "b", orden: 2 }),
  ];
  const ordenadas = ordenarPromociones(config);
  assert.deepEqual(ordenadas.map((p) => p.id), ["a", "b", "c"]);
  assert.deepEqual(config.map((p) => p.id), ["c", "a", "b"]);
});

// ── Configuración tipada ─────────────────────────────────────────────

test("una configuración completa no reporta errores", () => {
  const errores = validarPromociones([promo({ id: "a" }), promo({ id: "b" })]);
  assert.deepEqual(errores, []);
});

test("ids repetidos y campos faltantes se reportan", () => {
  const errores = validarPromociones([
    promo({ id: "a" }),
    promo({ id: "a", descripcion: "" }),
    promo({ id: "c", imagen: "" }),
    promo({ id: "d", beneficio: "" }),
  ]);
  assert.equal(errores.length, 4);
});

// ── Límites del carrusel (no infinito) ───────────────────────────────

test("desde la primera promoción se puede avanzar pero no retroceder", () => {
  assert.equal(puedeAvanzar(0, 4), true);
  assert.equal(puedeRetroceder(0), false);
});

test("en posiciones intermedias se puede ir y volver", () => {
  assert.equal(puedeAvanzar(2, 4), true);
  assert.equal(puedeRetroceder(2), true);
});

test("en la última promoción no se puede avanzar: el carrusel no es infinito", () => {
  assert.equal(puedeAvanzar(3, 4), false);
  assert.equal(puedeRetroceder(3), true);
});

test("con una sola promoción no hay hacia dónde moverse", () => {
  assert.equal(puedeAvanzar(0, 1), false);
  assert.equal(puedeRetroceder(0), false);
});
