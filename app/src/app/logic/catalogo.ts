// Catálogo de servicios: tipos, búsqueda y orden.
//
// Módulo puro (node --test). La búsqueda acepta términos cotidianos
// ("el aire no enfría", "tengo una fuga"): se tokeniza el término, se
// descartan palabras vacías y se compara contra nombre, categoría y
// palabras clave de cada servicio, sin distinguir mayúsculas ni acentos.

export interface ServicioCatalogo {
  id: string;
  nombre: string;
  categoria: string;
  /** Subcategoría de la jerarquía del catálogo (nivel 2 de navegación). */
  subcategoria?: string;
  /** SKU del PIM, cuando el artículo ya tiene código asignado. */
  sku?: string;
  /** Descripción confirmada; ausente = no se inventa texto. */
  descripcion?: string;
  incluye: string[];
  /** Palabras cotidianas que el cliente puede usar para llegar acá. */
  palabrasClave?: string[];
  /** Precio base en USD; ausente = el precio se confirma al cotizar. */
  precioDesde?: number;
  /** Unidad de cobro cuando el PIM la explicita (hoy, "m²"). */
  unidad?: string;
  /** true si el servicio puede requerir una inspección previa. */
  requiereInspeccion?: boolean;
  /** true si SIEMPRE se necesita una visita de evaluación (sin preguntas). */
  inspeccionObligatoria?: boolean;
  /** true si el precio depende de cotización aunque no haya inspección. */
  precioCotizable?: boolean;
  /** Costo de la visita de evaluación de ESTE servicio, si difiere del
   * general (mock configurable: el negocio aún no define montos por SKU). */
  costoEvaluacion?: number;
  /** true cuando precioDesde viene confirmado del PIM; false cuando cayó al
   * precio base referencial (PRECIO_BASE_REFERENCIAL_USD) porque el negocio
   * todavía no cargó el monto real de este SKU. Nunca se muestra en la UI:
   * es una marca interna para que negocio pueda auditar qué precios faltan
   * confirmar. */
  precioConfirmado?: boolean;
}

/**
 * Aviso de evaluación previa que corresponde a un servicio. UNA sola regla
 * para todas las pantallas: el catálogo y el detalle decían lo mismo por
 * duplicado y podían separarse con cualquier cambio.
 *
 * - "obligatoria": siempre hace falta una visita de evaluación.
 * - "puede": puede llegar a hacer falta, según cómo esté el lugar.
 * - "no": no aplica.
 */
export type AvisoEvaluacion = "obligatoria" | "puede" | "no";

export function avisoEvaluacion(s: {
  requiereInspeccion?: boolean;
  inspeccionObligatoria?: boolean;
}): AvisoEvaluacion {
  if (s.inspeccionObligatoria) return "obligatoria";
  if (s.requiereInspeccion) return "puede";
  return "no";
}

/**
 * Precio base cuando el PIM todavía no confirmó un monto para el SKU. Todos
 * los servicios deben mostrar un precio (criterio de negocio: ningún SKU
 * muestra "Precio a cotizar"); este valor es un placeholder redondo y
 * fácil de identificar, no una estimación real. Reemplazar por el precio
 * real cuando el negocio lo confirme (ver `precioConfirmado`).
 */
export const PRECIO_BASE_REFERENCIAL_USD = 99;

/** Taxonomía final de categorías (orden oficial de producto). */
export const TAXONOMIA = [
  "Instalación",
  "Mantenimiento",
  "Reparación",
  "Fumigación",
  "Limpieza",
  "Pintura",
  "Mobiliario",
  "Jardinería",
  "Mudanza",
] as const;

/**
 * Presentación del precio según la regla de producto: "Desde $X" cuando el
 * servicio puede requerir inspección o cotización; precio directo cuando
 * no. Todos los SKUs tienen precio base (ningún servicio muestra "Precio a
 * cotizar"): si el PIM todavía no confirmó un monto, se usa el precio base
 * referencial (PRECIO_BASE_REFERENCIAL_USD). Esta regla no varía según la
 * pantalla: catálogo, listado, detalle, configuración, revisión y
 * confirmación llaman siempre a esta función.
 */
