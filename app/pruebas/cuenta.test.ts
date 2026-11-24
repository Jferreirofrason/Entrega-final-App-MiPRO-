import test from "node:test";
import assert from "node:assert/strict";
import {
  confirmacionValida,
  cuantosPendientes,
  PALABRA_DE_CONFIRMACION,
  PENDIENTE_DE_LA_BAJA,
  sePuedeEliminar,
} from "../src/app/logic/cuenta.ts";

const sinNada = { servicios: 0, garantias: 0, reclamos: 0, pagosEnCurso: 0 };

test("CU · sin nada abierto, la baja se puede pedir desde la app", () => {
  assert.equal(sePuedeEliminar(sinNada), true);
  assert.equal(cuantosPendientes(sinNada), 0);
});

test("CU · cualquier cosa abierta manda a soporte", () => {
  assert.equal(sePuedeEliminar({ ...sinNada, servicios: 1 }), false);
  assert.equal(sePuedeEliminar({ ...sinNada, garantias: 1 }), false);
  assert.equal(sePuedeEliminar({ ...sinNada, reclamos: 1 }), false);
  assert.equal(sePuedeEliminar({ ...sinNada, pagosEnCurso: 1 }), false);
});

test("CU · la confirmación pide la palabra exacta", () => {
  assert.equal(confirmacionValida("ELIMINAR"), true);
  assert.equal(confirmacionValida("  ELIMINAR  "), true, "los espacios de los costados no cuentan");
  assert.equal(confirmacionValida("eliminar"), false, "en minúscula no habilita");
  assert.equal(confirmacionValida("Eliminar"), false);
  assert.equal(confirmacionValida("ELIMINAR MI CUENTA"), false);
  assert.equal(confirmacionValida(""), false);
  assert.equal(PALABRA_DE_CONFIRMACION, "ELIMINAR");
});

test("CU · lo pendiente de la baja queda declarado en el código", () => {
  assert.ok(PENDIENTE_DE_LA_BAJA.length >= 5);
  const texto = PENDIENTE_DE_LA_BAJA.join(" ").toLowerCase();
  for (const tema of ["retención", "facturas", "garantía", "autenticación", "soporte"]) {
    assert.ok(texto.includes(tema), `falta declarar: ${tema}`);
  }
});
