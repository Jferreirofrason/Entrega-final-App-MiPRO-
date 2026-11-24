// Dominio de garantías y reclamos.
//
// Separa el CASO (lo que ve el cliente como "su reclamo") de las CITAS
// hijas que ese caso genera (inspección, instalación, reparación, control
// final). El estado del caso NUNCA se guarda como dato propio: se DERIVA
// siempre de las citas con estadoGeneralReclamo(), calcado del precedente
// que ya existe para servicios (ver estadoGeneralServicio() en
// logic/servicios.ts). Esto es lo que garantiza que la card, el hub y el
// detalle nunca puedan mostrar un estado distinto para el mismo caso.
//
// Módulo puro, sin React (node --test).

import type { TipoVisita } from "./servicios";
import { ESTADOS_CITA, estadosAlcanzados, normalizarEstadoCita } from "./estadosCita.ts";
import type { EstadoCita } from "./estadosCita";

export const ESTADOS_CASO_RECLAMO = [
  "Solicitud recibida",
  "En revisión",
  "Cita programada",
  "Completada",
  "Cancelada",
] as const;
export type EstadoCasoReclamo = (typeof ESTADOS_CASO_RECLAMO)[number];

/**
 * El estado de una cita de garantía es EL MISMO vocabulario que el de una
 * cita de servicios: se define una sola vez en logic/estadosCita.ts. Acá
 * queda el alias con el nombre histórico para no romper los imports.
 */
export const ESTADOS_CITA_RECLAMO = ESTADOS_CITA;
export type EstadoCitaReclamo = EstadoCita;

/**
 * Modalidad de atención de UNA cita puntual. LA DEFINE OPERACIÓN/BACKOFFICE,
 * nunca el cliente: 1) el taller visita al cliente (domicilio); 2) el
 * cliente lleva el producto al taller; 3) el cliente lo deja en tienda.
 * Cada cita puede coordinarse distinto (ej. la inspección a domicilio y la
 * reparación en taller), por eso vive dentro de CitaReclamo y no del caso.
 */
export interface ModalidadAtencion {
  tipo: "taller-visita" | "cliente-lleva" | "deja-en-tienda";
  /** Dirección del hogar del cliente o del taller, según el tipo. */
  direccion?: string;
  /** Nombre del taller (tipo "cliente-lleva"). */
  taller?: string;
  /** Canal de contacto del taller (teléfono o WhatsApp). */
  canalContacto?: string;
  /** Nombre de la tienda (tipo "deja-en-tienda"). */
  tienda?: string;
  /** Instrucciones puntuales de la tienda, cuando aplica. */
  instrucciones?: string;
}

/** Un cambio de estado de la cita, con la fecha en que ocurrió. Lo entrega
 * backoffice; sin fecha cargada, la fila se muestra igual (el estado SÍ se
 * alcanzó) pero sin inventar cuándo. */
export interface CambioEstadoCita {
  estado: EstadoCita;
  /** ISO. Ausente cuando backoffice todavía no informó la fecha. */
  fecha?: string;
}

export interface CitaReclamo {
  id: number | string;
  /** Nomenclatura controlada compartida con "Mis servicios". */
  tipo: TipoVisita;
  estado: EstadoCitaReclamo;
  /** ISO. Ausente mientras estado === "Por coordinar" (regla de negocio). */
  fecha?: string;
  /** Rango horario comunicado por operación. */
  horario?: string;
  /** Solo debe poblarse desde "Cita confirmada" en adelante. */
  tecnico?: string;
  modalidad?: ModalidadAtencion;
  /** Cambios de estado ya ocurridos, del más antiguo al más reciente. Solo
   * lo alcanzado: una etapa futura NUNCA aparece acá. */
  historial?: CambioEstadoCita[];
}

