// Reglas de la bandeja de notificaciones (módulo puro, node --test).
//
// ── El contrato ──────────────────────────────────────────────────────
//
// Una notificación avisa que una solicitud CAMBIÓ DE ESTADO, y nada más.
// Los cinco estados son los mismos que ya usan el historial y el detalle
// (ESTADOS_CASO_RECLAMO en logic/reclamos.ts): no hay un vocabulario
// paralelo para la bandeja.
//
// Lo que quedó AFUERA, a propósito: recordatorios de visita, asignación de
// técnico, avisos de reclamo y pedidos de calificación. Ninguno de esos
// corresponde a un cambio de estado de la solicitud, y el backend todavía
// no define quién los emite ni cuándo. Volverán cuando ese contrato exista.
//
// Cada notificación dice SIEMPRE si es de un servicio o de una garantía, en
// texto. No alcanza con el ícono ni con el color: un ícono se interpreta y
// un color no se lee en voz alta.

import { ESTADOS_CASO_RECLAMO, type EstadoCasoReclamo } from "./reclamos.ts";

/** De qué habla la notificación. */
export type TipoDeCaso = "servicio" | "garantia";

/** Los cinco estados, los mismos del historial y del detalle. */
export type EstadoDeSolicitud = EstadoCasoReclamo;

export const ESTADOS_NOTIFICABLES = ESTADOS_CASO_RECLAMO;

export interface NotificacionAgrupable {
  /** Fecha ISO con hora. */
  fecha: string;
}

/**
 * El título de cada notificación, por tipo de caso y estado.
 *
 * Es una MATRIZ CERRADA: no hay título por defecto ni armado con plantilla.
 * Un estado sin texto definido no se puede notificar, y que el tipo no
 * compile es justamente lo que lo impide.
 *
 * Las dos columnas dicen lo mismo con palabras distintas a propósito: en
 * garantía la persona pidió "ayuda por garantía", no "un servicio", y la
 * notificación tiene que sonar a lo que pidió.
 */
export const TITULOS: Record<TipoDeCaso, Record<EstadoDeSolicitud, string>> = {
  servicio: {
    "Solicitud recibida": "Recibimos tu solicitud",
    "En revisión": "Estamos revisando tu solicitud",
    "Cita programada": "Tu cita está programada",
    Completada: "Tu servicio fue completado",
    Cancelada: "Tu solicitud fue cancelada",
  },
  garantia: {
    "Solicitud recibida": "Recibimos tu solicitud de garantía",
    "En revisión": "Estamos revisando tu solicitud de garantía",
    "Cita programada": "Tu atención está programada",
    Completada: "Tu solicitud fue completada",
    Cancelada: "Tu solicitud fue cancelada",
  },
};

export function tituloDeNotificacion(
  tipo: TipoDeCaso,
  estado: EstadoDeSolicitud,
): string {
  return TITULOS[tipo][estado];
}

/** "Servicio" o "Garantía", la palabra que encabeza cada fila. */
export const ETIQUETA_DE_TIPO: Record<TipoDeCaso, string> = {
  servicio: "Servicio",
  garantia: "Garantía",
};

/**
 * La primera línea de la fila: de qué caso habla.
 *
 * Sin el nombre del caso, "Tu cita está programada" no dice de cuál de tus
 * servicios te están hablando.
 */
export function encabezadoDeCaso(tipo: TipoDeCaso, nombre: string): string {
  return `${ETIQUETA_DE_TIPO[tipo]} · ${nombre}`;
}

// ── Agrupación por fecha ──────────────────────────────────────────────

export type GrupoFecha = "hoy" | "ayer" | "anteriores";

function soloDia(fechaISO: string): string {
  return fechaISO.slice(0, 10);
}

function diaAnterior(diaISO: string): string {
  const d = new Date(`${diaISO}T12:00:00`);
  d.setDate(d.getDate() - 1);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Grupo relativo de una fecha respecto de `hoy` (ambas ISO). */
export function grupoDeFecha(fechaISO: string, hoyISO: string): GrupoFecha {
  const dia = soloDia(fechaISO);
  const hoy = soloDia(hoyISO);
  if (dia === hoy) return "hoy";
  if (dia === diaAnterior(hoy)) return "ayer";
  return "anteriores";
}

/**
 * La más reciente arriba.
 *
 * Ya no hay notificación prioritaria: la prioridad la daba el recordatorio
 * de visita, que salió del contrato. Un cambio de estado no pesa más que
 * otro, así que manda la fecha.
 */
export function ordenarNotificaciones<T extends NotificacionAgrupable>(
  notificaciones: readonly T[],
): T[] {
  return [...notificaciones].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Agrupa por fecha relativa en el orden Hoy, Ayer, Anteriores, omitiendo
 * los grupos vacíos. Cada grupo llega ya ordenado.
 */
export function agruparNotificaciones<T extends NotificacionAgrupable>(
  notificaciones: readonly T[],
  hoyISO: string,
): { grupo: GrupoFecha; items: T[] }[] {
  const orden: GrupoFecha[] = ["hoy", "ayer", "anteriores"];
  return orden
    .map((grupo) => ({
      grupo,
      items: ordenarNotificaciones(
        notificaciones.filter((n) => grupoDeFecha(n.fecha, hoyISO) === grupo),
      ),
    }))
    .filter((g) => g.items.length > 0);
}
