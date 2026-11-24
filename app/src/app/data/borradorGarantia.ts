// Borrador del flujo de garantía, persistido en sessionStorage.
//
// Un error nunca borra lo ingresado: cada paso guarda al avanzar y al
// volver se recupera. Al enviar con éxito, el borrador se limpia.

import { BorradorGarantia } from "../logic/solicitudGarantia";

const CLAVE = "mipro-borrador-garantia";

export function leerBorrador(): BorradorGarantia {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as BorradorGarantia) : {};
  } catch {
    return {};
  }
}

export function guardarBorrador(cambios: Partial<BorradorGarantia>): BorradorGarantia {
  const nuevo = { ...leerBorrador(), ...cambios };
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch {
    // Sin storage, el borrador vive en memoria de la pantalla.
  }
  return nuevo;
}

export function limpiarBorrador(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // nada que limpiar
  }
}
