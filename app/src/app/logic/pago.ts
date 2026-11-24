// Dominio del pago de la reserva de un servicio.
//
// Módulo puro (node --test). Decide CUÁNDO se cobra, qué medios hay, cómo se
// nombra cada uno y qué dice la pantalla mientras procesa.
//
// ⚠️ TODO ESTO ES SIMULADO. No hay pasarela, no hay tokenización, no hay
// backend y no se guarda ningún dato de tarjeta. La función `confirmarPago`
// no cobra: arma el comprobante de demostración que la app muestra. Lo que
// falta para cobrar de verdad está anotado en `PENDIENTE_PARA_COBRAR`.
//
// Decisiones de producto:
// - Se cobra SOLO cuando hay un importe final. Si el servicio se cotiza o
//   quedó con visita de evaluación, el flujo sigue siendo el de antes:
//   se envía la solicitud y un agente coordina el pago.
// - El número de tarjeta nunca se muestra entero, ni siquiera simulado.
// - No se afirma que se envió un comprobante por correo: está pendiente de
//   validación con Gregorio, y necesita una HU propia para ese email.
// - El alta de una tarjeta nueva no existe todavía: la fila es un acceso
//   declarado, no un flujo. Está anotado en `PENDIENTE_PARA_COBRAR`.

import type { BorradorServicio } from "./solicitudServicio.ts";
import { totalConAdicionales } from "./solicitudServicio.ts";

export type TipoMedioPago = "tarjeta" | "yappy" | "credito-cmf" | "tarjeta-regalo";

/** Marcas de tarjeta que el prototipo nombra. Sin logos: no hay assets. */
export type MarcaTarjeta = "Visa" | "Mastercard";

export interface MedioPagoTarjeta {
  id: string;
  tipo: "tarjeta";
  marca: MarcaTarjeta;
  /** Solo los cuatro últimos dígitos. Nunca el número completo. */
  ultimos: string;
  /** Vencimiento en MM/AA, como se imprime en la tarjeta. */
  vence: string;
  /**
   * Banco emisor. Opcional: de una tarjeta que la persona agrega NO lo
   * sabemos, porque el emisor lo resuelve la pasarela por el BIN del
   * número. No se adivina.
   */
  banco?: string;
  /** Nombre del titular, como figura en la tarjeta. */
  titular?: string;
  /**
   * Crédito o débito. Es un dato PROPIO de la tarjeta: NO se deduce de la
   * marca, porque Visa y Mastercard emiten las dos. Sin este dato, la
   * tarjeta no dice de qué tipo es.
   */
  producto?: "credito" | "debito";
  predeterminada?: boolean;
}

export interface MedioPagoBilletera {
  id: string;
  tipo: "yappy" | "credito-cmf" | "tarjeta-regalo";
  /** false = se muestra como no disponible, sin simular que funciona. */
  disponible: boolean;
  /** Aclaración de simulación, cuando el medio la necesita. */
  nota?: string;
}

export type MedioPago = MedioPagoTarjeta | MedioPagoBilletera;

export function esTarjeta(m: MedioPago): m is MedioPagoTarjeta {
  return m.tipo === "tarjeta";
}

// ── Cuándo se cobra ──

/**
 * El cobro se muestra solo si la reserva tiene un importe final pagable.
 *
 * Queda afuera, y sigue el flujo anterior, cuando:
 * - el servicio no tiene precio base (se cotiza);
 * - el precio depende de cotización (`precioCotizable`);
 * - el servicio siempre necesita visita de evaluación
 *   (`inspeccionObligatoria`);
 * - las preguntas del lugar concluyeron que hace falta inspección
 *   (`condiciones === "inspeccion"`), porque el valor final todavía no está.
 */
export function hayImporteFinal(
  servicio: {
    precioDesde?: number;
    precioCotizable?: boolean;
    inspeccionObligatoria?: boolean;
  },
  borrador: Pick<
    BorradorServicio,
    "cantidad" | "condiciones" | "incluyeDesinstalacion" | "precioDesinstalacion"
  >,
): boolean {
  if (servicio.precioCotizable) return false;
  if (servicio.inspeccionObligatoria) return false;
  if (borrador.condiciones === "inspeccion") return false;
  return montoAPagar(servicio, borrador) !== null;
}

/** El monto que se cobra: el mismo total que ya mostraba el resumen. */
export function montoAPagar(
  servicio: { precioDesde?: number },
  borrador: Pick<
    BorradorServicio,
    "cantidad" | "incluyeDesinstalacion" | "precioDesinstalacion"
  >,
): number | null {
  return totalConAdicionales(
    servicio.precioDesde,
    borrador.cantidad,
    borrador.incluyeDesinstalacion ? borrador.precioDesinstalacion : undefined,
  );
}

