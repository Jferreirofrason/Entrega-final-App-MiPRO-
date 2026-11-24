// Reglas del carrusel de promociones del Home.
//
// Módulo puro para poder probarlo con node --test. El swipe físico lo maneja
// embla (ui/carousel); estas reglas cubren la configuración tipada y los
// límites de navegación que exige el requerimiento (carrusel no infinito).

export interface PromocionConfig {
  /** Identificador interno de la promoción. */
  id: string;
  /** URL o asset de la imagen. */
  imagen: string;
  /** Descripción accesible de la imagen (alt). */
  descripcion: string;
  /** Título visible. */
  titulo: string;
  /** Beneficio principal del banner (titular grande de la pieza). */
  beneficio: string;
  /** Texto secundario (hoy solo para la semántica accesible). */
  detalle: string;
  /**
   * Servicio o destino asociado (MIPRO-1472).
   * `null` = mapeo promoción a servicio PENDIENTE de confirmación del PO.
   */
  servicioDestino: string | null;
  /** Orden de aparición en el carrusel (menor = primero). */
  orden: number;
}

/** Ordena por `orden` sin mutar la configuración original. */
export function ordenarPromociones(
  promos: readonly PromocionConfig[],
): PromocionConfig[] {
  return [...promos].sort((a, b) => a.orden - b.orden);
}

/** Valida la configuración al cargarla: ids únicos y campos obligatorios. */
export function validarPromociones(promos: readonly PromocionConfig[]): string[] {
  const errores: string[] = [];
  const ids = new Set<string>();
  promos.forEach((p, i) => {
    if (!p.id) errores.push(`Promoción ${i}: falta id`);
    if (ids.has(p.id)) errores.push(`Promoción ${i}: id repetido (${p.id})`);
    ids.add(p.id);
    if (!p.imagen) errores.push(`Promoción ${p.id}: falta imagen`);
    if (!p.descripcion) errores.push(`Promoción ${p.id}: falta descripción accesible`);
    if (!p.titulo) errores.push(`Promoción ${p.id}: falta título`);
    if (!p.beneficio) errores.push(`Promoción ${p.id}: falta el beneficio del banner`);
  });
  return errores;
}

/** El carrusel no es infinito: en la última promoción no se puede avanzar. */
export function puedeAvanzar(indiceActual: number, total: number): boolean {
  return indiceActual < total - 1;
}

/** Desde cualquier posición posterior a la primera se puede volver. */
export function puedeRetroceder(indiceActual: number): boolean {
  return indiceActual > 0;
}

// ── Autoavance del carrusel de banners ─────────────────────────────────
//
// PROVISIONAL. En la reunión se mencionaron 4 y 5 segundos, sin cerrar
// ninguno de los dos. Este valor es el que usa la demostración y está acá,
// en un solo lugar, para poder cambiarlo sin tocar el componente.
export const INTERVALO_CARRUSEL_MS = 5000;

/**
 * Siguiente posición del autoavance. Al llegar a la última vuelve a la
 * primera: el autoavance sí da la vuelta (si se detuviera, dejaría de
 * avanzar solo a los pocos segundos y parecería roto). El arrastre manual
 * NO da la vuelta: ahí el final es el final.
 */
export function siguienteAutomatico(indiceActual: number, total: number): number {
  if (total <= 1) return 0;
  return (indiceActual + 1) % total;
}
