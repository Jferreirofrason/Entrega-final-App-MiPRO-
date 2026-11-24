// Mis productos: lo que la persona compró y lo que cargó a mano.
//
// Módulo puro (node --test). Sin DOM, sin storage y sin red.
//
// UNA SOLA LISTA. Para la persona "mis productos" son sus productos, venga
// el dato de una compra de Novey, Cochez o Kohler o lo haya cargado ella.
// Lo que cambia es QUÉ SE SABE de cada uno, y eso se dice en la ficha:
//
//   source: "purchase"  trae tienda, fecha, factura, ticket y SKU
//   source: "manual"    trae lo que la persona escribió, y nada más
//
// De ahí sale la regla que atraviesa todo el archivo: de un producto
// cargado a mano NO se inventa una tienda, una factura, un ticket ni una
// fecha de compra. Si el flujo de garantía los necesita, se los pide.
//
// ⚠️ TODAVÍA NO HAY INTEGRACIÓN DE COMPRAS. Los productos comprados salen
// de fixtures (data/compras.ts) con la forma que tendría la fuente real.
// El día que exista el endpoint se reemplaza solo la carga:
//   ENDPOINT: GET /api/productos   → ProductoPropio[]
//
// Lo que el negocio todavía no definió está en PENDIENTE_DE_LAS_COMPRAS, al
// final del archivo: no se inventan reglas de vigencia ni de elegibilidad.

import type { ProductoSolicitud } from "./solicitudGarantia.ts";
import { formatearFechaDiaMesAnio } from "./fechas.ts";

/** Las tiendas del grupo que pueden originar una compra. */
export type TiendaDeCompra = "Novey" | "Cochez" | "Kohler";

export const TIENDAS: readonly TiendaDeCompra[] = ["Novey", "Cochez", "Kohler"];

/** De dónde salió el producto. */
export type OrigenProducto = "purchase" | "manual";

/**
 * Un producto de la persona.
 *
 * Los campos de compra son OPCIONALES a propósito: un producto cargado a
 * mano no los tiene, y marcarlos obligatorios obligaría a rellenarlos con
 * algo. El tipo es el que impide inventar.
 *
 * `purchaseDate` va en ISO (solo día) y se formatea al mostrarlo: guardar
 * el texto ya armado haría imposible filtrar y ordenar por fecha.
 *
 * `invoiceNumber` y `ticketNumber` NO se muestran en el listado, pero
 * viajan en el objeto: son los datos que el flujo de garantía pide y que la
 * persona no tendría que volver a escribir.
 */
export interface ProductoPropio {
  id: string;
  source: OrigenProducto;
  name: string;
  /** Sin foto, la ficha usa el respaldo: nunca se estira un asset pobre. */
  image?: string;
  /** Solo las compras tienen SKU. */
  sku?: string;
  store?: TiendaDeCompra;
  /** Fecha de compra en ISO (yyyy-mm-dd); solo las compras la tienen. */
  purchaseDate?: string;
  invoiceNumber?: string;
  ticketNumber?: string;
  brand?: string;
  category?: string;
  /** Modelo, cuando la persona lo cargó. */
  modelo?: string;
  /** Número de serie, cuando la persona lo cargó. */
  serialNumber?: string;
  /** Cuándo se agregó a mano, en ISO: ordena junto a las compras. */
  addedAt?: string;
  /**
   * Lo que la persona escribió como comercio al cargar el producto a mano.
   *
   * NO se muestra en el listado y NO entra en los chips de tienda: es texto
   * libre, no una compra registrada. Sirve para precargar el formulario de
   * garantía cuando coincide con un comercio conocido, y nada más.
   */
  comercioDeclarado?: string;
  /** true cuando el producto admite instalación, mantenimiento o reparación. */
  serviceEligible: boolean;
  /** Ids de servicios del catálogo compatibles con este producto. */
  eligibleServiceIds?: string[];
  /** false deja el producto sin la acción de garantía. */
  warrantyEligible?: boolean;
}

/**
 * El recorte de la lista: UN solo estado para todas las dimensiones.
 *
 * Primero fueron dos filas de chips, una por dimensión, y quedaban dos
 * "todo" encendidos a la vez sin que se entendiera cuál mandaba. La salida
 * no es elegir una dimensión y tirar el resto: es que haya un solo estado,
 * que la pantalla lo muestre entero (un chip por filtro puesto, y nada
 * cuando no hay ninguno) y que el detalle se elija en un solo lugar.
 *
 * Una lista vacía significa "sin recorte": NO es lo mismo que una lista con
 * las tres tiendas. Por eso no hay un valor "todas" en ningún lado; no
 * tener filtro es no tener filtro.
 */
