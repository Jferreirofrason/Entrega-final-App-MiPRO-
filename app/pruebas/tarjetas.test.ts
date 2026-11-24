import test from "node:test";
import assert from "node:assert/strict";
import {
  aplicarPredeterminada,
  editarTitular,
  guardarUnaPorMarca,
  quitarTarjeta,
  validarTitular,
  detectarMarca,
  formatearNumero,
  formatearVencimiento,
  hayErrores,
  leerVencimiento,
  pasaLuhn,
  soloDigitos,
  tarjetaDesdeFormulario,
  tarjetaParaPreseleccionar,
  ultimosCuatro,
  validarTarjetaNueva,
  vencimientoVigente,
} from "../src/app/logic/tarjetas.ts";
import type { MedioPagoTarjeta } from "../src/app/logic/pago.ts";

// Números de prueba públicos de las pasarelas. No son tarjetas reales.
const VISA = "4242424242424242";
const MASTERCARD = "5555555555554444";
const MASTERCARD_2 = "2223003122003222";
const HOY = new Date("2026-10-12T12:00:00");

test("TJ · lee solo los dígitos de lo que se escribe", () => {
  assert.equal(soloDigitos("4242 4242-4242 4242"), VISA);
  assert.equal(soloDigitos("abc"), "");
});

test("TJ · detecta la marca por el prefijo", () => {
  assert.equal(detectarMarca(VISA), "Visa");
  assert.equal(detectarMarca(MASTERCARD), "Mastercard");
  assert.equal(detectarMarca(MASTERCARD_2), "Mastercard");
  assert.equal(detectarMarca("6011111111111117"), null, "Discover no está soportada");
  assert.equal(detectarMarca(""), null);
});

test("TJ · Luhn atrapa un número mal tipeado", () => {
  assert.equal(pasaLuhn(VISA), true);
  assert.equal(pasaLuhn("4242424242424241"), false);
  assert.equal(pasaLuhn("424242"), false, "demasiado corto");
});

test("TJ · del número solo sobreviven los cuatro últimos", () => {
  assert.equal(ultimosCuatro(VISA), "4242");
  assert.equal(ultimosCuatro("5555 5555 5555 4444"), "4444");
});

test("TJ · el número se lee en grupos de cuatro mientras se escribe", () => {
  assert.equal(formatearNumero("4242424242424242"), "4242 4242 4242 4242");
  assert.equal(formatearNumero("42424"), "4242 4");
});

test("TJ · el vencimiento se escribe con o sin barra", () => {
  assert.equal(formatearVencimiento("0828"), "08/28");
  assert.equal(formatearVencimiento("08/28"), "08/28");
  assert.equal(formatearVencimiento("0"), "0");
  assert.deepEqual(leerVencimiento("08/28"), { mes: 8, anio: 2028 });
  assert.equal(leerVencimiento("13/28"), null, "no hay mes 13");
  assert.equal(leerVencimiento("8/28"), null, "faltan dígitos");
});

test("TJ · una tarjeta vence al terminar su mes", () => {
  assert.equal(vencimientoVigente("10/26", HOY), true, "vence este mes: sirve");
  assert.equal(vencimientoVigente("09/26", HOY), false, "venció el mes pasado");
  assert.equal(vencimientoVigente("08/28", HOY), true);
  assert.equal(vencimientoVigente("10/26", new Date("2026-10-31T23:00:00")), true);
  assert.equal(vencimientoVigente("10/26", new Date("2026-11-01T00:30:00")), false);
});

test("TJ · el alta válida no devuelve ningún error", () => {
  const errores = validarTarjetaNueva(
    { titular: "María López", numero: "4242 4242 4242 4242", vence: "08/28", codigo: "123" },
    HOY,
  );
  assert.equal(hayErrores(errores), false);
});

test("TJ · cada dato mal cargado devuelve su propio mensaje", () => {
  const e = validarTarjetaNueva({ titular: "", numero: "", vence: "", codigo: "" }, HOY);
  assert.ok(e.titular && e.numero && e.vence && e.codigo, "los cuatro campos avisan");

  assert.match(
    validarTarjetaNueva({ titular: "M", numero: VISA, vence: "08/28", codigo: "123" }, HOY)
      .titular ?? "",
    /corto/,
  );
  assert.match(
    validarTarjetaNueva({ titular: "María", numero: "6011111111111117", vence: "08/28", codigo: "123" }, HOY)
      .numero ?? "",
    /Visa y Mastercard/,
  );
  assert.match(
    validarTarjetaNueva({ titular: "María", numero: "4242424242424241", vence: "08/28", codigo: "123" }, HOY)
      .numero ?? "",
    /no es válido/,
  );
  assert.match(
    validarTarjetaNueva({ titular: "María", numero: VISA, vence: "09/26", codigo: "123" }, HOY)
      .vence ?? "",
    /vencida/,
  );
  assert.match(
    validarTarjetaNueva({ titular: "María", numero: VISA, vence: "8/2", codigo: "123" }, HOY)
      .vence ?? "",
    /MM\/AA/,
  );
  assert.match(
    validarTarjetaNueva({ titular: "María", numero: VISA, vence: "08/28", codigo: "12" }, HOY)
      .codigo ?? "",
    /3 dígitos/,
  );
});

