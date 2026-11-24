// Capa de presentación de los estados de una cita.
//
// Los valores internos del dominio NO cambian (siguen siendo los que usa el
// modelo y statusConfig). Esta capa traduce cada estado a lenguaje cotidiano:
// qué pasó y qué puede esperar el cliente a continuación. Módulo puro, sin
// React, para poder probarlo con node --test.
//
// Los seis estados del requerimiento usan la microcopy aprobada en el brief.
// Los estados propios del modelo existente (Agendado, En camino, En pausa)
// llevan etiquetas RECOMENDADAS pendientes de validación del PO: se marcan
// abajo. Un estado desconocido se muestra tal cual, sin explicación, para no
// inventar información.

import type { EstadoCasoReclamo, EstadoCitaReclamo } from "../logic/reclamos";

export interface EstadoPresentacion {
  /** Lo que ve el usuario en lugar del nombre interno. */
  etiqueta: string;
  /** Qué significa o qué ocurrirá después. */
  explicacion?: string;
}

const PRESENTACION: Record<string, EstadoPresentacion> = {
  // ── Estados del requerimiento (microcopy del brief) ──
  "pendiente sincronizar": {
    etiqueta: "Estamos enviando tu solicitud",
    explicacion: "Puede demorar unos minutos.",
  },
  "solicitud recibida": {
    etiqueta: "Recibimos tu solicitud",
    explicacion: "Pronto coordinaremos la visita contigo.",
  },
  "visita coordinada": {
    etiqueta: "Tu visita está confirmada",
  },
  "en progreso": {
    etiqueta: "El servicio está en curso",
    explicacion: "El técnico está trabajando en tu solicitud.",
  },
  completado: {
    etiqueta: "Servicio completado",
    explicacion: "La visita fue finalizada.",
  },
  cancelado: {
    etiqueta: "Visita cancelada",
    explicacion: "Esta visita se canceló. Puedes agendar una nueva cuando quieras.",
  },

  // ── Vocabulario del modelo existente ──
  coordinado: {
    etiqueta: "Tu visita está confirmada",
  },
  finalizado: {
    etiqueta: "Servicio completado",
    explicacion: "La visita fue finalizada.",
  },
  // RECOMENDACIÓN pendiente de validación del PO:
  agendado: {
    etiqueta: "Tu visita está agendada",
    explicacion: "Te esperamos en la fecha indicada.",
  },
  "en camino": {
    etiqueta: "El técnico va en camino",
    explicacion: "Se dirige a tu domicilio.",
  },
  "en pausa": {
    etiqueta: "El servicio está en pausa",
    explicacion: "Nos pondremos en contacto contigo.",
  },
};

export function presentarEstado(estadoInterno: string): EstadoPresentacion {
  const clave = estadoInterno.trim().toLowerCase();
  return PRESENTACION[clave] ?? { etiqueta: estadoInterno };
}

// ── Estado GENERAL de un servicio ──
//
// Distinto del estado de cada visita: resume el caso completo con la tabla
// aprobada por diseño: Solicitud recibida, En revisión, Cita programada,
// Completada, Cancelada (más "En curso" para el momento en que la visita
// está ocurriendo, que alimenta la card oscura del Home). La clave visual indica qué entrada del
// sistema de estados existente (statusConfig) da color e ícono al chip.

export interface EstadoServicioPresentacion extends EstadoPresentacion {
  /** Clave para getStatusConfig (color e ícono del sistema existente). */
  claveVisual: string;
}

const PRESENTACION_SERVICIO: Record<string, EstadoServicioPresentacion> = {
  "solicitud-recibida": {
    etiqueta: "Solicitud recibida",
    explicacion: "Pronto nos comunicaremos contigo para coordinar la visita.",
    claveVisual: "solicitud recibida",
  },
  coordinando: {
    etiqueta: "En revisión",
    explicacion: "Estamos revisando tu solicitud para coordinar la visita.",
    claveVisual: "coordinado",
  },
  "visita-agendada": {
    etiqueta: "Cita programada",
    claveVisual: "agendado",
  },
  "en-curso": {
    etiqueta: "En curso",
    claveVisual: "en progreso",
  },
  completado: {
    etiqueta: "Completada",
    claveVisual: "completado",
  },
  cancelado: {
    etiqueta: "Cancelada",
    claveVisual: "cancelado",
  },
};

export function presentarEstadoServicio(
  estadoGeneral: string,
): EstadoServicioPresentacion {
  return (
    PRESENTACION_SERVICIO[estadoGeneral] ?? {
      etiqueta: estadoGeneral,
      claveVisual: estadoGeneral,
    }
  );
}

// ── Estado del CASO (padre) de un reclamo de garantía ──
//
// Vocabulario cerrado de negocio: exactamente estos 5 estados, con estos
// mensajes exactos, centralizados acá para que la card, el hub y el
// detalle SIEMPRE muestren lo mismo (siempre se llama con el estado que
// deriva estadoGeneralReclamo(), nunca con un string suelto).

export interface EstadoCasoReclamoPresentacion {
  etiqueta: string;
  /** Mensaje de tranquilidad exacto, aprobado por negocio. */
  mensaje: string;
  /** Clave para getStatusConfig (color e ícono). */
  claveVisual: string;
}

const PRESENTACION_CASO_RECLAMO: Record<EstadoCasoReclamo, EstadoCasoReclamoPresentacion> = {
  "Solicitud recibida": {
    etiqueta: "Solicitud recibida",
    mensaje: "Recibimos tu solicitud. Te avisaremos cuando tengamos novedades.",
    claveVisual: "solicitud recibida",
  },
  "En revisión": {
    etiqueta: "En revisión",
    mensaje: "Estamos revisando tu solicitud para coordinar la atención.",
    claveVisual: "coordinado",
  },
  "Cita programada": {
    etiqueta: "Cita programada",
    mensaje: "Coordinamos tu cita. Revisa la fecha y el horario.",
    claveVisual: "agendado",
  },
  Completada: {
    etiqueta: "Completada",
    mensaje: "La atención fue finalizada.",
    claveVisual: "completado",
  },
  Cancelada: {
    etiqueta: "Cancelada",
    mensaje: "La solicitud fue cancelada.",
    claveVisual: "cancelado",
  },
};

export function presentarEstadoCasoReclamo(
  estado: EstadoCasoReclamo,
): EstadoCasoReclamoPresentacion {
  return PRESENTACION_CASO_RECLAMO[estado];
}

// ── Estado de una CITA hija de un reclamo (inspección, instalación,
// reparación, control final) ──
//
// Vocabulario distinto y exclusivo del timeline "Visitas de este
// servicio"/historial de reclamo: nunca se confunde con el estado del caso.

export interface EstadoCitaReclamoPresentacion {
  etiqueta: string;
  /** Clave para getStatusConfig (color e ícono). */
  claveVisual: string;
}

const PRESENTACION_CITA_RECLAMO: Record<EstadoCitaReclamo, EstadoCitaReclamoPresentacion> = {
  "Por coordinar": { etiqueta: "Por coordinar", claveVisual: "solicitud recibida" },
  "Cita confirmada": { etiqueta: "Cita confirmada", claveVisual: "agendado" },
  "En curso": { etiqueta: "En curso", claveVisual: "en progreso" },
  Completada: { etiqueta: "Completada", claveVisual: "completado" },
  Cancelada: { etiqueta: "Cancelada", claveVisual: "cancelado" },
};

export function presentarEstadoCitaReclamo(
  estado: EstadoCitaReclamo,
): EstadoCitaReclamoPresentacion {
  return PRESENTACION_CITA_RECLAMO[estado];
}