export interface FiltrosDeProductos {
  origen: "todos" | OrigenProducto;
  /** Vacío: todas las tiendas. */
  tiendas: TiendaDeCompra[];
  /** Vacío: todas las categorías. */
  categorias: string[];
  /** Vacío: todos los años. Solo recorta compras, que son las que tienen fecha. */
  anios: number[];
}

export const SIN_FILTROS: FiltrosDeProductos = {
  origen: "todos",
  tiendas: [],
  categorias: [],
  anios: [],
};

export function esComprado(p: ProductoPropio): boolean {
  return p.source === "purchase";
}

export function esManual(p: ProductoPropio): boolean {
  return p.source === "manual";
}

/** Si hay algo cargado a mano. Sin esto, el filtro de procedencia no se dibuja. */
export function hayManuales(productos: readonly ProductoPropio[]): boolean {
  return productos.some(esManual);
}

/**
 * La fecha de compra como la pide el pedido: "12 oct. 2025".
 *
 * Delega en el formateador común (logic/fechas.ts): la fecha de compra de
 * un producto y la fecha de solicitud del historial tienen que verse
 * iguales, y para eso el formato se escribe UNA vez.
 */
export function formatearFechaDeCompra(iso: string | undefined): string | null {
  return formatearFechaDiaMesAnio(iso);
}

/** Si el producto ofrece la acción de servicio. */
export function puedeSolicitarServicio(p: ProductoPropio): boolean {
  return p.serviceEligible && (p.eligibleServiceIds?.length ?? 0) > 0;
}

/**
 * Si el producto ofrece la acción de garantía.
 *
 * La acción está en TODOS los productos; el campo `warrantyEligible` queda
 * como la llave para cuando el negocio defina qué producto no la tiene (una
 * vigencia vencida, por ejemplo). Mientras no venga en false, la acción
 * está, también en los cargados a mano: que falten datos no es motivo para
 * esconder la puerta, se piden en el formulario.
 */
export function puedeSolicitarGarantia(p: ProductoPropio): boolean {
  return p.warrantyEligible !== false;
}

/**
 * Busca por nombre y por SKU, que es lo que dice el placeholder.
 *
 * Sin acentos y sin distinguir mayúsculas: nadie escribe "Refrigeradora"
 * con acento correcto en un buscador. La marca y la categoría también
 * entran, porque escribir "Panasonic" y no encontrar nada se lee como una
 * falla.
 */
export function buscarProductos(
  productos: readonly ProductoPropio[],
  termino: string,
): ProductoPropio[] {
  const t = normalizar(termino);
  if (t === "") return [...productos];
  return productos.filter((p) =>
    [p.name, p.sku ?? "", p.brand ?? "", p.category ?? ""].some((campo) =>
      normalizar(campo).includes(t),
    ),
  );
}

function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** El año de compra, para el recorte por año. */
export function anioDeCompra(p: ProductoPropio): number | null {
  const iso = p.purchaseDate;
  if (!iso) return null;
  const anio = Number(iso.slice(0, 4));
  return Number.isInteger(anio) && anio > 1900 ? anio : null;
}

/**
 * El recorte de la lista.
 *
 * Un producto cargado a mano no tiene tienda, así que ningún recorte por
 * tienda lo muestra: lo que escribió la persona en "comercio" no es una
 * compra registrada en Novey, Cochez ni Kohler. Lo mismo con el año: sin
 * fecha de compra no hay año, y por eso un recorte por año lo deja afuera.
 */
export function aplicarFiltros(
  productos: readonly ProductoPropio[],
  filtros: FiltrosDeProductos,
): ProductoPropio[] {
  return productos.filter((p) => {
    if (filtros.origen !== "todos" && p.source !== filtros.origen) return false;
    if (filtros.tiendas.length > 0 && (!p.store || !filtros.tiendas.includes(p.store))) {
      return false;
    }
    if (filtros.categorias.length > 0 && (!p.category || !filtros.categorias.includes(p.category))) {
      return false;
    }
    if (filtros.anios.length > 0) {
      const anio = anioDeCompra(p);
      if (anio === null || !filtros.anios.includes(anio)) return false;
    }
    return true;
  });
}

