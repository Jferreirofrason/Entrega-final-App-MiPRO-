// Historial de solicitudes: servicios y garantías en una sola lista.
//
// Módulo puro (node --test). Sin DOM, sin storage y sin red.
//
// ⚠️ NO HAY DATOS NUEVOS ACÁ. Esta capa NO crea otra fuente de verdad: lee
// los servicios (logic/servicios.ts) y los casos de garantía
// (logic/reclamos.ts) que la app ya tiene, y los normaliza a una fila
// común. El detalle sigue siendo el de siempre: /servicios/:id para un
// servicio y /reclamos/:id para una garantía.
//
// Dicho de otra forma: esta pantalla es una PUERTA, no un modelo. Si un
// estado cambia, cambia en su módulo y acá se refleja solo.

import { estadoGeneralServicio, proximaVisita, type ServicioCliente } from "./servicios.ts";
import {
  citaRelevante,
  ESTADOS_CASO_RECLAMO,
  estadoGeneralReclamo,
  type EstadoCasoReclamo,
  type ReclamoGarantiaCliente,
} from "./reclamos.ts";

/** De dónde viene la solicitud. */
export type TipoSolicitud = "servicio" | "garantia";

/**
 * El estado de una solicitud.
 *
 * Son LOS MISMOS cinco que ya definía el módulo de garantías
 * (ESTADOS_CASO_RECLAMO): no se inventa un vocabulario paralelo con
 * "Pendiente" o "Programado". Un servicio y una garantía recorren el mismo
 * camino y la persona no tiene por qué aprender dos listas de estados.
 */
export type EstadoSolicitud = EstadoCasoReclamo;

export const ESTADOS_SOLICITUD = ESTADOS_CASO_RECLAMO;

/**
 * Cada estado con la clave visual del sistema de estados que ya usa la app
 * (utils/statusConfig): el color y el ícono NO se inventan, salen del mismo
 * lugar que en Mis Citas y en Garantía. El nombre visible es el del modelo
 * y no se traduce.
 *
 * Vive acá, con el vocabulario, y no en una pantalla: lo usan el historial
 * y la bandeja de notificaciones, y un estado no puede verse de dos colores
 * según desde dónde se lo mire.
 */
export const CLAVE_VISUAL_DE_ESTADO: Record<EstadoSolicitud, string> = {
  "Solicitud recibida": "solicitud recibida",
  "En revisión": "en progreso",
  "Cita programada": "agendado",
  Completada: "finalizado",
  Cancelada: "cancelado",
};

/** Los tres estados en los que todavía puede pasar algo. */
export const ESTADOS_ACTIVOS: readonly EstadoSolicitud[] = [
  "Solicitud recibida",
  "En revisión",
  "Cita programada",
];

/** Una fila de la lista, venga de donde venga. */
export interface SolicitudUnificada {
  id: string;
  tipo: TipoSolicitud;
  /** El servicio contratado, o el producto de la garantía. */
  titulo: string;
  /** Número de reserva (MPR-) o de caso (REC-), cuando lo tiene. */
  numero?: string;
  /** Cuándo se pidió, en ISO. */
  creadaEl?: string;
  estado: EstadoSolicitud;
  /** La cita que importa: la próxima si hay, en ISO. */
  citaAt?: string;
  /** Fin de esa cita (servicios), para armar el rango horario. */
  citaFinAt?: string;
  /** Quién la atiende. NO va en la fila: el técnico es de UNA visita. */
  tecnico?: string;
  /** Código del producto, cuando la solicitud es de una garantía. */
  sku?: string;
  /** Foto del servicio; una garantía no tiene foto del producto. */
  imagen?: string;
  /** La pantalla de detalle que ya existe para esta solicitud. */
  ruta: string;
}

/**
 * El estado de un servicio, traducido al vocabulario de la lista.
 *
 * ⚠️ "en-curso" (hay una visita sucediendo ahora) también cae en "Cita
 * programada": el estado de UNA VISITA no clasifica a la solicitud entera,
 * y lo que la persona necesita saber del caso es que hay una cita en pie.
 * El detalle de la visita sí dice si está en curso.
 */
