// Reglas de negocio de "Mis Citas" en el Home.
//
// Módulo puro (sin React ni íconos) para poder probarlo con node --test.
//
// Vocabulario de estados: el modelo de proyectos ya usa
// "Coordinado" | "Agendado" | "En camino" | "En progreso" | "En pausa" |
// "Finalizado" | "Cancelado", y el requerimiento del Home suma
// "Pendiente sincronizar" | "Solicitud recibida" | "Visita coordinada" |
// "Completado". Las reglas de acá aceptan ambos.

export interface CitaHome {
  id: number;
  /** Nombre del servicio. */
  titulo: string;
  estado: string;
  /** Fecha visible, tal como la entrega el modelo (ej: "Lun 10 Mar"). */
  fecha: string;
  /** Hora visible (ej: "10:00 a. m."). */
  hora: string;
  /** Técnico asignado. Vacío o ausente = sin técnico. */
  tecnico?: string;
  /**
   * Fecha de la visita en ISO 8601, para poder ordenar.
   * PENDIENTE DE PRODUCTO: el criterio definitivo de "cita más reciente"
   * (creación vs agendamiento vs actualización vs visita) no está definido en
   * el código actual; el interino usa la fecha de la visita, que es la única
   * fecha que hoy existe en el modelo.
   */
  visitAt?: string;
  /**
   * Si una cita cancelada llegó a tener técnico asignado.
   * GAP DE CONTRATO: el modelo actual no lo informa; ver propuesta en la
   * documentación de la entrega. Mientras no llegue, se usa la presencia de
   * `tecnico` como aproximación.
   */
  tuvoTecnicoAsignado?: boolean;
}

const ESTADOS_CON_TECNICO = new Set([
  "visita coordinada",
  "coordinado",
  "agendado",
  "cita confirmada",
  "en camino",
  "en progreso",
  "en curso",
  "en pausa",
  "completado",
  "finalizado",
]);

const ESTADOS_SIN_TECNICO = new Set([
  "pendiente sincronizar",
  "solicitud recibida",
  "por coordinar",
]);

function normalizar(estado: string): string {
  return estado.trim().toLowerCase();
}

/**
 * Cita que se muestra en el Home.
 *
 * Criterio interino (pendiente de confirmación del PO): la cita con la fecha
 * de visita (`visitAt`) más reciente, sin importar su estado. Si algún
 * registro no trae `visitAt`, se conserva el orden de la lista tal como la
 * entrega el modelo, que es lo que hoy hace el listado completo.
 */
export function elegirCitaMasReciente<T extends CitaHome>(
  citas: readonly T[],
): T | null {
  if (citas.length === 0) return null;

  const todasConFecha = citas.every((c) => Boolean(c.visitAt));
  if (!todasConFecha) return citas[0];

  return citas.reduce((max, c) =>
    (c.visitAt as string) > (max.visitAt as string) ? c : max,
  );
}

/** Regla de visibilidad del técnico en la tarjeta de cita. */
export function debeMostrarTecnico(cita: CitaHome): boolean {
  const estado = normalizar(cita.estado);
  const tieneTecnico = Boolean(cita.tecnico && cita.tecnico.trim() !== "");

  if (ESTADOS_SIN_TECNICO.has(estado)) return false;

  if (estado === "cancelado") {
    // Solo si llegó a tener técnico asignado. Si el contrato todavía no
    // envía `tuvoTecnicoAsignado`, se aproxima con la presencia del dato.
    if (cita.tuvoTecnicoAsignado !== undefined) {
      return cita.tuvoTecnicoAsignado && tieneTecnico;
    }
    return tieneTecnico;
  }

  if (ESTADOS_CON_TECNICO.has(estado)) return tieneTecnico;

  // Estado desconocido: no mostrar datos que no se puedan respaldar.
  return false;
}

/** "Ver más" solo aparece con dos o más citas. */
export function debeMostrarVerMas(cantidadDeCitas: number): boolean {
  return cantidadDeCitas >= 2;
}
