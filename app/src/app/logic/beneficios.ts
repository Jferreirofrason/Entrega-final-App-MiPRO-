// Beneficios del checkout: cupón de descuento y tarjeta de regalo.
//
// Módulo puro (node --test). Sin DOM, sin storage y sin red.
//
// ⚠️ ACÁ NO HAY REGLAS COMERCIALES. No se inventan porcentajes, vigencias,
// acumulación ni saldos: este módulo solo sabe VALIDAR contra una lista de
// códigos que le pasan y hacer las cuentas. Los códigos y los montos de la
// demostración viven en data/beneficios.ts y están marcados como tales. Lo
// que falta definir está en `PENDIENTE_DE_NEGOCIO`.
//   ENDPOINT: POST /api/checkout/cupones/validar
//   ENDPOINT: POST /api/checkout/tarjetas-regalo/validar

/** Un cupón de la lista de demostración. */
export interface CuponConocido {
  codigo: string;
  /** Monto de descuento, en dólares. */
  descuento: number;
}

/** Una tarjeta de regalo de la lista de demostración. */
export interface RegaloConocido {
  codigo: string;
  /** Saldo disponible, en dólares. */
  saldo: number;
}

export type EstadoCupon = "vacio" | "validando" | "aplicado" | "invalido";

export type EstadoRegalo =
  | "vacio"
  | "validando"
  | "valida"
  | "invalida"
  | "saldo-insuficiente";

/** El código se escribe como se quiera y se compara en mayúsculas. */
export function normalizarCodigo(texto: string): string {
  return texto.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Busca el cupón. Devuelve el descuento si existe, o null si no.
 *
 * NO decide si el cupón está vigente, si se acumula con otro ni a qué
 * productos aplica: eso lo resuelve el backend cuando exista.
 */
export function buscarCupon(
  codigo: string,
  conocidos: readonly CuponConocido[],
): CuponConocido | null {
  const c = normalizarCodigo(codigo);
  if (!c) return null;
  return conocidos.find((x) => x.codigo === c) ?? null;
}

export function buscarRegalo(
  codigo: string,
  conocidos: readonly RegaloConocido[],
): RegaloConocido | null {
  const c = normalizarCodigo(codigo);
  if (!c) return null;
  return conocidos.find((x) => x.codigo === c) ?? null;
}

/**
 * El total después del descuento, nunca por debajo de cero.
 *
 * El descuento se resta del subtotal y listo: no hay impuestos que
 * recalcular porque el precio del catálogo ya los incluye (ver la clave
 * `agendar.itbms` en i18n/strings.ts).
 */
export function totalConDescuento(subtotal: number, descuento: number): number {
  return Math.max(0, Math.round((subtotal - descuento) * 100) / 100);
}

/**
 * Si la tarjeta de regalo alcanza para pagar el total.
 *
 * ⚠️ Cuando NO alcanza, el prototipo no completa con otro medio: el pago
 * combinado está PENDIENTE de definición y suponerlo sería inventar una
 * regla de negocio.
 */
export function regaloAlcanza(saldo: number, total: number): boolean {
  return saldo >= total;
}

/** Qué falta para poder confirmar el pago. Vacío = se puede. */
export function faltaParaConfirmar(estado: {
  hayMedioElegido: boolean;
  condicionesAceptadas: boolean;
  facturacionCompleta: boolean;
  /** Solo cuando el medio elegido es la tarjeta de regalo. */
  regalo?: { estado: EstadoRegalo };
  /** Solo cuando el medio elegido es Crédito CMF. */
  cmf?: { planElegido: boolean };
}): string[] {
  const falta: string[] = [];
  if (!estado.hayMedioElegido) falta.push("medio");
  if (!estado.facturacionCompleta) falta.push("facturacion");
  if (!estado.condicionesAceptadas) falta.push("condiciones");
  if (estado.regalo && estado.regalo.estado !== "valida") falta.push("regalo");
  if (estado.cmf && !estado.cmf.planElegido) falta.push("cmf");
  return falta;
}

export function puedeConfirmar(estado: Parameters<typeof faltaParaConfirmar>[0]): boolean {
  return faltaParaConfirmar(estado).length === 0;
}

/**
 * Lo que falta definir del lado de negocio para que esto deje de ser una
 * demostración. Está en el código, no solo en la documentación.
 */
export const PENDIENTE_DE_NEGOCIO = [
  "Cupones: porcentajes o montos, vigencias, acumulación y a qué servicios aplican",
  "Cupones: el endpoint de validación y quién emite los códigos",
  "Tarjeta de regalo: emisión, saldos y si pide PIN",
  "Tarjeta de regalo: si permite pago combinado con otro medio y qué pasa con el saldo restante",
  "Condiciones generales de venta: el texto aprobado y dónde se publica",
  "Dirección de facturación: si es obligatoria y si pide datos fiscales (RUC o razón social)",
] as const;
