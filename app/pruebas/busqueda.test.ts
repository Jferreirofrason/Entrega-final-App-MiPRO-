import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarTermino, esTerminoBuscable } from "../src/app/logic/busqueda.ts";

test("el término viaja limpio al catálogo: sin espacios sobrantes", () => {
  assert.equal(normalizarTermino("  aire   acondicionado  "), "aire acondicionado");
});

test("un término con contenido es buscable", () => {
  assert.equal(esTerminoBuscable("aire acondicionado"), true);
});

test("vacío o solo espacios no dispara la búsqueda", () => {
  assert.equal(esTerminoBuscable(""), false);
  assert.equal(esTerminoBuscable("    "), false);
});
