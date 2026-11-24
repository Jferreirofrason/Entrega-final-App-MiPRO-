// Dominio del flujo de agendamiento de un servicio.
//
// Módulo puro (node --test): borrador de la solicitud, validaciones por
// etapa, cálculo del total estimado, bloques horarios y armado de la
// dirección. Los textos de error van en lenguaje claro.
//
// Decisiones de producto documentadas:
// - La fecha y el bloque horario son una PREFERENCIA: la confirmación la
//   hace un agente de MiPRO fuera de la app (igual que el pago).
// - Los bloques horarios son "mañana" y "tarde"; los rangos que se muestran
//   son orientativos del prototipo (operaciones define los productivos).
// - Los campos de la dirección son abiertos: NO están validados contra un
//   catálogo de provincias/distritos (pendiente de integración).
// - El contacto alternativo es opcional.

import type { AdjuntoSolicitud } from "./solicitudGarantia.ts";

/**
 * Dirección cargada a mano. TODOS los campos son obligatorios: el técnico
 * tiene que poder llegar, y en el prototipo no hay forma de pedirle el dato
 * que falte una vez enviada la solicitud. Lo único opcional del flujo es el
 * contacto alternativo (ver validarContacto), que es otra cosa.
 */
export interface DireccionNueva {
  alias: string;
  provincia: string;
  distrito: string;
  corregimiento: string;
  barrio: string;
  calle: string;
  casa: string;
  edificio: string;
  piso: string;
  numero: string;
  detalles: string;
}

export type BloqueHorario = "manana" | "tarde";

export interface ContactoAlternativo {
  nombre: string;
  telefono: string;
}

export interface BorradorServicio {
  servicioId: string;
  cantidad: number;
  notas?: string;
  fotos: AdjuntoSolicitud[];
  /** Id de una dirección guardada, o los datos de una nueva. */
  direccionId?: string;
  direccionNueva?: DireccionNueva;
  contacto?: ContactoAlternativo;
  /** Fecha preferida en formato ISO (solo día). */
  fechaPreferida?: string;
  bloque?: BloqueHorario;
  /** Resultado del paso "Revisar el lugar", cuando el servicio lo tiene. */
  condiciones?: "estandar" | "inspeccion";
  incluyeDesinstalacion?: boolean;
  /** Precio del adicional de desinstalación, cuando el cliente lo sumó. */
  precioDesinstalacion?: number;
  /**
   * El producto comprado que originó la solicitud, cuando se entró desde
   * Mis productos. Es CONTEXTO: no cambia ningún paso del flujo ni ninguna
   * validación, viaja con la solicitud para que el técnico sepa sobre qué
   * equipo va. Sin este dato el flujo es exactamente el de siempre.
   */
  compra?: ContextoCompra;
}

/** Los datos de la compra que acompañan a la solicitud. */
export interface ContextoCompra {
  productoId: string;
  /** De dónde salió el producto: una compra o un alta a mano. */
  origen: "purchase" | "manual";
  nombre: string;
  /** Solo las compras tienen SKU, tienda y fecha. */
  sku?: string;
  tienda?: string;
  marca?: string;
  categoria?: string;
  fechaCompra?: string;
}

/** Precio de la visita de evaluación; se descuenta si se acepta la cotización. */
export const PRECIO_INSPECCION_USD = 20;

export const CANTIDAD_MINIMA = 1;
export const CANTIDAD_MAXIMA = 10;

export function borradorInicial(servicioId: string): BorradorServicio {
  return { servicioId, cantidad: 1, fotos: [] };
}

export function cantidadValida(cantidad: number): boolean {
  return (
    Number.isInteger(cantidad) &&
    cantidad >= CANTIDAD_MINIMA &&
    cantidad <= CANTIDAD_MAXIMA
  );
}

/**
 * Total estimado: precio base por cantidad. Sin precio base no hay total
 * (el precio se confirma al cotizar). Los adicionales (inspección o
 * desinstalación) se cotizan aparte y no entran en este cálculo.
 */
export function totalEstimado(
  precioDesde: number | undefined,
  cantidad: number,
): number | null {
  if (precioDesde === undefined || !cantidadValida(cantidad)) return null;
  return precioDesde * cantidad;
}

/**
 * Total estimado con adicionales: el precio base por cantidad más los
 * adicionales con precio conocido (hoy, la desinstalación). La inspección
 * no entra: su costo se descuenta de la cotización si se acepta.
 */
export function totalConAdicionales(
  precioDesde: number | undefined,
  cantidad: number,
  precioDesinstalacion?: number,
): number | null {
  const base = totalEstimado(precioDesde, cantidad);
  if (base === null) return null;
  return base + (precioDesinstalacion ?? 0);
}