export function estadoDeServicio(s: ServicioCliente): EstadoSolicitud {
  switch (estadoGeneralServicio(s)) {
    case "cancelado":
      return "Cancelada";
    case "completado":
      return "Completada";
    case "visita-agendada":
    case "en-curso":
      return "Cita programada";
    case "coordinando":
      return "En revisión";
    default:
      return "Solicitud recibida";
  }
}

/** El estado de un caso de garantía: ya viene en este vocabulario. */
export function estadoDeGarantia(r: ReclamoGarantiaCliente): EstadoSolicitud {
  return estadoGeneralReclamo(r);
}

/** Un servicio, como fila de la lista. */
export function desdeElServicio(
  s: ServicioCliente,
  imagen?: string,
): SolicitudUnificada {
  const proxima = proximaVisita(s);
  return {
    id: s.id,
    tipo: "servicio",
    titulo: s.nombre,
    numero: s.numeroReserva,
    creadaEl: s.creadaEl,
    estado: estadoDeServicio(s),
    citaAt: proxima?.visitAt,
    citaFinAt: proxima?.visitaFinAt,
    tecnico: proxima?.tecnico,
    imagen,
    ruta: `/servicios/${s.id}`,
  };
}

/** Un caso de garantía, como fila de la lista. */
export function desdeLaGarantia(r: ReclamoGarantiaCliente): SolicitudUnificada {
  const cita = citaRelevante(r);
  return {
    id: r.id,
    tipo: "garantia",
    titulo: r.producto,
    numero: r.numero,
    creadaEl: r.iniciadoEl,
    estado: estadoDeGarantia(r),
    // En una cita de garantía la fecha se llama `fecha`, no `visitAt`.
    // Una cita de garantía no trae hora de fin. El rango escrito que sí
    // trae (`horario`) es el horario de ATENCIÓN del taller, no un bloque
    // de cita: en una fila, abajo de la hora real, se lee como si fueran
    // dos horarios distintos. Vive en el detalle, que tiene lugar para
    // explicarlo.
    citaAt: cita?.fecha,
    tecnico: cita?.tecnico,
    sku: r.codigoProducto,
    ruta: `/reclamos/${r.id}`,
  };
}

/** Si la solicitud sigue abierta (algo va a pasar con ella). */
export function estaActiva(s: SolicitudUnificada): boolean {
  return ESTADOS_ACTIVOS.includes(s.estado);
}

export function estaFinalizada(s: SolicitudUnificada): boolean {
  return !estaActiva(s);
}

// ── Filtros y búsqueda ────────────────────────────────────────────────
//
// UN solo estado de filtro para las dos dimensiones, como en Mis productos:
// dos sistemas de chips, cada uno con su propio "Todos" encendido, no se
// pueden leer. Sin filtros no se dibuja ningún chip.

export type FiltroDeEstado = "todos" | "activos" | "finalizados";
export type FiltroDeTipo = "todos" | TipoSolicitud;

export interface FiltrosDeHistorial {
  estado: FiltroDeEstado;
  tipo: FiltroDeTipo;
}

export const SIN_FILTROS: FiltrosDeHistorial = { estado: "todos", tipo: "todos" };

/** Lee el recorte de la dirección: ?tipo=servicios&estado=activos. */
export function filtrosDesdeLaDireccion(search: string): FiltrosDeHistorial {
  const params = new URLSearchParams(search);
  const tipoCrudo = params.get("tipo");
  const estadoCrudo = params.get("estado");
  return {
    tipo:
      tipoCrudo === "servicios" || tipoCrudo === "servicio"
        ? "servicio"
        : tipoCrudo === "garantias" || tipoCrudo === "garantia"
          ? "garantia"
          : "todos",
    estado:
      estadoCrudo === "activos"
        ? "activos"
        : estadoCrudo === "finalizados"
          ? "finalizados"
          : "todos",
  };
}

export function aplicarFiltros(
  solicitudes: readonly SolicitudUnificada[],
  filtros: FiltrosDeHistorial,
): SolicitudUnificada[] {
  return solicitudes.filter((s) => {
    if (filtros.tipo !== "todos" && s.tipo !== filtros.tipo) return false;
    if (filtros.estado === "activos" && !estaActiva(s)) return false;
    if (filtros.estado === "finalizados" && estaActiva(s)) return false;
    return true;
  });
}

