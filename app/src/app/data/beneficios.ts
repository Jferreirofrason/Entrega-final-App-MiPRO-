// Códigos de demostración del checkout.
//
// ⚠️ INVENTADOS PARA LA DEMO, y nada más. No son reglas comerciales: el
// descuento del cupón y el saldo de la tarjeta de regalo son dos números
// elegidos para poder mostrar los estados en pantalla. Comercial define los
// códigos reales, sus montos, vigencias y acumulación, y hasta entonces la
// pantalla avisa que el resultado es simulado.
//
// Cuando haya backend, esto se reemplaza por sus endpoints:
//   ENDPOINT: POST /api/checkout/cupones/validar
//   ENDPOINT: POST /api/checkout/tarjetas-regalo/validar

import type { CuponConocido, RegaloConocido } from "../logic/beneficios";

/** Un solo cupón, para ver el estado aplicado. */
export const CUPONES_DEMO: readonly CuponConocido[] = [
  { codigo: "MIPRO2026", descuento: 5 },
];

/**
 * Dos tarjetas: una que alcanza y otra que no, para poder ver los dos
 * estados. El saldo es de demostración.
 */
export const REGALOS_DEMO: readonly RegaloConocido[] = [
  { codigo: "REGALO100", saldo: 100 },
  { codigo: "REGALO10", saldo: 10 },
];

/** Demora simulada de la validación, en milisegundos. */
export const DEMORA_VALIDACION_MS = 900;
