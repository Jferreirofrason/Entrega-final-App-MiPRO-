// Mis productos: las compras de la cuenta y lo cargado a mano.
//
// ⚠️ NO HAY INTEGRACIÓN DE COMPRAS. Estos productos son fixtures con la
// forma que tendría la fuente real; ninguno corresponde a una compra
// verificada. Los SKU, las facturas y los tickets son de prueba.
//
// Cuando exista el endpoint, se reemplaza `cargarCompras` y las pantallas
// no se enteran:
//   ENDPOINT: GET /api/compras   → ProductoComprado[]
//
// Las fotos son de Unsplash (igual que el catálogo de servicios): sirven
// para ver el listado con imágenes reales mientras el PIM no cargue las
// propias. Los `eligibleServiceIds` apuntan a ids que EXISTEN en el
// catálogo de la app (data/catalogo.ts), así el flujo de servicio abre un
// servicio de verdad y no una pantalla vacía.
//
// ESCENARIOS DE DEMO (vía query del hash):
//   #/mis-productos?compras=error | cargando | vacio

import type { EdicionManual, ProductoPropio } from "../logic/compras";
import { aplicarEdicion } from "../logic/compras";
import { PRODUCTS_DB } from "./products";

export type EscenarioCompras = "ok" | "error" | "cargando" | "vacio";

const LATENCIA_MS = 350;

export const COMPRAS_DEMO: ProductoPropio[] = [
  // Novey, con garantía y con servicio: el caso completo.
  {
    id: "compra-aire-novey",
    source: "purchase",
    name: "Aire acondicionado Panasonic 12,000 BTU Inverter",
    sku: "NOV-412938",
    image:
      "https://images.unsplash.com/photo-1718203862467-c33159fdc504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    store: "Novey",
    purchaseDate: "2025-10-12",
    invoiceNumber: "FAC-2025-884512",
    ticketNumber: "TK-77219",
    brand: "Panasonic",
    category: "Aires acondicionados",
    serviceEligible: true,
    eligibleServiceIds: ["mantenimiento-aire", "instalacion-aire"],
    warrantyEligible: true,
  },
  // Cochez, con garantía y con servicio, un solo servicio compatible: el
  // flujo arranca directo, sin preguntar cuál.
  {
    id: "compra-calentador-cochez",
    source: "purchase",
    name: "Calentador de agua a gas Rheem 30 galones",
    sku: "COC-220871",
    // SIN FOTO a propósito: la única disponible muestra cañerías y a
    // 72 px no se reconoce el producto. Mejor el respaldo que un recorte
    // confuso; la foto definitiva la carga el PIM.
    store: "Cochez",
    purchaseDate: "2025-08-03",
    invoiceNumber: "FAC-2025-771240",
    brand: "Rheem",
    category: "Calentadores",
    serviceEligible: true,
    eligibleServiceIds: ["instalacion-calentador-gas"],
    warrantyEligible: true,
  },
  // Kohler, solo garantía: la grifería no tiene servicio en el catálogo.
  {
    id: "compra-griferia-kohler",
    source: "purchase",
    name: "Grifería monomando para lavamanos Kohler",
    sku: "KOH-100482",
    // SIN FOTO a propósito: la única disponible muestra un baño entero y a
    // 72 px no se reconoce el producto. Mejor el respaldo que un recorte
    // confuso; la foto definitiva la carga el PIM.
    store: "Kohler",
    purchaseDate: "2025-06-21",
    invoiceNumber: "FAC-2025-660193",
    ticketNumber: "TK-51804",
    brand: "Kohler",
    category: "Grifería",
    serviceEligible: false,
    warrantyEligible: true,
  },
  // Novey, sin servicio elegible: un colchón no se instala ni se mantiene.
  {
    id: "compra-colchon-novey",
    source: "purchase",
    name: "Colchón Queen Spring Air resorte individual",
    sku: "NOV-503117",
    // SIN FOTO a propósito: la única disponible muestra una habitación y a
    // 72 px no se reconoce el producto. Mejor el respaldo que un recorte
    // confuso; la foto definitiva la carga el PIM.
    store: "Novey",
    purchaseDate: "2025-03-09",
    invoiceNumber: "FAC-2025-512668",
    brand: "Spring Air",
    category: "Colchones",
    serviceEligible: false,
    warrantyEligible: true,
  },
  // Cochez, con servicio: dos compatibles, así se ve la elección.
  {
    id: "compra-lavadora-cochez",
    source: "purchase",
    name: "Lavadora Whirlpool carga superior 18 kg",
    sku: "COC-318045",
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    store: "Cochez",
    purchaseDate: "2024-11-28",
    invoiceNumber: "FAC-2024-447902",
    ticketNumber: "TK-33916",
    brand: "Whirlpool",
    category: "Lavadoras",
    serviceEligible: true,
    eligibleServiceIds: ["instalacion-lavadora", "revision-plomeria"],
    warrantyEligible: true,
  },
  // Compra vieja, sin ticket: sirve para ver el filtro por fecha y el
  // formato del año anterior.
  {
    id: "compra-refrigeradora-novey",
    source: "purchase",
    name: "Refrigeradora Samsung French Door 22 pies",
    sku: "NOV-287654",
    // SIN FOTO a propósito: la única disponible muestra un ambiente y a
    // 72 px no se reconoce el producto. Mejor el respaldo que un recorte
    // confuso; la foto definitiva la carga el PIM.
    store: "Novey",
    purchaseDate: "2024-05-17",
    invoiceNumber: "FAC-2024-301558",
    brand: "Samsung",
    category: "Refrigeradoras",
    serviceEligible: true,
    eligibleServiceIds: ["instalacion-refrigeradora-french"],
    warrantyEligible: true,
  },
];

