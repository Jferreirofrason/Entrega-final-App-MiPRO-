// Dominio de las tarjetas guardadas: validación del alta y preferencia de
// tarjeta predeterminada.
//
// Módulo puro (node --test). Sin DOM, sin storage y sin red.
//
// ⚠️ SIMULADO, y acá importa más que en cualquier otro módulo: el número
// completo de una tarjeta NO se guarda ni se devuelve. Se valida en el aire
// para poder avisar si está mal escrito, y de ahí solo sobreviven la marca
// y los cuatro últimos dígitos. El código de seguridad no se guarda nunca,
// ni enmascarado. Cuando haya pasarela, esta validación la reemplaza el SDK
// de tokenización y el número no llega ni a pasar por acá.
//   ENDPOINT: POST /api/clientes/{id}/medios-pago

import type { MarcaTarjeta, MedioPagoTarjeta } from "./pago.ts";

/** Solo los dígitos de lo que la persona escribió. */
export function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

/**
 * La marca, por el prefijo del número. Visa empieza con 4; Mastercard, con
 * 51 a 55 o con 2221 a 2720. Cualquier otra cosa no tiene marca conocida:
 * el prototipo solo acepta estas dos, que son las que la app nombra.
 */
export function detectarMarca(numero: string): MarcaTarjeta | null {
  const d = soloDigitos(numero);
  if (/^4/.test(d)) return "Visa";
  if (/^5[1-5]/.test(d)) return "Mastercard";
  const cuatro = Number(d.slice(0, 4));
  if (d.length >= 4 && cuatro >= 2221 && cuatro <= 2720) return "Mastercard";
  return null;
}

/** Dígito verificador de Luhn: atrapa un número mal tipeado. */
export function pasaLuhn(numero: string): boolean {
  const d = soloDigitos(numero);
  if (d.length < 12) return false;
  let suma = 0;
  let doble = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (doble) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    suma += n;
    doble = !doble;
  }
  return suma % 10 === 0;
}

/** Los cuatro últimos dígitos, que es lo único que se guarda del número. */
export function ultimosCuatro(numero: string): string {
  return soloDigitos(numero).slice(-4);
}

