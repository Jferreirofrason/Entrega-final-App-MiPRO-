// Eliminar la cuenta: cuándo se puede pedir y cómo se confirma.
//
// Módulo puro (node --test). Sin DOM, sin storage y sin red.
//
// ⚠️ EN EL PROTOTIPO LA ELIMINACIÓN ES SIMULADA. No se borra nada: se cierra
// la sesión y se vuelve al ingreso. La pantalla lo dice y no afirma que los
// datos se hayan eliminado.
//
// La eliminación real de una cuenta necesita definiciones que todavía no
// están (ver PENDIENTE_DE_LA_BAJA).
//   ENDPOINT: POST /api/perfil/baja

/** Lo que tiene abierto la cuenta y frena la baja. */
export interface PendientesDeLaCuenta {
  servicios: number;
  garantias: number;
  reclamos: number;
  pagosEnCurso: number;
}

/** Cuántas cosas abiertas hay en total. */
export function cuantosPendientes(p: PendientesDeLaCuenta): number {
  return p.servicios + p.garantias + p.reclamos + p.pagosEnCurso;
}

/**
 * Si la cuenta se puede dar de baja desde la app.
 *
 * Con algo abierto NO: una solicitud, una garantía o un pago en curso
 * necesitan a alguien del otro lado, así que la salida es soporte y no un
 * botón. Decidirlo acá y no en la pantalla permite probarlo.
 */
export function sePuedeEliminar(p: PendientesDeLaCuenta): boolean {
  return cuantosPendientes(p) === 0;
}

/** La palabra que hay que escribir para habilitar la baja. */
export const PALABRA_DE_CONFIRMACION = "ELIMINAR";

/**
 * Si lo escrito habilita la baja.
 *
 * Exacto: se ignoran los espacios de los costados, pero no se acepta otra
 * palabra ni otras mayúsculas. Es la última barrera antes de una acción que
 * no se puede deshacer.
 */
export function confirmacionValida(texto: string): boolean {
  return texto.trim() === PALABRA_DE_CONFIRMACION;
}

/**
 * Lo que falta definir para que esto deje de ser una simulación.
 *
 * Está en el código, no solo en la documentación: la eliminación real de
 * cuenta requiere definir política de retención, manejo de facturas y
 * pagos, casos de garantía activos, solicitudes abiertas, autenticación
 * reforzada y proceso de soporte.
 */
export const PENDIENTE_DE_LA_BAJA = [
  "Política de retención: qué se borra, qué se anonimiza y qué se conserva por ley",
  "Facturas y pagos ya emitidos: cuánto tiempo se guardan y quién los consulta",
  "Garantías activas: si sobreviven a la baja y a nombre de quién quedan",
  "Solicitudes y reclamos abiertos: si se cancelan o se terminan antes de dar de baja",
  "Autenticación reforzada antes de confirmar la baja (contraseña o código)",
  "Proceso de soporte: quién atiende la baja cuando la cuenta tiene cosas abiertas",
  "Si la baja es inmediata o tiene un plazo de arrepentimiento",
] as const;
