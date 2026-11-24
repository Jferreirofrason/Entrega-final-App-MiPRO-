// Borrador del flujo de agendamiento, persistido en sessionStorage.
//
// El borrador vive por SERVICIO: volver atrás, editar desde el resumen o
// recargar la pantalla no pierde lo ingresado. Se limpia al confirmar la
// solicitud o al abandonar el flujo explícitamente.

import {
  BorradorServicio,
  borradorInicial,
} from "../logic/solicitudServicio";

const CLAVE = "mipro-borrador-servicio";

export function leerBorradorServicio(servicioId: string): BorradorServicio {
  try {
    const crudo = sessionStorage.getItem(`${CLAVE}-${servicioId}`);
    if (crudo) return JSON.parse(crudo) as BorradorServicio;
  } catch {
    // Sin storage: el flujo funciona igual, solo no sobrevive recargas.
  }
  return borradorInicial(servicioId);
}

export function guardarBorradorServicio(
  borrador: BorradorServicio,
): void {
  try {
    sessionStorage.setItem(
      `${CLAVE}-${borrador.servicioId}`,
      JSON.stringify(borrador),
    );
  } catch {
    // Ídem: sin storage no bloqueamos el flujo.
  }
}

export function limpiarBorradorServicio(servicioId: string): void {
  try {
    sessionStorage.removeItem(`${CLAVE}-${servicioId}`);
  } catch {
    // Nada que limpiar.
  }
}