export interface ReclamoGarantiaCliente {
  id: string;
  numero: string; // referencia administrativa (REC-2024-0892)
  /** Nombre o alias del producto tal como lo registró el cliente. */
  producto: string;
  /** Cancelación explícita del CASO completo (paralelo a ServicioCliente.cancelado). */
  cancelado?: boolean;
  iniciadoEl?: string; // ISO
  actualizadoEl?: string; // ISO
  resueltoEl?: string; // ISO
  /** Citas hijas del caso (inspección, instalación, reparación, control final). */
  citas: CitaReclamo[];
  // Datos del producto según la matriz de garantía (marca/subcategoría y
  // condiciones de vigencia). El SKU se muestra como "Código de producto".
  marca?: string;
  categoriaProducto?: string;
  subcategoriaProducto?: string;
  codigoProducto?: string;
  /** Condiciones/vigencia de la garantía, texto de la matriz. */
  vigencia?: string;
  /** Factura, fecha de compra y serie capturados en la solicitud. */
  numeroFactura?: string;
  fechaCompra?: string;
  serie?: string;
  /** Motivo elegido en el diagnóstico previo, y detalle libre opcional. */
  motivoProblema?: string;
  descripcionProblema?: string;
  /**
   * Resolución del caso, provista por Jira/backoffice (reemplazado,
   * reparado, no aplicable...). Solo se muestra cuando el caso está
   * Completada; nunca se inventa si todavía no fue cargada.
   */
  resolucion?: string;
  /** Motivo por el que el caso necesita algo del cliente (flag ortogonal:
   * no es uno de los 5 estados, es una condición transversal). */
  requiereAccionCliente?: string;
}

function esCitaCompletada(c: CitaReclamo): boolean {
  return normalizarEstadoCita(c.estado) === "Completada";
}
function esCitaCancelada(c: CitaReclamo): boolean {
  return normalizarEstadoCita(c.estado) === "Cancelada";
}
function esCitaPendiente(c: CitaReclamo): boolean {
  return !esCitaCompletada(c) && !esCitaCancelada(c);
}

/**
 * Estado general del CASO (los 5 exactos de negocio). Jerarquía calcada de
 * estadoGeneralServicio(): cancelación explícita → hay una cita
 * confirmada/en curso (el caso padre NUNCA muestra "En curso", eso es solo
 * de la cita hija) → todas las citas cerradas → queda una "Por coordinar"
 * sin cerrar → sin ninguna cita todavía.
 */
export function estadoGeneralReclamo(r: ReclamoGarantiaCliente): EstadoCasoReclamo {
  if (r.cancelado) return "Cancelada";
  if (r.citas.length === 0) return "Solicitud recibida";

  if (r.citas.some((c) => c.estado === "Cita confirmada" || c.estado === "En curso")) {
    return "Cita programada";
  }

  const pendientes = r.citas.filter(esCitaPendiente); // acá solo quedan "Por coordinar"
  if (pendientes.length === 0) {
    // Sin pendientes: si al menos una cerró completada, el caso terminó.
    // Si todas se cancelaron sin cancelar el caso, se trata como cancelado
    // para no mentir (mismo criterio que estadoGeneralServicio).
    return r.citas.some(esCitaCompletada) ? "Completada" : "Cancelada";
  }

  return "En revisión"; // hay una cita "Por coordinar" sin cerrar
}

/** La cita próxima con fecha más cercana: solo entre las coordinadas y
 * activas ("Cita confirmada"/"En curso"), igual que proximaVisita() en
 * servicios.ts (pendiente = ni completada ni cancelada). Reemplaza a
 * proximaVisitaReclamo/fechaCitaReclamo. */
export function citaRelevante(r: ReclamoGarantiaCliente): CitaReclamo | null {
  const conFecha = r.citas.filter(
    (c) => (c.estado === "Cita confirmada" || c.estado === "En curso") && Boolean(c.fecha),
  );
  if (conFecha.length === 0) return null;
  return conFecha.reduce((min, c) => ((c.fecha as string) < (min.fecha as string) ? c : min));
}

/** Citas en orden cronológico para el historial del detalle (más antigua
 * primero); las que aún no tienen fecha ("Por coordinar") van al final. */
export function citasEnOrden(r: ReclamoGarantiaCliente): CitaReclamo[] {
  return [...r.citas].sort((a, b) => {
    if (a.fecha && b.fecha) return a.fecha.localeCompare(b.fecha);
    if (a.fecha) return -1;
    if (b.fecha) return 1;
    return 0;
  });
}

/** "Por coordinar" no muestra fecha (regla exacta de negocio). */
export function debeMostrarFechaCita(c: CitaReclamo): boolean {
  return c.estado !== "Por coordinar";
}