export function presentarPrecio(s: ServicioCatalogo): string {
  // SIEMPRE "Desde": el monto es de referencia y la cotización final puede
  // variar, así que decir "$90" a secas promete un precio cerrado. Vale
  // para todas las pantallas que muestran precio, no solo el Home: es la
  // misma función y el texto no puede cambiar según dónde se lea.
  const unidad = s.unidad ? ` por ${s.unidad}` : "";
  const monto = formatearMonto(s.precioDesde ?? PRECIO_BASE_REFERENCIAL_USD);
  return `Desde $${monto}${unidad}`;
}

/** Montos del PIM: enteros sin decimales; con centavos, siempre dos. */
export function formatearMonto(monto: number): string {
  return Number.isInteger(monto) ? String(monto) : monto.toFixed(2);
}

const VACIAS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "en",
  "mi", "mis", "tu", "tus", "su", "sus", "no", "si", "se", "me", "que", "y",
  "o", "a", "al", "con", "por", "para", "hay", "esta", "este", "esto",
  "tengo", "necesito", "quiero", "revisar", "ayuda",
]);

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function tokens(termino: string): string[] {
  return normalizar(termino)
    .split(/[^a-z0-9ñ]+/)
    .filter((t) => t.length >= 3 && !VACIAS.has(t));
}

/**
 * Filtra por término cotidiano. Término vacío (o solo palabras vacías)
 * devuelve todo el catálogo. Un servicio coincide si alguna palabra del
 * término aparece en su nombre, su categoría o sus palabras clave.
 */
export function filtrarCatalogo<T extends ServicioCatalogo>(
  servicios: readonly T[],
  termino: string,
): T[] {
  const palabras = tokens(termino);
  if (palabras.length === 0) {
    // Si escribió algo pero solo palabras vacías, no hay coincidencias
    // reales; si no escribió nada, se muestra todo.
    return normalizar(termino).trim() === "" ? [...servicios] : [];
  }
  return servicios.filter((s) => {
    const texto = normalizar(
      `${s.nombre} ${s.categoria} ${s.subcategoria ?? ""} ${s.sku ?? ""} ${(s.palabrasClave ?? []).join(" ")}`,
    );
    return palabras.some((p) => texto.includes(p));
  });
}

/** HU-01: el catálogo completo se ordena alfabéticamente por nombre. */
export function ordenarAlfabeticamente<T extends ServicioCatalogo>(
  servicios: readonly T[],
): T[] {
  return [...servicios].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

/**
 * Categorías en orden de aparición en el catálogo, sin repetidos.
 * Alimenta los chips de filtro del listado.
 */
export function listarCategorias(
  servicios: readonly ServicioCatalogo[],
): string[] {
  const presentes = new Set(servicios.map((s) => s.categoria));
  const oficiales = TAXONOMIA.filter((c) => presentes.has(c));
  const extras = [...presentes].filter((c) => !(TAXONOMIA as readonly string[]).includes(c));
  return [...oficiales, ...extras];
}

/** Filtra por categoría exacta; null = todas. */
export function filtrarPorCategoria<T extends ServicioCatalogo>(
  servicios: readonly T[],
  categoria: string | null,
): T[] {
  if (categoria === null) return [...servicios];
  return servicios.filter((s) => s.categoria === categoria);
}

/**
 * Agrupa los servicios por categoría, en el orden de aparición de las
 * categorías. Dentro de cada grupo se conserva el orden recibido.
 */
export function agruparPorCategoria<T extends ServicioCatalogo>(
  servicios: readonly T[],
): { categoria: string; servicios: T[] }[] {
  return listarCategorias(servicios).map((categoria) => ({
    categoria,
    servicios: servicios.filter((s) => s.categoria === categoria),
  }));
}

/** Precio con el prefijo del requerimiento: "Desde $175". */
export function textoPrecioDesde(precio: number | undefined): string | null {
  if (precio === undefined) return null;
  return `Desde $${precio}`;
}

/**
 * Valida la configuración de destacados del Home: entre 4 y 6, sin
 * repetidos y todos existentes en el catálogo.
 */
export function validarDestacados(
  ids: readonly string[],
  catalogo: readonly ServicioCatalogo[],
): string[] {
  const errores: string[] = [];
  if (ids.length < 4 || ids.length > 6) {
    errores.push(`Los destacados deben ser entre 4 y 6 (hay ${ids.length}).`);
  }
  if (new Set(ids).size !== ids.length) errores.push("Hay destacados repetidos.");
  for (const id of ids) {
    if (!catalogo.some((s) => s.id === id)) {
      errores.push(`El destacado "${id}" no existe en el catálogo.`);
    }
  }
  return errores;
}