export const BLOQUES_HORARIOS: {
  id: BloqueHorario;
  etiqueta: string;
  /** Rango orientativo del prototipo; operaciones define el productivo. */
  detalle: string;
}[] = [
  { id: "manana", etiqueta: "En la mañana", detalle: "8:00 a. m. a 12:00 p. m." },
  { id: "tarde", etiqueta: "En la tarde", detalle: "1:00 p. m. a 5:00 p. m." },
];

export function etiquetaBloque(bloque: BloqueHorario | undefined): string | null {
  return BLOQUES_HORARIOS.find((b) => b.id === bloque)?.etiqueta ?? null;
}

/** La dirección concatenada que ve el usuario, sin campos vacíos. */
export function concatenarDireccion(d: DireccionNueva): string {
  const casa = [d.casa, d.edificio, d.piso && `Piso ${d.piso}`, d.numero]
    .filter(Boolean)
    .join(", ");
  return [d.calle, casa, d.barrio, d.corregimiento, d.distrito, d.provincia]
    .filter(Boolean)
    .join(", ");
}

// ── Validaciones por etapa ──

export function validarConfiguracion(b: BorradorServicio): string[] {
  const errores: string[] = [];
  if (!cantidadValida(b.cantidad)) {
    errores.push(
      `Elige una cantidad entre ${CANTIDAD_MINIMA} y ${CANTIDAD_MAXIMA}.`,
    );
  }
  return errores;
}

/**
 * Se piden los once campos, en el mismo orden en que aparecen en pantalla,
 * para que el primer error que se muestra sea el del primer campo vacío.
 */
export function validarDireccionNueva(d: DireccionNueva): string[] {
  const errores: string[] = [];
  if (!d.alias.trim()) errores.push("Ponle un nombre a la dirección, por ejemplo, Casa.");
  if (!d.provincia.trim()) errores.push("Indica la provincia.");
  if (!d.distrito.trim()) errores.push("Indica el distrito.");
  if (!d.corregimiento.trim()) errores.push("Indica el corregimiento.");
  if (!d.barrio.trim()) errores.push("Indica el barrio o la barriada.");
  if (!d.calle.trim()) errores.push("Indica la calle.");
  if (!d.casa.trim()) errores.push("Indica la casa o el edificio.");
  if (!d.edificio.trim()) errores.push("Indica el nombre del edificio.");
  if (!d.piso.trim()) errores.push("Indica el piso.");
  if (!d.numero.trim()) errores.push("Indica el número de casa o apartamento.");
  if (!d.detalles.trim()) errores.push("Agrega los detalles que ayuden a llegar.");
  return errores;
}

export function validarDireccion(b: BorradorServicio): string[] {
  if (b.direccionId) return [];
  if (b.direccionNueva) return validarDireccionNueva(b.direccionNueva);
  return ["Elige una dirección para el servicio."];
}

/** El teléfono del contacto es obligatorio solo si se indicó un nombre. */
export function validarContacto(c: ContactoAlternativo | undefined): string[] {
  if (!c || (!c.nombre.trim() && !c.telefono.trim())) return [];
  const errores: string[] = [];
  if (c.nombre.trim() && !c.telefono.trim()) {
    errores.push("Agrega un teléfono para poder contactar a esa persona.");
  }
  if (!c.nombre.trim() && c.telefono.trim()) {
    errores.push("Agrega el nombre de quien recibirá el servicio.");
  }
  return errores;
}

/**
 * La fecha preferida debe ser desde mañana en adelante (la visita necesita
 * coordinación previa). `hoy` se inyecta para poder probar la regla.
 */
export function validarFecha(
  b: BorradorServicio,
  hoy: string,
): string[] {
  const errores: string[] = [];
  if (!b.fechaPreferida) {
    errores.push("Elige el día en que prefieres recibir la visita.");
  } else if (b.fechaPreferida <= hoy) {
    errores.push("Elige una fecha a partir de mañana.");
  }
  if (!b.bloque) {
    errores.push("Elige si prefieres la visita en la mañana o en la tarde.");
  }
  return errores;
}

export function listaParaConfirmar(b: BorradorServicio, hoy: string): boolean {
  return (
    validarConfiguracion(b).length === 0 &&
    validarDireccion(b).length === 0 &&
    validarContacto(b.contacto).length === 0 &&
    validarFecha(b, hoy).length === 0
  );
}

// ── Progreso del flujo (después del detalle y las preguntas del lugar) ──

export const ETAPAS = [
  "Configura el servicio",
  "Dirección",
  "Fecha preferida",
  "Revisa y confirma",
] as const;

export function progresoDeEtapa(etapa: 1 | 2 | 3 | 4): {
  texto: string;
  porcentaje: number;
} {
  return {
    texto: `Paso ${etapa} de ${ETAPAS.length}`,
    porcentaje: Math.round((etapa / ETAPAS.length) * 100),
  };
}
