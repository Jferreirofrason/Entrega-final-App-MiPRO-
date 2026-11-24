// Notificaciones del cliente (mock del prototipo).
//
// ⚠️ CONTRATO CERRADO. Una notificación avisa que una solicitud cambió de
// estado, y nada más. Los cinco estados y los títulos de cada uno viven en
// `logic/notificaciones.ts`; acá solo están los casos de demostración.
//
// Salieron del contrato, y de estos fixtures, el recordatorio de visita, la
// asignación de técnico, el aviso de reclamo y el pedido de calificación:
// ninguno es un cambio de estado de la solicitud y el backend todavía no
// define quién los emite.
//   ENDPOINT: GET /api/notificaciones
//
// Cada notificación apunta a un servicio o a un reclamo que EXISTE en los
// fixtures, así que la fila abre un detalle de verdad. El nombre del caso
// no se escribe acá: lo resuelve la pantalla contra la misma fuente que el
// detalle, para que nunca digan cosas distintas.
//
// "Leída" y "eliminada" se recuerdan en sessionStorage POR NOTIFICACIÓN.
// Las fechas son RELATIVAS al día actual para que la bandeja muestre los
// grupos Hoy, Ayer y Anteriores.

import type { EstadoDeSolicitud, TipoDeCaso } from "../logic/notificaciones";

export interface NotificacionCliente {
  id: string;
  /** Servicio o garantía. Se muestra SIEMPRE, en texto. */
  tipoCaso: TipoDeCaso;
  /** El estado al que pasó la solicitud. De acá sale el título. */
  estado: EstadoDeSolicitud;
  /** Fecha ISO con hora (cuándo llegó). */
  fecha: string;
  /** Servicio al que lleva la fila. */
  servicioId?: string;
  /** Reclamo de garantía al que lleva la fila. */
  reclamoId?: string;
}