// ── Cómo se nombra cada medio ──

/** `•••• 4242`. El número entero no existe en el prototipo. */
export function enmascararTarjeta(ultimos: string): string {
  return `•••• ${ultimos}`;
}

/** La etiqueta que queda en el comprobante y en el detalle de la reserva. */
export function etiquetaMedio(medio: MedioPago): string {
  if (esTarjeta(medio)) {
    return `${medio.marca} ${enmascararTarjeta(medio.ultimos)}`;
  }
  if (medio.tipo === "yappy") return "Yappy";
  if (medio.tipo === "tarjeta-regalo") return "Tarjeta de regalo";
  return "Crédito CMF";
}

/** Un medio se puede elegir si es tarjeta, o si la billetera está disponible. */
export function medioSeleccionable(medio: MedioPago): boolean {
  return esTarjeta(medio) ? true : medio.disponible;
}

// ── Mientras procesa ──

/** El texto del modal cambia según el medio: no todos hacen lo mismo. */
export function textoProcesando(tipo: TipoMedioPago): string {
  if (tipo === "yappy") return "Confirmando pago con Yappy…";
  if (tipo === "credito-cmf") return "Validando línea de crédito CMF…";
  return "Procesando pago…";
}

/** Espera simulada del procesamiento, en milisegundos. */
export const DEMORA_PROCESANDO_MS = 1800;

/**
 * Resultados que el flujo va a tener que manejar cuando el pago sea real.
 * Hoy solo se produce `aprobado`: los demás están declarados para que la
 * pantalla y el comprobante ya tengan dónde colgarlos, NO implementados.
 */
export const RESULTADOS_PAGO = [
  "aprobado",
  "rechazado",
  "validacion-pendiente",
  "error-conexion",
  "credito-no-aprobado",
] as const;

export type ResultadoPago = (typeof RESULTADOS_PAGO)[number];

// ── El comprobante simulado ──

export interface PagoConfirmado {
  tipo: TipoMedioPago;
  /** Etiqueta visible del medio: "Visa •••• 4242", "Yappy", "Crédito CMF". */
  medio: string;
  /**
   * Lo que haga falta para entender con qué se pagó, cuando el medio solo
   * no alcanza: la tarjeta CMF y las cuotas elegidas, por ejemplo.
   */
  detalleMedio?: string;
  monto: number;
  /** Número de autorización simulado, formato AUT-XXXXXX. */
  autorizacion: string;
  confirmadoEl: string;
  resultado: ResultadoPago;
}

const ALFABETO_AUTORIZACION = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Número de autorización de demostración. `semilla` se inyecta para poder
 * probarlo; en la app es `Date.now()`.
 */
export function generarAutorizacion(semilla: number): string {
  let n = Math.abs(Math.trunc(semilla)) || 1;
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO_AUTORIZACION[n % ALFABETO_AUTORIZACION.length];
    n = Math.floor(n / ALFABETO_AUTORIZACION.length) + 7 * (i + 1);
  }
  return `AUT-${codigo}`;
}

/**
 * Arma el comprobante simulado. **No cobra nada.** El resultado es siempre
 * `aprobado`: el prototipo no simula rechazos todavía.
 */
export function confirmarPago(
  medio: MedioPago,
  monto: number,
  semilla: number,
  detalleMedio?: string,
): PagoConfirmado {
  return {
    tipo: medio.tipo,
    medio: etiquetaMedio(medio),
    detalleMedio,
    monto,
    autorizacion: generarAutorizacion(semilla),
    confirmadoEl: new Date(semilla).toISOString(),
    resultado: "aprobado",
  };
}

/**
 * Lo que falta para cobrar de verdad. Está en el código, y no solo en la
 * documentación, para que nadie confunda el prototipo con un cobro real.
 */
export const PENDIENTE_PARA_COBRAR = [
  "Pasarela de pago contratada y credenciales de producción",
  "Tokenización de tarjetas, para no tocar datos sensibles en el cliente",
  "Backend que cree la reserva y el cobro en una sola transacción",
  "Integración y contrato con Yappy",
  "Validación real de la línea de crédito con CMF",
  "Tratamiento de rechazos, validaciones pendientes y errores de red",
  "Comprobante fiscal y envío del voucher por correo: pendiente de validación con Gregorio, con HU propia para ese email",
  "Revisión de seguridad y de cumplimiento (PCI)",
  "Alta de una tarjeta nueva: pantalla, validación y tokenización",
  "Estados de rechazo, validación pendiente y error de red: pendientes de definición",
] as const;
