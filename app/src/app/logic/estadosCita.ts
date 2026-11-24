// Vocabulario ÚNICO del estado de una CITA.
//
// Servicios y Garantías son dos entidades distintas (un servicio del hogar
// no es un reclamo de garantía), pero la cita es la misma cosa en los dos:
// una visita coordinada con el cliente. Por eso el estado de la cita se
// define acá una sola vez y lo leen los dos dominios. El estado del CASO es
// otra cosa y vive en cada dominio (ver ESTADOS_CASO_RECLAMO en reclamos.ts
// y EstadoGeneralServicio en servicios.ts): NO se mezclan.
//
// Módulo puro, sin React (node --test).

export const ESTADOS_CITA = [
  "Por coordinar",
  "Cita confirmada",
  "En curso",
  "Completada",
  "Cancelada",
] as const;

export type EstadoCita = (typeof ESTADOS_CITA)[number];

/**
 * Recorrido habitual de una cita. "Cancelada" no está acá porque no es un
 * paso más: es una salida posible desde cualquier estado anterior.
 */
export const RECORRIDO_CITA: readonly EstadoCita[] = [
  "Por coordinar",
  "Cita confirmada",
  "En curso",
  "Completada",
];

/**
 * Vocabulario heredado que todavía llega desde el modelo viejo
 * (data/projects.ts tipa su `status` con "Agendado", "En camino", etc.) y
 * desde fixtures escritas antes de unificar. Se traduce en el borde: la
 * pantalla nunca muestra dos palabras para el mismo estado.
 *
 * "En pausa" NO se mapea: no es ninguno de los cinco y no se inventa un
 * equivalente. Cae en el caso desconocido y se muestra tal cual.
 */
const EQUIVALENCIAS: Record<string, EstadoCita> = {
  "por coordinar": "Por coordinar",
  "pendiente de coordinación": "Por coordinar",
  "pendiente de coordinacion": "Por coordinar",
  "pendiente sincronizar": "Por coordinar",
  "solicitud recibida": "Por coordinar",
  "cita confirmada": "Cita confirmada",
  "cita programada": "Cita confirmada",
  agendado: "Cita confirmada",
  agendada: "Cita confirmada",
  coordinado: "Cita confirmada",
  coordinada: "Cita confirmada",
  "visita coordinada": "Cita confirmada",
  "en curso": "En curso",
  "en progreso": "En curso",
  "en proceso": "En curso",
  "en camino": "En curso",
  completada: "Completada",
  completado: "Completada",
  finalizado: "Completada",
  finalizada: "Completada",
  cancelada: "Cancelada",
  cancelado: "Cancelada",
};

/**
 * Traduce cualquier estado recibido al vocabulario de cita. Devuelve null
 * cuando no hay equivalencia conocida: quien llama decide qué hacer (se
 * muestra el texto original, nunca se inventa un estado).
 */
export function normalizarEstadoCita(estado: string): EstadoCita | null {
  return EQUIVALENCIAS[estado.trim().toLowerCase()] ?? null;
}

/** El estado canónico, o el texto original si no se reconoce. */
export function etiquetaEstadoCita(estado: string): string {
  return normalizarEstadoCita(estado) ?? estado;
}

export function esCitaCompletada(estado: string): boolean {
  return normalizarEstadoCita(estado) === "Completada";
}

export function esCitaCancelada(estado: string): boolean {
  return normalizarEstadoCita(estado) === "Cancelada";
}

/** Ni completada ni cancelada: la cita sigue formando parte del plan. */
export function esCitaPendiente(estado: string): boolean {
  return !esCitaCompletada(estado) && !esCitaCancelada(estado);
}

/** "Por coordinar" es el único estado sin fecha (regla de negocio). */
export function debeMostrarFecha(estado: string): boolean {
  return normalizarEstadoCita(estado) !== "Por coordinar";
}

/** El técnico se conoce recién cuando la cita se confirma. */
export function debeMostrarTecnico(estado: string): boolean {
  return normalizarEstadoCita(estado) !== "Por coordinar";
}

/**
 * Estados que una cita YA alcanzó, para el historial. Solo se muestra lo
 * alcanzado: nunca se presentan etapas futuras como si hubieran ocurrido.
 * Una cancelación corta el recorrido en el estado en que se canceló, así
 * que se listan los anteriores más "Cancelada".
 */
export function estadosAlcanzados(estado: string): EstadoCita[] {
  const actual = normalizarEstadoCita(estado);
  if (!actual) return [];
  if (actual === "Cancelada") return ["Cancelada"];
  const hasta = RECORRIDO_CITA.indexOf(actual);
  return hasta < 0 ? [] : RECORRIDO_CITA.slice(0, hasta + 1);
}

/** Clave para getStatusConfig (color e ícono del sistema existente). */
export function claveVisualCita(estado: string): string {
  const actual = normalizarEstadoCita(estado);
  switch (actual) {
    case "Por coordinar":
      return "solicitud recibida";
    case "Cita confirmada":
      return "agendado";
    case "En curso":
      return "en progreso";
    case "Completada":
      return "completado";
    case "Cancelada":
      return "cancelado";
    default:
      return estado;
  }
}