export function hayFiltros(filtros: FiltrosDeProductos): boolean {
  return (
    filtros.origen !== "todos" ||
    filtros.tiendas.length > 0 ||
    filtros.categorias.length > 0 ||
    filtros.anios.length > 0
  );
}

/** Cuántos recortes hay puestos: es el número que lleva el ícono. */
export function cuantosFiltros(filtros: FiltrosDeProductos): number {
  return (
    (filtros.origen === "todos" ? 0 : 1) +
    filtros.tiendas.length +
    filtros.categorias.length +
    filtros.anios.length
  );
}

/**
 * Las opciones que tiene sentido ofrecer, sacadas de los datos.
 *
 * No salen de una constante: una opción que siempre devuelve vacío es una
 * promesa rota. La procedencia solo se ofrece cuando conviven las dos, que
 * es cuando separa algo.
 */
export interface OpcionesDeFiltro {
  conProcedencia: boolean;
  tiendas: TiendaDeCompra[];
  categorias: string[];
  anios: number[];
}

export function opcionesDeFiltro(
  productos: readonly ProductoPropio[],
): OpcionesDeFiltro {
  const cuenta = cuantosPorTienda(productos);
  const categorias = [...new Set(productos.map((p) => p.category).filter((c): c is string => Boolean(c)))];
  const anios = [...new Set(productos.map(anioDeCompra).filter((a): a is number => a !== null))];
  return {
    conProcedencia: hayManuales(productos) && productos.some(esComprado),
    tiendas: TIENDAS.filter((t) => cuenta[t] > 0),
    categorias: categorias.sort((a, b) => a.localeCompare(b, "es")),
    anios: anios.sort((a, b) => b - a),
  };
}

/** Un filtro puesto, como se ve en la fila de chips y como se quita. */
export type FiltroPuesto =
  | { tipo: "origen"; valor: OrigenProducto }
  | { tipo: "tienda"; valor: TiendaDeCompra }
  | { tipo: "categoria"; valor: string }
  | { tipo: "anio"; valor: number };

/** Los filtros puestos, en el orden en que se leen. */
export function filtrosPuestos(filtros: FiltrosDeProductos): FiltroPuesto[] {
  const puestos: FiltroPuesto[] = [];
  if (filtros.origen !== "todos") puestos.push({ tipo: "origen", valor: filtros.origen });
  for (const t of filtros.tiendas) puestos.push({ tipo: "tienda", valor: t });
  for (const c of filtros.categorias) puestos.push({ tipo: "categoria", valor: c });
  for (const a of filtros.anios) puestos.push({ tipo: "anio", valor: a });
  return puestos;
}

/** Saca UN filtro, el de su chip. Devuelve un estado nuevo. */
export function quitarFiltro(
  filtros: FiltrosDeProductos,
  puesto: FiltroPuesto,
): FiltrosDeProductos {
  switch (puesto.tipo) {
    case "origen":
      return { ...filtros, origen: "todos" };
    case "tienda":
      return { ...filtros, tiendas: filtros.tiendas.filter((t) => t !== puesto.valor) };
    case "categoria":
      return { ...filtros, categorias: filtros.categorias.filter((c) => c !== puesto.valor) };
    case "anio":
      return { ...filtros, anios: filtros.anios.filter((a) => a !== puesto.valor) };
  }
}