/** El número en grupos de cuatro, para que se lea mientras se escribe. */
export function formatearNumero(numero: string): string {
  return soloDigitos(numero).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

/** `0825` y `08/25` entran igual; sale `08/25`. */
export function formatearVencimiento(texto: string): string {
  const d = soloDigitos(texto).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

export interface Vencimiento {
  mes: number;
  /** Año de cuatro dígitos: `28` es 2028. */
  anio: number;
}

export function leerVencimiento(texto: string): Vencimiento | null {
  const d = soloDigitos(texto);
  if (d.length !== 4) return null;
  const mes = Number(d.slice(0, 2));
  if (mes < 1 || mes > 12) return null;
  return { mes, anio: 2000 + Number(d.slice(2)) };
}

/**
 * Una tarjeta vence al terminar su mes: con 08/28 el 31 de agosto de 2028
 * todavía sirve y el 1 de septiembre ya no.
 */
export function vencimientoVigente(texto: string, hoy: Date): boolean {
  const v = leerVencimiento(texto);
  if (!v) return false;
  const ultimoDia = new Date(v.anio, v.mes, 1).getTime();
  return hoy.getTime() < ultimoDia;
}

export interface DatosTarjetaNueva {
  titular: string;
  numero: string;
  vence: string;
  codigo: string;
}

export type CampoTarjeta = keyof DatosTarjetaNueva;

export type ErroresTarjeta = Partial<Record<CampoTarjeta, string>>;

/**
 * Valida el alta. Devuelve un mensaje por campo, para mostrarlo al lado del
 * dato que lo tiene; sin errores, devuelve un objeto vacío.
 */
export function validarTarjetaNueva(
  datos: DatosTarjetaNueva,
  hoy: Date,
): ErroresTarjeta {
  const errores: ErroresTarjeta = {};

  const titular = datos.titular.trim();
  if (!titular) errores.titular = "Escribe el nombre que figura en la tarjeta.";
  else if (titular.length < 3) errores.titular = "El nombre es demasiado corto.";

  const numero = soloDigitos(datos.numero);
  if (!numero) errores.numero = "Escribe el número de la tarjeta.";
  else if (numero.length < 13 || numero.length > 19)
    errores.numero = "El número tiene que tener entre 13 y 19 dígitos.";
  else if (!detectarMarca(numero))
    errores.numero = "Solo aceptamos Visa y Mastercard.";
  else if (!pasaLuhn(numero)) errores.numero = "Revisa el número, no es válido.";

  if (!soloDigitos(datos.vence)) errores.vence = "Escribe el vencimiento.";
  else if (!leerVencimiento(datos.vence)) errores.vence = "Usa el formato MM/AA.";
  else if (!vencimientoVigente(datos.vence, hoy)) errores.vence = "La tarjeta está vencida.";

  const codigo = soloDigitos(datos.codigo);
  if (!codigo) errores.codigo = "Escribe el código de seguridad.";
  else if (codigo.length < 3 || codigo.length > 4)
    errores.codigo = "Son los 3 dígitos del dorso, o 4 si es American Express.";

  return errores;
}

export function hayErrores(errores: ErroresTarjeta): boolean {
  return Object.keys(errores).length > 0;
}

/**
 * La tarjeta que queda guardada: marca, cuatro últimos y vencimiento. El
 * número completo y el código de seguridad se descartan acá y no salen de
 * esta función.
 */
export function tarjetaDesdeFormulario(
  datos: DatosTarjetaNueva,
  id: string,
): MedioPagoTarjeta {
  return {
    id,
    tipo: "tarjeta",
    marca: detectarMarca(datos.numero) ?? "Visa",
    ultimos: ultimosCuatro(datos.numero),
    vence: formatearVencimiento(datos.vence),
    titular: datos.titular.trim(),
    // Sin banco: el emisor lo resuelve la pasarela por el BIN del número, y
    // el prototipo no lo adivina.
  };
}

/**
 * Saca una tarjeta de la lista.
 *
 * Si la que se va era la predeterminada, NADIE queda predeterminada: la
 * preferencia se elige, no se hereda por descarte. La pantalla muestra
 * entonces la acción en las que quedan.
 */
export function quitarTarjeta(
  tarjetas: MedioPagoTarjeta[],
  id: string,
): MedioPagoTarjeta[] {
  return tarjetas.filter((t) => t.id !== id);
}

/**
 * Lo único que se puede editar de una tarjeta guardada es el nombre del
 * titular.
 *
 * ⚠️ El número y el vencimiento NO: sin pasarela no hay forma de volver a
 * validarlos, y con pasarela los dos viven del lado del proveedor junto al
 * token. Cambiarlos es dar de alta la tarjeta otra vez, y eso es lo que la
 * pantalla ofrece.
 */
export function editarTitular(
  tarjetas: MedioPagoTarjeta[],
  id: string,
  titular: string,
): MedioPagoTarjeta[] {
  return tarjetas.map((t) => (t.id === id ? { ...t, titular: titular.trim() } : t));
}

/** El titular es obligatorio y es el mismo criterio que en el alta. */
export function validarTitular(titular: string): string | null {
  const limpio = titular.trim();
  if (!limpio) return "Escribe el nombre que figura en la tarjeta.";
  if (limpio.length < 3) return "El nombre es demasiado corto.";
  return null;
}

/**
 * Guarda la tarjeta nueva dejando UNA sola opción por marca: la lista de
 * medios siempre es Visa, Mastercard, Yappy, Crédito CMF y el alta.
 *
 * Si ya había una tarjeta de esa marca, la nueva ocupa su lugar, con su
 * misma posición en la lista. Y si la que estaba era la predeterminada, la
 * nueva hereda la preferencia: nadie queda sin predeterminada por haber
 * actualizado su tarjeta.
 */
export function guardarUnaPorMarca(
  tarjetas: MedioPagoTarjeta[],
  nueva: MedioPagoTarjeta,
): MedioPagoTarjeta[] {
  const i = tarjetas.findIndex((t) => t.marca === nueva.marca);
  if (i === -1) return [...tarjetas, nueva];
  const reemplazada = tarjetas[i];
  const conHerencia = {
    ...nueva,
    predeterminada: nueva.predeterminada || reemplazada.predeterminada,
  };
  return tarjetas.map((t, j) => (j === i ? conHerencia : t));
}

/** Una sola predeterminada: marcar una apaga a todas las demás. */
export function aplicarPredeterminada(
  tarjetas: MedioPagoTarjeta[],
  id: string,
): MedioPagoTarjeta[] {
  return tarjetas.map((t) => ({ ...t, predeterminada: t.id === id }));
}

/**
 * Con qué tarjeta arranca el pago: la predeterminada, si está vigente. Una
 * predeterminada vencida no se preselecciona; la persona elige.
 */
export function tarjetaParaPreseleccionar(
  tarjetas: MedioPagoTarjeta[],
  hoy: Date,
): MedioPagoTarjeta | null {
  const vigentes = tarjetas.filter((t) => vencimientoVigente(t.vence, hoy));
  return vigentes.find((t) => t.predeterminada) ?? null;
}
