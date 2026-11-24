// Medios de pago de demostración.
//
// ⚠️ DATOS SIMULADOS. Ninguna de estas tarjetas existe: son cuatro dígitos
// y un vencimiento inventados para que la pantalla tenga algo que mostrar.
//
// De una tarjeta que la persona agrega se guardan SOLO marca, cuatro
// últimos dígitos, vencimiento y titular (ver `tarjetaDesdeFormulario` en
// logic/tarjetas.ts). El banco emisor y si es crédito o débito los informa
// la pasarela por el BIN del número: NO se adivinan ni se completan con
// otro dato. El número completo no se guarda, el código de
// seguridad no se guarda, y nada de esto se tokeniza porque no hay
// pasarela. Vive en sessionStorage: se borra al cerrar la pestaña.
//
// Cuando haya backend, este módulo se reemplaza por sus endpoints:
//   ENDPOINT: GET   /api/clientes/{id}/medios-pago
//   ENDPOINT: POST  /api/clientes/{id}/medios-pago
//   ENDPOINT: PATCH /api/clientes/{id}/medios-pago/{medioId}/predeterminada

import type { MedioPago, MedioPagoTarjeta } from "../logic/pago";
import {
  aplicarPredeterminada,
  editarTitular,
  guardarUnaPorMarca,
  quitarTarjeta,
  tarjetaDesdeFormulario,
  type DatosTarjetaNueva,
} from "../logic/tarjetas";

const CLAVE = "mipro-tarjetas-guardadas";

/** Tarjetas con las que arranca la sesión de demostración (María). */
export const TARJETAS_SEMILLA: MedioPagoTarjeta[] = [
  {
    id: "tarjeta-visa-4242",
    tipo: "tarjeta",
    marca: "Visa",
    ultimos: "4242",
    vence: "08/28",
    banco: "Banco General",
    titular: "María López",
    producto: "credito",
    predeterminada: true,
  },
  {
    id: "tarjeta-mc-5312",
    tipo: "tarjeta",
    marca: "Mastercard",
    ultimos: "5312",
    vence: "03/29",
    banco: "Banistmo",
    titular: "María López",
    producto: "debito",
  },
];

function guardar(tarjetas: MedioPagoTarjeta[]): MedioPagoTarjeta[] {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(tarjetas));
  } catch {
    // Sin storage la pantalla funciona igual, solo no sobrevive recargas.
  }
  return tarjetas;
}

/** Las tarjetas de la sesión. La primera vez, la semilla. */
export function tarjetasGuardadas(): MedioPagoTarjeta[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (crudo) return JSON.parse(crudo) as MedioPagoTarjeta[];
  } catch {
    // Ídem.
  }
  return TARJETAS_SEMILLA;
}

/**
 * Agrega una tarjeta y la devuelve. `predeterminada` cambia la preferencia
 * en el mismo movimiento, porque el alta tiene su casilla para eso.
 *
 * La pantalla muestra UNA opción por marca: si ya había una Visa y se
 * carga otra Visa, la nueva ocupa su lugar (ver `guardarUnaPorMarca`).
 */
export function agregarTarjeta(
  datos: DatosTarjetaNueva,
  opciones: { predeterminada: boolean },
): MedioPagoTarjeta {
  const nueva = tarjetaDesdeFormulario(datos, `tarjeta-${Date.now()}`);
  const lista = guardarUnaPorMarca(tarjetasGuardadas(), nueva);
  const guardada = lista.find((t) => t.id === nueva.id) ?? nueva;
  guardar(
    opciones.predeterminada || guardada.predeterminada
      ? aplicarPredeterminada(lista, nueva.id)
      : lista,
  );
  return guardada;
}

/** Cambia la preferencia para los próximos pagos. Solo puede haber una. */
export function marcarPredeterminada(id: string): MedioPagoTarjeta[] {
  return guardar(aplicarPredeterminada(tarjetasGuardadas(), id));
}

/**
 * Elimina una tarjeta.
 *   ENDPOINT: DELETE /api/clientes/{id}/medios-pago/{medioId}
 *
 * Si era la predeterminada, no se reasigna sola: la pantalla deja la acción
 * a mano en las que quedan.
 */
export function eliminarTarjeta(id: string): MedioPagoTarjeta[] {
  return guardar(quitarTarjeta(tarjetasGuardadas(), id));
}

/**
 * Edita el nombre del titular. Es lo único editable sin pasarela.
 *   ENDPOINT: PATCH /api/clientes/{id}/medios-pago/{medioId}
 */
export function editarTarjeta(id: string, titular: string): MedioPagoTarjeta[] {
  return guardar(editarTitular(tarjetasGuardadas(), id, titular));
}

/**
 * Billeteras y financiamiento. `disponible` es el dato que decide si la
 * opción se puede elegir: en false la pantalla la muestra como no
 * disponible en lugar de simular que funciona.
 */
export const OTROS_MEDIOS: MedioPago[] = [
  { id: "yappy", tipo: "yappy", disponible: true },
  {
    id: "credito-cmf",
    tipo: "credito-cmf",
    disponible: true,
    nota: "Sujeto a validación de línea de crédito",
  },
  // ⚠️ Genérica a propósito: no lleva el nombre de ninguna marca. El código
  // se valida contra la lista de demostración (data/beneficios.ts) y el
  // pago combinado con otro medio está PENDIENTE de definición.
  { id: "tarjeta-regalo", tipo: "tarjeta-regalo", disponible: true },
];

/** Todos los medios, en el orden en que se muestran. */
export function mediosDePago(): MedioPago[] {
  return [...tarjetasGuardadas(), ...OTROS_MEDIOS];
}