// ── Los productos cargados a mano ──
//
// NO son una fuente nueva: son los mismos que ya vivían en la pantalla de
// productos agregados (data/products.ts y el último alta guardada por el
// formulario). Se adaptan a la forma común para que convivan en una sola
// lista, SIN inventarles lo que no tienen: de un producto cargado a mano no
// salen tienda, factura, ticket ni fecha de compra.
//
//   ENDPOINT: GET /api/productos?origen=manual
//
// `purchaseDate` de data/products.ts es un texto ya formateado ("15 oct
// 2023"), no una fecha: por eso NO se usa como fecha de compra. Lo que la
// persona cargó sobre su compra se le vuelve a pedir en el formulario.

// ── Las correcciones de la persona ──
//
// Un producto cargado a mano se puede editar, y el prototipo no tiene dónde
// guardarlo: las correcciones viven en localStorage como un mapa
// id → campos corregidos, y se aplican encima del producto al leerlo. Así
// no se toca la semilla y la edición sobrevive a una recarga.
//   ENDPOINT: PATCH /api/productos/:id
const CLAVE_EDICIONES = "mipro-productos-editados";

type Ediciones = Record<string, EdicionManual>;

function leerEdiciones(): Ediciones {
  try {
    const crudo = localStorage.getItem(CLAVE_EDICIONES);
    return crudo ? (JSON.parse(crudo) as Ediciones) : {};
  } catch {
    return {};
  }
}

/** Guarda la corrección de UN producto, sin tocar las de los demás. */
export function guardarEdicionManual(id: string, edicion: EdicionManual): void {
  try {
    localStorage.setItem(
      CLAVE_EDICIONES,
      JSON.stringify({ ...leerEdiciones(), [id]: edicion }),
    );
  } catch {
    // Sin storage, la corrección vive hasta que se recargue la pantalla.
  }
}

function conEdicion(p: ProductoPropio): ProductoPropio {
  const edicion = leerEdiciones()[p.id];
  return edicion ? aplicarEdicion(p, edicion) : p;
}

/** El alta que guardó el formulario en esta sesión, si la hay. */
function ultimoAgregado(): ProductoPropio | null {
  try {
    const crudo = localStorage.getItem("lastAddedProduct");
    if (!crudo) return null;
    const p = JSON.parse(crudo) as {
      id?: number;
      name?: string;
      brand?: string;
      store?: string;
      category?: string;
      timestamp?: number;
    };
    if (!p?.name) return null;
    return {
      id: `manual-${p.id ?? p.timestamp ?? "nuevo"}`,
      source: "manual",
      name: p.name,
      brand: p.brand,
      category: p.category,
      comercioDeclarado: p.store,
      addedAt: p.timestamp ? new Date(p.timestamp).toISOString().slice(0, 10) : undefined,
      // Sin una definición de negocio, un producto cargado a mano no
      // declara servicios compatibles: la garantía sí, el servicio se pide
      // desde el catálogo como siempre.
      serviceEligible: false,
    };
  } catch {
    return null;
  }
}

/** Los productos cargados a mano que ya existían en la app. */
export function productosManuales(): ProductoPropio[] {
  const guardados: ProductoPropio[] = Object.values(PRODUCTS_DB).map((p) => ({
    id: `manual-${p.id}`,
    source: "manual",
    name: p.name,
    brand: p.brand,
    category: p.category,
    comercioDeclarado: p.store,
    serialNumber: p.serialNumber || undefined,
    // La fecha que guarda este modelo es un texto, no una fecha: no se usa
    // como fecha de compra ni se muestra como tal.
    addedAt: undefined,
    serviceEligible: false,
  }));
  const nuevo = ultimoAgregado();
  // El alta de esta sesión va primero y no duplica a uno ya guardado.
  const todos =
    nuevo && !guardados.some((g) => g.id === nuevo.id)
      ? [nuevo, ...guardados]
      : guardados;
  // Las correcciones se aplican al leer: la semilla queda intacta.
  return todos.map(conEdicion);
}

export function leerEscenarioCompras(search: string): EscenarioCompras {
  const crudo = new URLSearchParams(search).get("compras");
  const validos: EscenarioCompras[] = ["error", "cargando", "vacio"];
  return (validos as string[]).includes(crudo ?? "") ? (crudo as EscenarioCompras) : "ok";
}

/**
 * Todo lo que la persona tiene: compras y cargados a mano, en una lista.
 *
 * Los manuales se leen en el momento (no son una constante) porque el
 * formulario de alta puede haber guardado uno hace un segundo.
 */
export function cargarMisProductos(
  escenario: EscenarioCompras,
): Promise<ProductoPropio[]> {
  return new Promise((resolve, reject) => {
    // "cargando" nunca resuelve: es para revisar los skeletons.
    if (escenario === "cargando") return;

    setTimeout(() => {
      if (escenario === "error") reject(new Error("No se pudieron cargar tus productos"));
      else if (escenario === "vacio") resolve([]);
      else resolve([...COMPRAS_DEMO, ...productosManuales()]);
    }, LATENCIA_MS);
  });
}

export function buscarProductoPorId(id: string): ProductoPropio | null {
  return [...COMPRAS_DEMO, ...productosManuales()].find((p) => p.id === id) ?? null;
}
