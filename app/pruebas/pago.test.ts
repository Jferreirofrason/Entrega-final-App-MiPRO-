import { test } from "node:test";
import assert from "node:assert/strict";
import type { MedioPago } from "../src/app/logic/pago.ts";
import {
  DEMORA_PROCESANDO_MS,
  PENDIENTE_PARA_COBRAR,
  RESULTADOS_PAGO,
  confirmarPago,
  enmascararTarjeta,
  esTarjeta,
  etiquetaMedio,
  generarAutorizacion,
  hayImporteFinal,
  medioSeleccionable,
  montoAPagar,
  textoProcesando,
} from "../src/app/logic/pago.ts";

const visa: MedioPago = {
  id: "t-visa",
  tipo: "tarjeta",
  marca: "Visa",
  ultimos: "4242",
  vence: "08/28",
  banco: "Banco General",
  predeterminada: true,
};

const yappy: MedioPago = { id: "yappy", tipo: "yappy", disponible: true };
const cmf: MedioPago = { id: "cmf", tipo: "credito-cmf", disponible: true };

const borrador = { cantidad: 1 } as const;

// ── Cuándo se cobra ──

test("se cobra cuando el servicio tiene precio y la cantidad es válida", () => {
  assert.equal(hayImporteFinal({ precioDesde: 120 }, borrador), true);
  assert.equal(montoAPagar({ precioDesde: 120 }, borrador), 120);
});

test("el monto acompaña a la cantidad y suma el adicional con precio", () => {
  assert.equal(montoAPagar({ precioDesde: 120 }, { cantidad: 3 }), 360);
  assert.equal(
    montoAPagar(
      { precioDesde: 120 },
      { cantidad: 2, incluyeDesinstalacion: true, precioDesinstalacion: 35 },
    ),
    275,
  );
});

test("un adicional que el cliente no sumó no se cobra", () => {
  assert.equal(
    montoAPagar(
      { precioDesde: 100 },
      { cantidad: 1, incluyeDesinstalacion: false, precioDesinstalacion: 35 },
    ),
    100,
  );
});

test("sin precio base no hay cobro: el servicio se cotiza", () => {
  assert.equal(hayImporteFinal({}, borrador), false);
  assert.equal(montoAPagar({}, borrador), null);
});

test("un servicio cotizable no se cobra, aunque tenga precio base", () => {
  assert.equal(
    hayImporteFinal({ precioDesde: 200, precioCotizable: true }, borrador),
    false,
  );
});

test("un servicio con visita de evaluación obligatoria no se cobra", () => {
  assert.equal(
    hayImporteFinal({ precioDesde: 200, inspeccionObligatoria: true }, borrador),
    false,
  );
});

test("si las preguntas del lugar piden inspección, todavía no hay importe final", () => {
  assert.equal(
    hayImporteFinal({ precioDesde: 200 }, { cantidad: 1, condiciones: "inspeccion" }),
    false,
  );
  assert.equal(
    hayImporteFinal({ precioDesde: 200 }, { cantidad: 1, condiciones: "estandar" }),
    true,
  );
});

test("una cantidad inválida no habilita el cobro", () => {
  assert.equal(hayImporteFinal({ precioDesde: 120 }, { cantidad: 0 }), false);
  assert.equal(hayImporteFinal({ precioDesde: 120 }, { cantidad: 99 }), false);
});

// ── Cómo se nombra cada medio ──

test("la tarjeta nunca muestra el número completo", () => {
  assert.equal(enmascararTarjeta("4242"), "•••• 4242");
  const etiqueta = etiquetaMedio(visa);
  assert.equal(etiqueta, "Visa •••• 4242");
  assert.ok(!/\d{5,}/.test(etiqueta), "no puede haber una cadena larga de dígitos");
});

test("las billeteras se nombran por su marca", () => {
  assert.equal(etiquetaMedio(yappy), "Yappy");
  assert.equal(etiquetaMedio(cmf), "Crédito CMF");
});

test("esTarjeta distingue los dos tipos de medio", () => {
  assert.equal(esTarjeta(visa), true);
  assert.equal(esTarjeta(yappy), false);
});

test("una billetera no disponible no se puede elegir", () => {
  assert.equal(medioSeleccionable(yappy), true);
  assert.equal(
    medioSeleccionable({ id: "yappy", tipo: "yappy", disponible: false }),
    false,
  );
  assert.equal(medioSeleccionable(visa), true);
});

// ── Mientras procesa ──

test("el texto de procesando dice qué está pasando con cada medio", () => {
  assert.equal(textoProcesando("tarjeta"), "Procesando pago…");
  assert.equal(textoProcesando("yappy"), "Confirmando pago con Yappy…");
  assert.equal(textoProcesando("credito-cmf"), "Validando línea de crédito CMF…");
});

test("la demora simulada es breve y está en un solo lugar", () => {
  assert.ok(DEMORA_PROCESANDO_MS > 0 && DEMORA_PROCESANDO_MS <= 3000);
});

// ── El comprobante simulado ──

test("la autorización tiene el formato AUT- y seis caracteres", () => {
  const codigo = generarAutorizacion(1760000000000);
  assert.match(codigo, /^AUT-[0-9A-Z]{6}$/);
});

test("la autorización es estable para la misma semilla", () => {
  assert.equal(generarAutorizacion(42), generarAutorizacion(42));
  assert.notEqual(generarAutorizacion(42), generarAutorizacion(43));
});

test("el comprobante guarda medio, monto y autorización, y aprueba", () => {
  const pago = confirmarPago(visa, 175, 1760000000000);
  assert.equal(pago.tipo, "tarjeta");
  assert.equal(pago.medio, "Visa •••• 4242");
  assert.equal(pago.monto, 175);
  assert.match(pago.autorizacion, /^AUT-/);
  assert.equal(pago.resultado, "aprobado");
  assert.ok(pago.confirmadoEl.includes("T"), "la fecha va en ISO");
});

test("el comprobante de una billetera no inventa datos de tarjeta", () => {
  const pago = confirmarPago(yappy, 60, 1760000000001);
  assert.equal(pago.medio, "Yappy");
  assert.ok(!pago.medio.includes("••••"));
});

test("están declarados los resultados que el pago real va a tener que manejar", () => {
  for (const esperado of [
    "aprobado",
    "rechazado",
    "validacion-pendiente",
    "error-conexion",
    "credito-no-aprobado",
  ]) {
    assert.ok(
      (RESULTADOS_PAGO as readonly string[]).includes(esperado),
      `falta el resultado ${esperado}`,
    );
  }
});

test("queda anotado en el código lo que falta para cobrar de verdad", () => {
  const texto = PENDIENTE_PARA_COBRAR.join(" ").toLowerCase();
  for (const tema of ["pasarela", "tokeniz", "backend", "yappy", "cmf", "comprobante"]) {
    assert.ok(texto.includes(tema), `falta mencionar ${tema}`);
  }
});