/** El técnico solo se muestra desde "Cita confirmada" en adelante. */
export function debeMostrarTecnicoCita(c: CitaReclamo): boolean {
  return c.estado !== "Por coordinar";
}

export function esReclamoActivo(r: ReclamoGarantiaCliente): boolean {
  const e = estadoGeneralReclamo(r);
  return e !== "Completada" && e !== "Cancelada";
}

export function reclamoRequiereAccion(r: ReclamoGarantiaCliente): boolean {
  return Boolean(r.requiereAccionCliente);
}

/**
 * Prioridad para el Home y el listado (menor = más importante):
 * 1) requiere acción del usuario; 2) cita próxima; 3) activos sin cita
 * próxima; 4) completados; 5) cancelados.
 */
export function prioridadReclamo(r: ReclamoGarantiaCliente): number {
  if (reclamoRequiereAccion(r)) return 0;
  if (esReclamoActivo(r) && citaRelevante(r)) return 1;
  if (esReclamoActivo(r)) return 2;
  if (estadoGeneralReclamo(r) === "Cancelada") return 4;
  return 3; // Completada
}

function fechaRelevante(r: ReclamoGarantiaCliente): string {
  return r.actualizadoEl ?? r.resueltoEl ?? r.iniciadoEl ?? "";
}

export function ordenarReclamos(
  reclamos: readonly ReclamoGarantiaCliente[],
): ReclamoGarantiaCliente[] {
  return [...reclamos].sort((a, b) => {
    const pa = prioridadReclamo(a);
    const pb = prioridadReclamo(b);
    if (pa !== pb) return pa - pb;
    if (pa === 1) {
      const va = citaRelevante(a)?.fecha ?? "";
      const vb = citaRelevante(b)?.fecha ?? "";
      return va.localeCompare(vb);
    }
    return fechaRelevante(b).localeCompare(fechaRelevante(a));
  });
}

/**
 * Reclamo que muestra el Home: el más prioritario. Si solo hay finalizados,
 * el más reciente (aporta el cierre del caso); sin reclamos, null.
 */
export function reclamoParaHome(
  reclamos: readonly ReclamoGarantiaCliente[],
): ReclamoGarantiaCliente | null {
  if (reclamos.length === 0) return null;
  return ordenarReclamos(reclamos)[0];
}

/** "Ver todos" solo cuando hay más de un reclamo. */
export function debeMostrarVerTodos(cantidad: number): boolean {
  return cantidad >= 2;
}

/**
 * Última actualización del caso: la fecha de la cita más reciente si
 * existe; si no, cae a las fechas administrativas disponibles.
 */
export function ultimaActualizacion(r: ReclamoGarantiaCliente): string | null {
  const fechasCitas = r.citas.map((c) => c.fecha).filter(Boolean) as string[];
  const ultimaCita = fechasCitas.length ? [...fechasCitas].sort().at(-1)! : null;
  return r.actualizadoEl ?? ultimaCita ?? r.resueltoEl ?? r.iniciadoEl ?? null;
}

/**
 * Historial de UNA cita: los estados por los que ya pasó, con su fecha.
 *
 * Si backoffice cargó el historial, se usa tal cual (recortado a los
 * estados realmente alcanzados, por si llegara con ruido). Si no lo cargó,
 * se deriva del estado actual con estadosAlcanzados(): se muestran los
 * estados recorridos y la fecha se adjunta SOLO donde se conoce (la de la
 * cita corresponde al momento en que se confirmó). Nunca se inventa una
 * fecha ni se presenta como cumplida una etapa que no ocurrió.
 */
export function historialCita(c: CitaReclamo): CambioEstadoCita[] {
  // Lo cargado por backoffice es, por definición, lo que ya ocurrió: se usa
  // tal cual. Es además el único lugar donde puede constar por qué estados
  // pasó una cita antes de cancelarse.
  if (c.historial && c.historial.length > 0) return c.historial;

  // Sin historial cargado se deriva del estado actual: los estados
  // recorridos hasta él, con fecha solo donde se conoce. Una cita cancelada
  // deriva únicamente "Cancelada": desde el estado actual no se puede saber
  // hasta dónde había llegado, y no se inventa.
  return estadosAlcanzados(c.estado).map((estado) => ({
    estado,
    fecha: estado === "Cita confirmada" ? c.fecha : undefined,
  }));
}