test("TJ · de la tarjeta guardada no se puede reconstruir el número", () => {
  const t = tarjetaDesdeFormulario(
    { titular: "  María López ", numero: "5555 5555 5555 4444", vence: "0329", codigo: "123" },
    "tarjeta-nueva-1",
  );
  assert.equal(t.marca, "Mastercard");
  assert.equal(t.ultimos, "4444");
  assert.equal(t.vence, "03/29");
  assert.equal(t.titular, "María López", "el titular se guarda sin espacios de más");
  assert.equal(t.banco, undefined, "el emisor no se adivina");
  assert.equal(t.predeterminada, undefined, "el alta no decide la preferencia");
  const serializada = JSON.stringify(t);
  assert.equal(serializada.includes("5555555555554444"), false);
  assert.equal(serializada.includes("5555 5555"), false);
  assert.equal(serializada.includes("123"), false, "el código de seguridad no se guarda");
});

const TARJETAS: MedioPagoTarjeta[] = [
  { id: "a", tipo: "tarjeta", marca: "Visa", ultimos: "4242", vence: "08/28", banco: "General", predeterminada: true },
  { id: "b", tipo: "tarjeta", marca: "Mastercard", ultimos: "5312", vence: "03/29", banco: "Banistmo" },
  { id: "c", tipo: "tarjeta", marca: "Visa", ultimos: "1111", vence: "01/26", banco: "Vencida" },
];

test("TJ · solo puede haber una tarjeta predeterminada", () => {
  const despues = aplicarPredeterminada(TARJETAS, "b");
  assert.deepEqual(
    despues.map((t) => [t.id, t.predeterminada]),
    [["a", false], ["b", true], ["c", false]],
  );
  assert.equal(despues.filter((t) => t.predeterminada).length, 1);
});

test("TJ · el pago arranca en la predeterminada, si está vigente", () => {
  assert.equal(tarjetaParaPreseleccionar(TARJETAS, HOY)?.id, "a");
  // Predeterminada vencida: no se preselecciona nada y la persona elige.
  const conVencida = aplicarPredeterminada(TARJETAS, "c");
  assert.equal(tarjetaParaPreseleccionar(conVencida, HOY), null);
  assert.equal(tarjetaParaPreseleccionar([], HOY), null);
});

test("TJ · la lista tiene una sola tarjeta por marca", () => {
  const otraVisa: MedioPagoTarjeta = {
    id: "nueva",
    tipo: "tarjeta",
    marca: "Visa",
    ultimos: "9999",
    vence: "11/30",
    banco: "María López",
  };
  const lista = guardarUnaPorMarca(TARJETAS.slice(0, 2), otraVisa);
  assert.equal(lista.length, 2, "reemplaza, no agrega");
  assert.deepEqual(lista.map((t) => t.marca), ["Visa", "Mastercard"], "conserva el orden");
  assert.equal(lista[0].ultimos, "9999");
  assert.equal(lista[0].predeterminada, true, "hereda la preferencia de la que reemplazó");

  // Una marca que no estaba sí se agrega.
  const soloVisa = [TARJETAS[0]];
  const conMastercard = guardarUnaPorMarca(soloVisa, {
    id: "mc",
    tipo: "tarjeta",
    marca: "Mastercard",
    ultimos: "4444",
    vence: "03/29",
    banco: "María López",
  });
  assert.equal(conMastercard.length, 2);
  assert.equal(conMastercard[1].predeterminada, undefined);
});

test("TJ · eliminar una tarjeta no reasigna la preferencia", () => {
  const sinLaPredeterminada = quitarTarjeta(TARJETAS, "a");
  assert.deepEqual(sinLaPredeterminada.map((t) => t.id), ["b", "c"]);
  assert.equal(
    sinLaPredeterminada.some((t) => t.predeterminada),
    false,
    "nadie queda predeterminada por descarte",
  );

  // Eliminar otra no toca a la predeterminada.
  const sinOtra = quitarTarjeta(TARJETAS, "b");
  assert.equal(sinOtra.find((t) => t.predeterminada)?.id, "a");
  assert.deepEqual(quitarTarjeta(TARJETAS, "no-existe").length, 3);
});

test("TJ · editar una tarjeta solo cambia el titular", () => {
  const antes = TARJETAS[1];
  const despues = editarTitular(TARJETAS, "b", "  Juan Pérez  ")[1];
  assert.equal(despues.titular, "Juan Pérez");
  assert.equal(despues.ultimos, antes.ultimos);
  assert.equal(despues.vence, antes.vence);
  assert.equal(despues.marca, antes.marca);
  assert.equal(despues.predeterminada, antes.predeterminada);
});

test("TJ · el titular es obligatorio al editar", () => {
  assert.match(validarTitular("") ?? "", /Escribe el nombre/);
  assert.match(validarTitular("  M ") ?? "", /corto/);
  assert.equal(validarTitular("María López"), null);
});
