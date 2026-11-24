// Dominio de "Mis Citas" reorganizado: la unidad principal es el SERVICIO
// del cliente, que contiene una o varias VISITAS.
//
// El modelo actual del código (data/projects.ts) no tiene esta relación: cada
// Project es una cita plana con una sola fecha y un solo técnico. Este módulo
// define la entidad padre que falta y las reglas de agrupación, clasificación
// y orden. Módulo puro, sin React, para probarlo con node --test.
//
// PENDIENTE DE PRODUCTO (clave): si el total de visitas se conoce desde el
// inicio. Mientras no se confirme, `totalVisitasConfirmado` queda en false y
// el progreso se comunica sin prometer un total ("2 visitas realizadas").

import { normalizarEstadoCita } from "./estadosCita.ts";

/**
 * Nomenclatura CONTROLADA de visitas: el título de cada visita viene de
 * backoffice con estos nombres estandarizados, nunca de texto libre. La
 * lista es mock configurable hasta que operaciones publique la definitiva.
 */
export const TIPOS_VISITA = [
  "Inspección",
  "Instalación",
  "Reparación",
  "Control final",
] as const;

export type TipoVisita = (typeof TIPOS_VISITA)[number];

export interface VisitaServicio {
  id: number | string;
  /** Título de la visita según la nomenclatura controlada de backoffice
   * (TIPOS_VISITA). Se tipa string porque el vocabulario final lo entrega
   * backoffice; el prototipo usa solo los nombres estandarizados. */
  proposito?: string;
  /** Vocabulario ÚNICO de cita, compartido con garantías (ver
   * logic/estadosCita.ts): Por coordinar, Cita confirmada, En curso,
   * Completada, Cancelada. Se tipa string porque el modelo viejo
   * (data/projects.ts) todavía entrega su propio vocabulario; se traduce
   * en el borde con normalizarEstadoCita(). */
  estado: string;
  /** Fecha y hora en ISO 8601, cuando la visita está coordinada. */
  visitAt?: string;
  /** Fin del rango horario coordinado, cuando el negocio lo informa. */
  visitaFinAt?: string;
  tecnico?: string;
}

export interface ServicioCliente {
  id: string;
  nombre: string;
  visitas: VisitaServicio[];
  /** Estado general explícito del padre: cancelación del servicio completo. */
  cancelado?: boolean;
  canceladoEl?: string;
  /** Fecha en que el negocio dio por terminado el servicio. */
  finalizadoEl?: string;
  /** true solo si el negocio confirma el plan de visitas desde el inicio. */
  totalVisitasConfirmado?: boolean;
  // Información base de la solicitud, cuando el servicio nació en la app.
  numeroReserva?: string;
  /** Fecha ISO de creación de la solicitud (cuando nació en la app). */
  creadaEl?: string;
  direccionTexto?: string;
  totalEstimado?: number;
  notas?: string;
  contactoNombre?: string;
}

export type EstadoGeneralServicio =
  | "solicitud-recibida"
  | "coordinando"
  | "visita-agendada"
  | "en-curso"
  | "completado"
  | "cancelado";

export type TabServicios = "en-curso" | "finalizadas";

/** El estado de la visita, traducido al vocabulario único de cita. */
function norm(estado: string): ReturnType<typeof normalizarEstadoCita> {
  return normalizarEstadoCita(estado);
}

export function esVisitaCompletada(v: VisitaServicio): boolean {
  return norm(v.estado) === "Completada";
}

export function esVisitaCancelada(v: VisitaServicio): boolean {
  return norm(v.estado) === "Cancelada";
}

/** Visita que todavía forma parte del plan (ni completada ni cancelada). */
export function esVisitaPendiente(v: VisitaServicio): boolean {
  return !esVisitaCompletada(v) && !esVisitaCancelada(v);
}

/**
 * Estado general del servicio.
 * Jerarquía: cancelación explícita del padre; luego trabajo activo; luego
 * todo completado; luego próxima visita agendada; luego coordinación.
 * Una visita cancelada NO cancela el servicio (puede haber otra futura).
 */
