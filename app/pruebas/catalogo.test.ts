import { test } from "node:test";
import assert from "node:assert/strict";
import {
  agruparPorCategoria,
  filtrarCatalogo,
  filtrarPorCategoria,
  listarCategorias,
  ordenarAlfabeticamente,
  presentarPrecio,
  textoPrecioDesde,
  validarDestacados,
  PRECIO_BASE_REFERENCIAL_USD,
  type ServicioCatalogo,
} from "../src/app/logic/catalogo.ts";

function servicio(parcial: Partial<ServicioCatalogo> & { id: string; nombre: string }): ServicioCatalogo {
  return { categoria: "", descripcion: "", incluye: [], ...parcial };
}

const CATALOGO: ServicioCatalogo[] = [
  servicio({ id: "revision-electrica", nombre: "Revisión eléctrica", categoria: "Electricidad", palabrasClave: ["luz", "corriente", "electricidad"] }),
  servicio({ id: "pintura-interior", nombre: "Pintura interior", categoria: "Pintura", palabrasClave: ["pintar", "pared"] }),
  servicio({ id: "mantenimiento-aire", nombre: "Mantenimiento de aire acondicionado", categoria: "Aires acondicionados", palabrasClave: ["enfria", "clima"] }),
  servicio({ id: "revision-plomeria", nombre: "Revisión de plomería", categoria: "Plomería", palabrasClave: ["fuga", "gotea", "agua"] }),
];

// ── Búsqueda con términos cotidianos ─────────────────────────────────

test("término vacío devuelve todo el catálogo", () => {
  assert.equal(filtrarCatalogo(CATALOGO, "").length, 4);
});

test("frases cotidianas encuentran el servicio correcto", () => {
  assert.deepEqual(filtrarCatalogo(CATALOGO, "El aire no enfría").map((s) => s.id), ["mantenimiento-aire"]);
  assert.deepEqual(filtrarCatalogo(CATALOGO, "Necesito pintar").map((s) => s.id), ["pintura-interior"]);
  assert.deepEqual(filtrarCatalogo(CATALOGO, "Tengo una fuga").map((s) => s.id), ["revision-plomeria"]);
  assert.deepEqual(filtrarCatalogo(CATALOGO, "Revisar electricidad").map((s) => s.id), ["revision-electrica"]);
});

test("no distingue mayúsculas ni acentos", () => {
  assert.equal(filtrarCatalogo(CATALOGO, "ELÉCTRICA").length, 1);
  assert.equal(filtrarCatalogo(CATALOGO, "electrica").length, 1);
});

test("sin coincidencias devuelve vacío (la interfaz explica qué intentar)", () => {
  assert.equal(filtrarCatalogo(CATALOGO, "jardinería").length, 0);
});

// ── Orden y precio (HU-01) ───────────────────────────────────────────

test("el catálogo se ordena alfabéticamente por nombre", () => {
  const nombres = ordenarAlfabeticamente(CATALOGO).map((s) => s.nombre);
  assert.deepEqual(nombres, [
    "Mantenimiento de aire acondicionado",
    "Pintura interior",
    "Revisión de plomería",
    "Revisión eléctrica",
  ]);
});

test("el precio se presenta con el prefijo Desde y sin precio no se muestra nada", () => {
  assert.equal(textoPrecioDesde(175), "Desde $175");
  assert.equal(textoPrecioDesde(undefined), null);
});

// ── Destacados del Home ──────────────────────────────────────────────

test("una configuración válida de destacados no reporta errores", () => {
  assert.deepEqual(
    validarDestacados(["revision-electrica", "pintura-interior", "mantenimiento-aire", "revision-plomeria"], CATALOGO),
    [],
  );
});

test("destacados de menos, repetidos o inexistentes se reportan", () => {
  assert.ok(validarDestacados(["pintura-interior"], CATALOGO).length > 0);
  assert.ok(
    validarDestacados(["pintura-interior", "pintura-interior", "mantenimiento-aire", "revision-plomeria"], CATALOGO)
      .some((e) => e.includes("repetidos")),
  );
  assert.ok(
    validarDestacados(["no-existe", "pintura-interior", "mantenimiento-aire", "revision-plomeria"], CATALOGO)
      .some((e) => e.includes("no existe")),
  );
});

// ── Categorías del listado ───────────────────────────────────────────

test("las categorías oficiales van primero, en el orden de la taxonomía", () => {
  const conRepetida = [...CATALOGO, servicio({ id: "otro-electrico", nombre: "Otro", categoria: "Electricidad" })];
  // "Pintura" pertenece a la taxonomía oficial; las demás son legado y van
  // después, sin repetidos.
  assert.deepEqual(listarCategorias(conRepetida), ["Pintura", "Electricidad", "Aires acondicionados", "Plomería"]);
});

test("un catálogo con la taxonomía completa respeta su orden oficial", () => {
  const oficial = ["Mudanza", "Limpieza", "Instalación", "Fumigación"].map((c, i) =>
    servicio({ id: `s${i}`, nombre: `S${i}`, categoria: c }),
  );
  assert.deepEqual(listarCategorias(oficial), ["Instalación", "Fumigación", "Limpieza", "Mudanza"]);
});

test("filtrar por categoría deja solo esa categoría; null deja todo", () => {
  assert.deepEqual(filtrarPorCategoria(CATALOGO, "Pintura").map((s) => s.id), ["pintura-interior"]);
  assert.equal(filtrarPorCategoria(CATALOGO, null).length, 4);
  assert.equal(filtrarPorCategoria(CATALOGO, "No existe").length, 0);
});

test("agrupar por categoría conserva el orden y cubre todos los servicios", () => {
  const grupos = agruparPorCategoria(CATALOGO);
  assert.deepEqual(grupos.map((g) => g.categoria), ["Pintura", "Electricidad", "Aires acondicionados", "Plomería"]);
  assert.equal(grupos.reduce((n, g) => n + g.servicios.length, 0), CATALOGO.length);
});

test("la búsqueda y la categoría se combinan sin perder el filtro", () => {
  const porTermino = filtrarCatalogo(CATALOGO, "revisión");
  assert.deepEqual(filtrarPorCategoria(porTermino, "Plomería").map((s) => s.id), ["revision-plomeria"]);
});

// ── Presentación del precio ──────────────────────────────────────────

test("el precio SIEMPRE se presenta con \'Desde\', dependa o no de una inspección", () => {
  // El monto es de referencia: "$60" a secas promete un precio cerrado.
  assert.equal(presentarPrecio(servicio({ id: "f", nombre: "F", precioDesde: 60 })), "Desde $60");
  assert.equal(presentarPrecio(servicio({ id: "a", nombre: "A", precioDesde: 175, requiereInspeccion: true })), "Desde $175");
  assert.equal(presentarPrecio(servicio({ id: "m", nombre: "M", precioDesde: 120, precioCotizable: true })), "Desde $120");
});

test("ningún servicio muestra 'Precio a cotizar': sin monto del PIM, usa el precio base referencial", () => {
  assert.equal(
    presentarPrecio(servicio({ id: "r", nombre: "R", inspeccionObligatoria: true })),
    `Desde $${PRECIO_BASE_REFERENCIAL_USD}`,
  );
  assert.equal(presentarPrecio(servicio({ id: "x", nombre: "X" })), `Desde $${PRECIO_BASE_REFERENCIAL_USD}`);
});