/** Fecha ISO de hace `dias` días, con la hora dada (mock relativo a hoy). */
function haceDias(dias: number, hora: string): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}T${hora}`;
}

const NOTIFICACIONES: NotificacionCliente[] = [
  // Los cinco estados, en servicio y en garantía. Alcanza para ver la
  // bandeja entera sin inventar un sexto caso.
  {
    id: "n-serv-cita",
    tipoCaso: "servicio",
    estado: "Cita programada",
    fecha: haceDias(0, "09:30:00"),
    servicioId: "fixture-aire-multivisita",
  },
  {
    id: "n-gar-cita",
    tipoCaso: "garantia",
    estado: "Cita programada",
    fecha: haceDias(0, "08:10:00"),
    reclamoId: "fixture-reclamo-taller",
  },
  {
    id: "n-serv-revision",
    tipoCaso: "servicio",
    estado: "En revisión",
    fecha: haceDias(1, "16:40:00"),
    servicioId: "fixture-pintura-coordinando",
  },
  {
    id: "n-gar-revision",
    tipoCaso: "garantia",
    estado: "En revisión",
    fecha: haceDias(1, "11:05:00"),
    reclamoId: "fixture-reclamo-coordinar",
  },
  {
    id: "n-serv-recibida",
    tipoCaso: "servicio",
    estado: "Solicitud recibida",
    fecha: haceDias(3, "11:20:00"),
    servicioId: "fixture-lavadora-solicitud-recibida",
  },
  {
    id: "n-gar-recibida",
    tipoCaso: "garantia",
    estado: "Solicitud recibida",
    fecha: haceDias(3, "09:00:00"),
    reclamoId: "reclamo-1",
  },
  {
    id: "n-serv-completada",
    tipoCaso: "servicio",
    estado: "Completada",
    fecha: haceDias(5, "17:30:00"),
    servicioId: "fixture-plomeria-completada",
  },
  {
    id: "n-gar-completada",
    tipoCaso: "garantia",
    estado: "Completada",
    fecha: haceDias(5, "15:10:00"),
    reclamoId: "fixture-reclamo-resuelto",
  },
  {
    id: "n-serv-cancelada",
    tipoCaso: "servicio",
    estado: "Cancelada",
    fecha: haceDias(7, "10:15:00"),
    servicioId: "fixture-calentador-cancelado",
  },
  {
    id: "n-gar-cancelada",
    tipoCaso: "garantia",
    estado: "Cancelada",
    fecha: haceDias(8, "12:40:00"),
    reclamoId: "fixture-reclamo-cancelado",
  },
];

const CLAVE_LEIDAS = "mipro-notificaciones-leidas";
// Las eliminadas viven igual que las leídas: por id, en la sesión. No se
// borra el fixture, se tapa; así "Deshacer" puede devolverla sin tener que
// reconstruirla.
//   ENDPOINT: DELETE /api/notificaciones/:id
const CLAVE_ELIMINADAS = "mipro-notificaciones-eliminadas";

function leerIdsLeidas(): Set<string> {
  try {
    const crudo = sessionStorage.getItem(CLAVE_LEIDAS);
    if (crudo) return new Set(JSON.parse(crudo) as string[]);
  } catch {
    // Sin storage: todas se muestran como no leídas.
  }
  return new Set();
}

function guardarIdsLeidas(ids: Set<string>): void {
  try {
    sessionStorage.setItem(CLAVE_LEIDAS, JSON.stringify([...ids]));
  } catch {
    // Sin storage: la campana no baja, nada más.
  }
}

function leerIdsEliminadas(): Set<string> {
  try {
    const crudo = sessionStorage.getItem(CLAVE_ELIMINADAS);
    if (crudo) return new Set(JSON.parse(crudo) as string[]);
  } catch {
    // Sin storage no se elimina nada: la bandeja queda completa.
  }
  return new Set();
}

function guardarIdsEliminadas(ids: Set<string>): void {
  try {
    sessionStorage.setItem(CLAVE_ELIMINADAS, JSON.stringify([...ids]));
  } catch {
    // Sin storage, la eliminación dura lo que dure la pantalla.
  }
}

export function listarNotificaciones(): (NotificacionCliente & { leida: boolean })[] {
  const leidas = leerIdsLeidas();
  const eliminadas = leerIdsEliminadas();
  return NOTIFICACIONES.filter((n) => !eliminadas.has(n.id)).map((n) => ({
    ...n,
    leida: leidas.has(n.id),
  }));
}

/** Saca una notificación de la bandeja. Reversible con `restaurar`. */
export function eliminarNotificacion(id: string): void {
  const eliminadas = leerIdsEliminadas();
  eliminadas.add(id);
  guardarIdsEliminadas(eliminadas);
}

/** Deshace una eliminación: la notificación vuelve a su lugar en la lista. */
export function restaurarNotificacion(id: string): void {
  const eliminadas = leerIdsEliminadas();
  eliminadas.delete(id);
  guardarIdsEliminadas(eliminadas);
}

export function cantidadNoLeidas(): number {
  return listarNotificaciones().filter((n) => !n.leida).length;
}

/**
 * Abrir una notificación la marca leída; el estado persiste al volver.
 *
 *   ENDPOINT: POST /api/notificaciones/:id/leida
 */
export function marcarLeida(id: string): void {
  const leidas = leerIdsLeidas();
  leidas.add(id);
  guardarIdsLeidas(leidas);
}

/**
 * Deja la bandeja entera leída. Lo pide el menú del encabezado.
 *
 *   ENDPOINT: POST /api/notificaciones/leidas
 */
export function marcarTodasLeidas(): void {
  guardarIdsLeidas(new Set(NOTIFICACIONES.map((n) => n.id)));
}

/**
 * Vacía la bandeja. Lo pide el menú del encabezado, con confirmación, y NO se
 * puede deshacer: el texto del modal se lo promete a la persona, así que el
 * backend tiene que cumplirlo.
 *
 *   ENDPOINT: DELETE /api/notificaciones
 */
export function eliminarTodasLasNotificaciones(): void {
  guardarIdsEliminadas(new Set(NOTIFICACIONES.map((n) => n.id)));
}