export function estadoGeneralServicio(s: ServicioCliente): EstadoGeneralServicio {
  if (s.cancelado) return "cancelado";
  if (s.visitas.length === 0) return "solicitud-recibida";

  if (s.visitas.some((v) => norm(v.estado) === "En curso")) return "en-curso";

  const pendientes = s.visitas.filter(esVisitaPendiente);
  if (pendientes.length === 0) {
    // Sin pendientes: si al menos una se realizó, el ciclo terminó.
    // Si todas fueron canceladas sin cancelar el padre, es un caso
    // inconsistente del modelo: se trata como cancelado para no mentir.
    return s.visitas.some(esVisitaCompletada) ? "completado" : "cancelado";
  }

  if (pendientes.some((v) => norm(v.estado) === "Cita confirmada" && Boolean(v.visitAt))) {
    return "visita-agendada";
  }
  return "coordinando";
}

/** Regla de tabs: la clasificación mira el servicio completo, no una visita. */
export function clasificarServicio(s: ServicioCliente): TabServicios {
  const estado = estadoGeneralServicio(s);
  return estado === "completado" || estado === "cancelado"
    ? "finalizadas"
    : "en-curso";
}

/**
 * Próxima visita del servicio: entre las pendientes con fecha, la de fecha
 * más cercana. Las visitas pendientes se asumen futuras (una visita pasada
 * queda completada o cancelada en el modelo). Sin visitas coordinadas
 * devuelve null y la interfaz explica que la coordinación está en curso.
 */
export function proximaVisita(s: ServicioCliente): VisitaServicio | null {
  const conFecha = s.visitas
    .filter(esVisitaPendiente)
    .filter((v) => Boolean(v.visitAt));
  if (conFecha.length === 0) return null;
  return conFecha.reduce((min, v) =>
    (v.visitAt as string) < (min.visitAt as string) ? v : min,
  );
}

export interface ProgresoServicio {
  realizadas: number;
  /** Total de visitas del plan (excluye canceladas). */
  total: number;
  /** Solo si el negocio confirmó el plan completo desde el inicio. */
  totalConocido: boolean;
}

export function progresoServicio(s: ServicioCliente): ProgresoServicio {
  const relevantes = s.visitas.filter((v) => !esVisitaCancelada(v));
  return {
    realizadas: relevantes.filter(esVisitaCompletada).length,
    total: relevantes.length,
    totalConocido: s.totalVisitasConfirmado === true,
  };
}

/**
 * Orden del tab "En curso": trabajo activo primero, después la próxima
 * visita más cercana, después coordinación pendiente y al final las
 * solicitudes sin visitas.
 */
export function ordenarEnCurso(servicios: readonly ServicioCliente[]): ServicioCliente[] {
  const grupo = (s: ServicioCliente): number => {
    const estado = estadoGeneralServicio(s);
    if (estado === "en-curso") return 0;
    if (estado === "visita-agendada") return 1;
    if (estado === "coordinando") return 2;
    return 3; // solicitud recibida
  };
  return [...servicios].sort((a, b) => {
    const ga = grupo(a);
    const gb = grupo(b);
    if (ga !== gb) return ga - gb;
    if (ga === 1) {
      const fa = proximaVisita(a)?.visitAt ?? "";
      const fb = proximaVisita(b)?.visitAt ?? "";
      return fa.localeCompare(fb);
    }
    return 0;
  });
}

/** Fecha de cierre para ordenar y mostrar en "Finalizadas". */
export function fechaDeCierre(s: ServicioCliente): string | null {
  if (s.canceladoEl) return s.canceladoEl;
  if (s.finalizadoEl) return s.finalizadoEl;
  const completadas = s.visitas
    .filter(esVisitaCompletada)
    .map((v) => v.visitAt)
    .filter(Boolean) as string[];
  if (completadas.length === 0) return null;
  return completadas.sort().at(-1) ?? null;
}

/** Orden del tab "Finalizadas": de más reciente a más antigua. */
export function ordenarFinalizadas(servicios: readonly ServicioCliente[]): ServicioCliente[] {
  return [...servicios].sort((a, b) =>
    (fechaDeCierre(b) ?? "").localeCompare(fechaDeCierre(a) ?? ""),
  );
}

/** Visitas en orden cronológico para el recorrido del detalle. */
export function visitasEnOrden(s: ServicioCliente): VisitaServicio[] {
  return [...s.visitas].sort((a, b) => {
    if (a.visitAt && b.visitAt) return a.visitAt.localeCompare(b.visitAt);
    if (a.visitAt) return -1;
    if (b.visitAt) return 1;
    return 0;
  });
}
