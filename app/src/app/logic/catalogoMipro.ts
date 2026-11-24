// Reglas de navegación de la jerarquía del catálogo (módulo puro, node --test).
//
// La navegación visible es Categoría → Subcategoría → Servicios/SKUs: el
// departamento ("MiPRO"/"Servicios") es capa de datos y nunca una pantalla.
// Regla de producto: cada categoría muestra COMO MÁXIMO 9 subcategorías; si
// la data trae más, las residuales se agrupan en una subcategoría "Otros…"
// (el PIM ya define "Otros servicios de instalación"; para el resto se usa
// el equivalente configurado abajo).

import type {
  CategoriaCatalogo,
  DepartamentoCatalogo,
  SubcategoriaCatalogo,
} from "../data/catalogoMipro.ts";

export const MAXIMO_SUBCATEGORIAS = 9;

/** Nombre del grupo residual por categoría (configurable por negocio). */
const NOMBRE_OTROS: Record<string, string> = {
  Instalación: "Otros tipos de instalación",
  Mobiliario: "Otros tipos de armado",
};

export function nombreOtros(categoria: string): string {
  return NOMBRE_OTROS[categoria] ?? "Otros servicios";
}

/**
 * Subcategorías que se muestran para una categoría: hasta 9. Con más de 9,
 * quedan las primeras 8 y las restantes se agrupan en una subcategoría
 * residual (sus artículos se concatenan en el orden original).
 */
export function subcategoriasVisibles(
  categoria: CategoriaCatalogo,
): SubcategoriaCatalogo[] {
  const subs = categoria.subcategorias;
  if (subs.length <= MAXIMO_SUBCATEGORIAS) return [...subs];
  const visibles = subs.slice(0, MAXIMO_SUBCATEGORIAS - 1);
  const residuales = subs.slice(MAXIMO_SUBCATEGORIAS - 1);
  return [
    ...visibles,
    {
      id: "otros",
      nombre: nombreOtros(categoria.nombre),
      articulos: residuales.flatMap((s) => s.articulos),
    },
  ];
}

export function categoriaDe(
  departamento: DepartamentoCatalogo,
  nombre: string,
): CategoriaCatalogo | null {
  return departamento.categorias.find((c) => c.nombre === nombre) ?? null;
}

/** Subcategoría por id, resolviendo también el grupo residual "otros". */
export function subcategoriaDe(
  categoria: CategoriaCatalogo,
  subId: string,
): SubcategoriaCatalogo | null {
  return subcategoriasVisibles(categoria).find((s) => s.id === subId) ?? null;
}

export function cantidadArticulos(categoria: CategoriaCatalogo): number {
  return categoria.subcategorias.reduce((n, s) => n + s.articulos.length, 0);
}

// ── Identidad de un artículo dentro de la app ──
// Un artículo vinculado a un servicio enriquecido conserva ese id (los
// borradores y cuestionarios existentes siguen funcionando); con SKU, el id
// deriva del código; sin ninguno, del nombre.

function slug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function idDeArticulo(articulo: {
  nombre: string;
  sku?: string;
  servicioId?: string;
}): string {
  if (articulo.servicioId) return articulo.servicioId;
  if (articulo.sku) return `sku-${articulo.sku.toLowerCase()}`;
  return `art-${slug(articulo.nombre)}`;
}
