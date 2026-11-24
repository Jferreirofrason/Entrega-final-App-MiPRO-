// La solicitud de pago por Yappy.
//
// Módulo puro (node --test). Sin DOM, sin storage y sin red.
//
// ⚠️ NO HAY INTEGRACIÓN con Yappy. Acá solo está la máquina de estados de
// una solicitud y la cuenta del tiempo; quién aprueba, quién rechaza y
// cuánto dura la ventana lo informa la integración cuando exista.
//
// La regla que manda: un pago SOLO está aprobado cuando llega su
// aprobación. Ni porque terminó una animación, ni porque la persona volvió
// de la app del banco, ni porque pasó un rato.
//   ENDPOINT: POST /api/checkout/yappy/solicitudes
//   ENDPOINT: GET  /api/checkout/yappy/solicitudes/{id}

export type EstadoYappy =
  /** Todavía no se pidió nada. */
  | "inactiva"
  /** Pedida y esperando que la persona autorice en Yappy. */
  | "esperando"
  /** Llegó la aprobación. Recién acá se puede cobrar y confirmar la cita. */
  | "aprobada"
  /** Llegó el rechazo. */
  | "rechazada"
  /** Se acabó la ventana de autorización sin respuesta. */
  | "vencida";

export interface SolicitudYappy {
  estado: EstadoYappy;
  /** Momento en que vence la ventana, en milisegundos. */
  venceEn: number;
}

/**
 * Arma la solicitud. `segundos` es la ventana de autorización, que en
 * producción viene en la respuesta de la integración.
 */
export function crearSolicitud(ahora: number, segundos: number): SolicitudYappy {
  return { estado: "esperando", venceEn: ahora + segundos * 1000 };
}

/** Cuántos segundos quedan, nunca menos de cero. */
export function segundosRestantes(venceEn: number, ahora: number): number {
  return Math.max(0, Math.ceil((venceEn - ahora) / 1000));
}

/** `2:00`, `0:09`. */
export function formatearCuenta(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function estaVencida(solicitud: SolicitudYappy, ahora: number): boolean {
  return solicitud.estado === "esperando" && segundosRestantes(solicitud.venceEn, ahora) === 0;
}

/**
 * Si se puede pedir una solicitud nueva. Con una esperando NO: pedir dos
 * veces generaría dos cobros.
 */
export function puedeIniciar(estado: EstadoYappy): boolean {
  return estado !== "esperando";
}

/** Si el pago se puede dar por hecho. Solo con la aprobación. */
export function estaAprobada(estado: EstadoYappy): boolean {
  return estado === "aprobada";
}

/** Si hay algo pendiente que se pueda volver a consultar. */
export function hayPendiente(estado: EstadoYappy): boolean {
  return estado === "esperando";
}

/**
 * Lo que falta para que esto sea un pago de verdad.
 */
export const PENDIENTE_DE_YAPPY = [
  "Contrato e integración con Yappy, con sus credenciales",
  "La ventana de autorización real: cuántos minutos informa la integración",
  "El aviso de aprobación o rechazo, por webhook o por consulta",
  "Qué pasa si la persona autoriza justo cuando vence la ventana",
] as const;