export function hayFiltros(filtros: FiltrosDeHistorial): boolean {
  return filtros.estado !== "todos" || filtros.tipo !== "todos";
}

/** Un filtro puesto, como se ve en su chip y como se quita. */
export type FiltroPuesto =
  | { dimension: "estado"; valor: Exclude<FiltroDeEstado, "todos"> }
  | { dimension: "tipo"; valor: TipoSolicitud };

export function filtrosPuestos(filtros: FiltrosDeHistorial): FiltroPuesto[] {
  const puestos: FiltroPuesto[] = [];
  if (filtros.estado !== "todos") {
    puestos.push({ dimension: "estado", valor: filtros.estado });
  }
  if (filtros.tipo !== "todos") puestos.push({ dimension: "tipo", valor: filtros.tipo });
  return puestos;
}

export function quitarFiltro(
  filtros: FiltrosDeHistorial,
  puesto: FiltroPuesto,
): FiltrosDeHistorial {
  return puesto.dimension === "estado"
    ? { ...filtros, estado: "todos" }
    : { ...filtros, tipo: "todos" };
}

function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Busca por número y por nombre.
 *
 * El número es lo que la persona tiene a mano cuando llama a soporte, así
 * que se busca entero o por un pedazo: escribir "0892" tiene que encontrar
 * el REC-2024-0892.
 */
export function buscarSolicitudes(
  solicitudes: readonly SolicitudUnificada[],
  termino: string,
): SolicitudUnificada[] {
  const t = normalizar(termino);
  if (t === "") return [...solicitudes];
  return solicitudes.filter((s) =>
    [s.numero ?? "", s.titulo, s.sku ?? ""].some((campo) => normalizar(campo).includes(t)),
  );
}

/**
 * El orden de la lista.
 *
 * Lo abierto arriba, porque es sobre lo que se puede hacer algo; dentro de
 * lo abierto, la cita más próxima primero y las que todavía no tienen cita
 * después. Lo cerrado va abajo, de lo más reciente a lo más viejo.
 */
export function ordenarSolicitudes(
  solicitudes: readonly SolicitudUnificada[],
): SolicitudUnificada[] {
  const cuando = (s: SolicitudUnificada) => s.citaAt ?? s.creadaEl ?? "";
  return [...solicitudes].sort((a, b) => {
    const activaA = estaActiva(a);
    const activaB = estaActiva(b);
    if (activaA !== activaB) return activaA ? -1 : 1;
    if (activaA) {
      if (a.citaAt && b.citaAt) return a.citaAt.localeCompare(b.citaAt);
      if (a.citaAt) return -1;
      if (b.citaAt) return 1;
      return (b.creadaEl ?? "").localeCompare(a.creadaEl ?? "");
    }
    return cuando(b).localeCompare(cuando(a));
  });
}

/** La lista tal como se muestra: filtros, búsqueda y orden, en ese orden. */
export function listarHistorial(
  solicitudes: readonly SolicitudUnificada[],
  filtros: FiltrosDeHistorial,
  termino: string,
): SolicitudUnificada[] {
  return ordenarSolicitudes(buscarSolicitudes(aplicarFiltros(solicitudes, filtros), termino));
}

/** Cuántas hay abiertas, para la segunda línea del acceso en Perfil. */
export function cuantasAbiertas(solicitudes: readonly SolicitudUnificada[]): number {
  return solicitudes.filter(estaActiva).length;
}

/**
 * Lo que falta definir para que esto deje de depender de dos modelos.
 */
export const PENDIENTE_DE_MIS_SOLICITUDES = [
  "Un endpoint único de solicitudes, o dos y que la app los una como acá",
  "Si una garantía y el servicio que sale de ella se muestran enlazados",
  "Qué pasa con una solicitud sin cita cuando pasa mucho tiempo",
  "Si la lista necesita paginado cuando una cuenta acumula años de historial",
  "Reprogramar una cita de verdad: hoy no hay agenda contra la que escribir",
  "Factura y reporte de servicio: no existe el documento, ni mock",
] as const;
