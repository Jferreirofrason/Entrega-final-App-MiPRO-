import test from "node:test";
import assert from "node:assert/strict";
import {
  PENDIENTE_DE_NEGOCIO,
  buscarCupon,
  buscarRegalo,
  faltaParaConfirmar,
  normalizarCodigo,
  puedeConfirmar,
  regaloAlcanza,
  totalConDescuento,
} from "../src/app/logic/beneficios.ts";
import { CUPONES_DEMO, REGALOS_DEMO } from "../src/app/data/beneficios.ts";

test("BE · el código se compara sin espacios y en mayúsculas", () => {
  assert.equal(normalizarCodigo("  mipro 2026 "), "MIPRO2026");
  assert.equal(normalizarCodigo(""), "");
});

test("BE · un cupón conocido devuelve su descuento y el resto no", () => {
  assert.equal(buscarCupon("mipro2026", CUPONES_DEMO)?.descuento, 5);
  assert.equal(buscarCupon("MIPRO2026", CUPONES_DEMO)?.codigo, "MIPRO2026");
  assert.equal(buscarCupon("CUALQUIERA", CUPONES_DEMO), null);
  assert.equal(buscarCupon("", CUPONES_DEMO), null);
});

test("BE · el descuento se resta del subtotal y nunca deja un total negativo", () => {
  assert.equal(totalConDescuento(45, 5), 40);
  assert.equal(totalConDescuento(45, 0), 45);
  assert.equal(totalConDescuento(3, 5), 0, "no se devuelve plata");
  assert.equal(totalConDescuento(45.5, 0.25), 45.25);
});

test("BE · la tarjeta de regalo alcanza solo si el saldo cubre el total", () => {
  const grande = buscarRegalo("regalo100", REGALOS_DEMO);
  const chica = buscarRegalo("REGALO10", REGALOS_DEMO);
  assert.equal(regaloAlcanza(grande?.saldo ?? 0, 45), true);
  assert.equal(regaloAlcanza(chica?.saldo ?? 0, 45), false, "sin pago combinado definido");
  assert.equal(regaloAlcanza(45, 45), true, "justo alcanza");
  assert.equal(buscarRegalo("NOEXISTE", REGALOS_DEMO), null);
});

test("BE · no se confirma sin medio, sin facturación o sin condiciones", () => {
  const completo = {
    hayMedioElegido: true,
    condicionesAceptadas: true,
    facturacionCompleta: true,
  };
  assert.equal(puedeConfirmar(completo), true);
  assert.deepEqual(faltaParaConfirmar(completo), []);

  assert.deepEqual(faltaParaConfirmar({ ...completo, hayMedioElegido: false }), ["medio"]);
  assert.deepEqual(faltaParaConfirmar({ ...completo, condicionesAceptadas: false }), [
    "condiciones",
  ]);
  assert.deepEqual(faltaParaConfirmar({ ...completo, facturacionCompleta: false }), [
    "facturacion",
  ]);
  assert.deepEqual(
    faltaParaConfirmar({
      hayMedioElegido: false,
      condicionesAceptadas: false,
      facturacionCompleta: false,
    }),
    ["medio", "facturacion", "condiciones"],
  );
});

test("BE · con tarjeta de regalo, el pago espera a que esté validada", () => {
  const base = {
    hayMedioElegido: true,
    condicionesAceptadas: true,
    facturacionCompleta: true,
  };
  assert.equal(puedeConfirmar({ ...base, regalo: { estado: "valida" } }), true);
  assert.equal(puedeConfirmar({ ...base, regalo: { estado: "vacio" } }), false);
  assert.equal(puedeConfirmar({ ...base, regalo: { estado: "invalida" } }), false);
  assert.equal(
    puedeConfirmar({ ...base, regalo: { estado: "saldo-insuficiente" } }),
    false,
    "el pago combinado está pendiente de definición",
  );
});

test("BE · lo pendiente de negocio queda declarado en el código", () => {
  assert.ok(PENDIENTE_DE_NEGOCIO.length >= 6);
  const texto = PENDIENTE_DE_NEGOCIO.join(" ").toLowerCase();
  for (const tema of ["cupones", "tarjeta de regalo", "condiciones generales", "facturación"]) {
    assert.ok(texto.includes(tema), `falta declarar: ${tema}`);
  }
});

test("BE · con Crédito CMF, el pago espera a que haya un plan elegido", () => {
  const base = {
    hayMedioElegido: true,
    condicionesAceptadas: true,
    facturacionCompleta: true,
  };
  assert.equal(puedeConfirmar({ ...base, cmf: { planElegido: true } }), true);
  assert.equal(puedeConfirmar({ ...base, cmf: { planElegido: false } }), false);
  assert.deepEqual(faltaParaConfirmar({ ...base, cmf: { planElegido: false } }), ["cmf"]);
});