/** Pone o saca un valor de una lista de filtro. */
export function alternar<T>(lista: readonly T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

/**
 * La fecha con la que ordena cada producto.
 *
 * Para una compra es la fecha de compra; para uno cargado a mano, cuándo se
 * agregó. No son lo mismo y la ficha no las confunde, pero las dos
 * contestan "qué tan reciente es esto" y por eso ordenan juntas.
 */
export function fechaDeOrden(p: ProductoPropio): string {
  return p.purchaseDate ?? p.addedAt ?? "";
}

/** Lo más reciente arriba: es el orden en que se busca un producto. */
export function ordenarPorFecha(
  productos: readonly ProductoPropio[],
): ProductoPropio[] {
  return [...productos].sort((a, b) => fechaDeOrden(b).localeCompare(fechaDeOrden(a)));
}

/** El listado tal como se muestra: filtros, búsqueda y orden, en ese orden. */
export function listarMisProductos(
  productos: readonly ProductoPropio[],
  filtros: FiltrosDeProductos,
  termino: string,
): ProductoPropio[] {
  return ordenarPorFecha(buscarProductos(aplicarFiltros(productos, filtros), termino));
}

/** Cuántos hay por tienda. */
export function cuantosPorTienda(
  productos: readonly ProductoPropio[],
): Record<TiendaDeCompra, number> {
  const cuenta: Record<TiendaDeCompra, number> = { Novey: 0, Cochez: 0, Kohler: 0 };
  for (const p of productos) if (p.store) cuenta[p.store] += 1;
  return cuenta;
}

// ── Lo que el flujo de garantía necesita de un producto ──

/**
 * Los datos de compra que el paso 1 de la garantía pide como obligatorios.
 *
 * El orden es el del formulario, para que el aviso nombre lo que falta en
 * el mismo orden en que se ve en pantalla.
 */
export const DATOS_DE_COMPRA_OBLIGATORIOS = [
  "invoiceNumber",
  "purchaseDate",
  "store",
  "brand",
  "sku",
] as const;

export type DatoDeCompra = (typeof DATOS_DE_COMPRA_OBLIGATORIOS)[number];

/**
 * Qué datos obligatorios no trae este producto.
 *
 * Una lista vacía significa que la persona no tiene que escribir nada de la
 * compra. Si falta algo, el flujo precarga lo que hay y lo dice: nunca se
 * completa un dato inventado para que el formulario pase. Un producto
 * cargado a mano casi siempre cae acá, y está bien: se le piden.
 */
export function datosDeCompraQueFaltan(p: ProductoPropio): DatoDeCompra[] {
  return DATOS_DE_COMPRA_OBLIGATORIOS.filter((dato) => {
    const valor = p[dato];
    return typeof valor !== "string" || valor.trim() === "";
  });
}

export function compraCompleta(p: ProductoPropio): boolean {
  return datosDeCompraQueFaltan(p).length === 0;
}

/**
 * La categoría del producto, dicha con las palabras del formulario.
 *
 * Son DOS listas distintas: la taxonomía del catálogo habla en plural
 * ("Aires acondicionados") y el formulario de garantía pide un tipo de
 * producto en singular ("Aire acondicionado"). Esta tabla es un puente
 * PROVISIONAL para que el campo llegue con una opción válida de la lista y
 * no con un texto que no figura en el desplegable.
 *
 * PENDIENTE: la correspondencia definitiva entre categorías de producto y
 * tipos del formulario la define el negocio. Lo que no está acá se deja
 * como viene: antes un valor fuera de lista que uno inventado.
 */
const TIPO_DE_GARANTIA_POR_CATEGORIA: Record<string, string> = {
  "Aires acondicionados": "Aire acondicionado",
  "Aire Acondicionado": "Aire acondicionado",
  "Calentadores": "Calentador",
  "Lavadoras": "Lavadora",
  "Secadoras": "Secadora",
  "Refrigeradoras": "Refrigeradora",
  "Estufas": "Estufa",
  // Sin equivalente en la lista del formulario: "Otro" es la opción honesta.
  "Grifería": "Otro",
  "Colchones": "Otro",
};

export function tipoDeGarantia(categoria: string | undefined): string | undefined {
  if (!categoria) return undefined;
  return TIPO_DE_GARANTIA_POR_CATEGORIA[categoria] ?? categoria;
}

/** Los comercios que el formulario de garantía ofrece como opción. */
const COMERCIOS_DEL_FORMULARIO = ["Novey", "Cochez"];

/**
 * El comercio que se puede precargar en el formulario.
 *
 * De una compra sale la tienda, que es un dato registrado. De un producto
 * cargado a mano sale lo que la persona escribió, y SOLO si coincide con
 * una opción del formulario: un "Desconocida" o un comercio que no está en
 * la lista se deja vacío para que lo elija ella.
 */
export function comercioParaGarantia(p: ProductoPropio): string | undefined {
  if (p.store) return p.store;
  const declarado = p.comercioDeclarado?.trim();
  return declarado && COMERCIOS_DEL_FORMULARIO.includes(declarado) ? declarado : undefined;
}

/**
 * El producto, con la forma que pide el paso 1 de la garantía.
 *
 * `registradoId` se manda SOLO cuando es una compra: ese campo le dice a
 * `validarPaso1` que los datos ya están y que no hace falta pedir nada. Un
 * producto cargado a mano no puede usarlo, porque justamente le faltan
 * datos: se precarga lo que hay y el formulario pide el resto.
 *
 * `compraOriginal` guarda lo que trajo la compra: si la persona corrige un
 * dato en el formulario, el valor de origen sigue viajando en el payload y
 * quien atienda el caso puede ver la diferencia.
 */
export function productoSolicitudDesdeCompra(p: ProductoPropio): ProductoSolicitud {
  const comprado = esComprado(p);
  return {
    registradoId: comprado ? p.id : undefined,
    nombre: p.name,
    alias: p.name,
    numeroFactura: p.invoiceNumber,
    fechaCompra: p.purchaseDate,
    comercio: comercioParaGarantia(p),
    marca: p.brand,
    tipo: tipoDeGarantia(p.category),
    codigoProducto: p.sku,
    serie: p.serialNumber,
    compraOriginal:
      comprado && p.sku && p.store && p.purchaseDate && p.invoiceNumber
        ? {
            productoId: p.id,
            sku: p.sku,
            tienda: p.store,
            fechaCompra: p.purchaseDate,
            numeroFactura: p.invoiceNumber,
            numeroTicket: p.ticketNumber,
            marca: p.brand,
          }
        : undefined,
  };
}

/** El contexto de producto que viaja en el borrador de un servicio. */
export interface ContextoDeCompra {
  productoId: string;
  origen: OrigenProducto;
  nombre: string;
  /** Solo las compras lo tienen. */
  sku?: string;
  tienda?: TiendaDeCompra;
  marca?: string;
  categoria?: string;
  fechaCompra?: string;
}

export function contextoDeCompra(p: ProductoPropio): ContextoDeCompra {
  return {
    productoId: p.id,
    origen: p.source,
    nombre: p.name,
    sku: p.sku,
    tienda: p.store,
    marca: p.brand,
    categoria: p.category,
    fechaCompra: p.purchaseDate,
  };
}

/**
 * El servicio con el que arranca el flujo, cuando hay uno solo.
 *
 * Con varios compatibles devuelve null: la persona elige, la app no decide
 * por ella cuál de dos servicios distintos necesita.
 */
export function servicioCompatibleUnico(p: ProductoPropio): string | null {
  const ids = p.eligibleServiceIds ?? [];
  return ids.length === 1 ? ids[0] : null;
}

// ── Editar un producto cargado a mano ──
//
// Solo se editan los productos que cargó la persona. De una COMPRA no se
// edita nada: esos datos vienen del comercio y, si estuvieran mal, el
// arreglo no es que la app los pise, es que se corrija en el origen. Por
// eso `puedeEditarse` mira la procedencia y no los permisos.

export function puedeEditarse(p: ProductoPropio): boolean {
  return esManual(p);
}

/** Lo que la persona puede corregir de un producto que cargó. */
export interface EdicionManual {
  name: string;
  brand: string;
  category: string;
  modelo: string;
  serialNumber: string;
}

export function edicionDesdeProducto(p: ProductoPropio): EdicionManual {
  return {
    name: p.name,
    brand: p.brand ?? "",
    category: p.category ?? "",
    modelo: p.modelo ?? "",
    serialNumber: p.serialNumber ?? "",
  };
}

/**
 * Qué falta para poder guardar.
 *
 * Solo el nombre es obligatorio: es lo único con lo que la persona va a
 * reconocer el producto en la lista. Pedirle marca, modelo y serie para
 * dejarlo corregir el nombre sería inventar requisitos sobre datos que
 * justamente puede no tener.
 */
export function validarEdicionManual(edicion: EdicionManual): string[] {
  const errores: string[] = [];
  if (edicion.name.trim() === "") {
    errores.push("Ponle un nombre al producto para reconocerlo.");
  }
  return errores;
}

/** El producto con la edición aplicada. Un campo vacío borra el dato. */
export function aplicarEdicion(
  p: ProductoPropio,
  edicion: EdicionManual,
): ProductoPropio {
  const limpio = (v: string) => (v.trim() === "" ? undefined : v.trim());
  return {
    ...p,
    name: edicion.name.trim(),
    brand: limpio(edicion.brand),
    category: limpio(edicion.category),
    modelo: limpio(edicion.modelo),
    serialNumber: limpio(edicion.serialNumber),
  };
}

/**
 * Lo que falta definir para que esto deje de ser una demostración.
 */
export const PENDIENTE_DE_LAS_COMPRAS = [
  "De dónde salen las compras: PIM, Oracle o la fuente que se defina",
  "Cómo se asocia una compra a una cuenta (cédula, factura, teléfono)",
  "Qué pasa con una devolución o una compra cancelada",
  "El criterio de vigencia de la garantía por categoría de producto",
  "Quién define qué servicios son compatibles con cada producto",
  "Si un producto cargado a mano se puede vincular después con su compra",
] as const;
