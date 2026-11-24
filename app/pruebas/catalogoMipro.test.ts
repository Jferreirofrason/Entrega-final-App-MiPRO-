// Pruebas de la jerarquía real del catálogo y sus reglas de navegación:
// Categoría → Subcategoría → Artículo/SKU, tope de 9 subcategorías con
// grupo residual, matriz de evaluación y vínculos a cuestionarios.

import test from "node:test";
import assert from "node:assert/strict";
import { DEPARTAMENTO_MIPRO, type ArticuloCatalogo } from "../src/app/data/catalogoMipro.ts";
import {
  MAXIMO_SUBCATEGORIAS,
  cantidadArticulos,
  categoriaDe,
  idDeArticulo,
  subcategoriaDe,
  subcategoriasVisibles,
} from "../src/app/logic/catalogoMipro.ts";
import { cuestionarioDe } from "../src/app/data/cuestionarioLugar.ts";
import { presentarPrecio, PRECIO_BASE_REFERENCIAL_USD } from "../src/app/logic/catalogo.ts";

function todosLosArticulos(): { categoria: string; sub: string; articulo: ArticuloCatalogo }[] {
  return DEPARTAMENTO_MIPRO.categorias.flatMap((c) =>
    subcategoriasVisibles(c).flatMap((s) =>
      s.articulos.map((articulo) => ({ categoria: c.nombre, sub: s.nombre, articulo })),
    ),
  );
}

test("la taxonomía visible tiene las 9 categorías y el departamento no se navega", () => {
  const nombres = DEPARTAMENTO_MIPRO.categorias.map((c) => c.nombre);
  assert.deepEqual(nombres, [
    "Instalación",
    "Mantenimiento",
    "Reparación",
    "Fumigación",
    "Limpieza",
    "Pintura",
    "Mobiliario",
    "Jardinería",
    "Mudanza",
  ]);
  // "MiPRO" es capa de datos, nunca una categoría visible.
  assert.ok(!nombres.includes("MiPRO"));
  assert.ok(!nombres.includes("Servicios"));
});

test("ninguna categoría muestra más de 9 subcategorías", () => {
  for (const c of DEPARTAMENTO_MIPRO.categorias) {
    const visibles = subcategoriasVisibles(c);
    assert.ok(
      visibles.length <= MAXIMO_SUBCATEGORIAS,
      `${c.nombre}: ${visibles.length} subcategorías visibles`,
    );
    // Nada se pierde al agrupar: el total de artículos se conserva.
    const total = visibles.reduce((n, s) => n + s.articulos.length, 0);
    assert.equal(total, cantidadArticulos(c));
  }
});

test("Mobiliario agrupa las residuales en Otros tipos de armado", () => {
  const mobiliario = categoriaDe(DEPARTAMENTO_MIPRO, "Mobiliario");
  assert.ok(mobiliario);
  assert.ok(mobiliario.subcategorias.length > MAXIMO_SUBCATEGORIAS);
  const visibles = subcategoriasVisibles(mobiliario);
  assert.equal(visibles.length, MAXIMO_SUBCATEGORIAS);
  assert.equal(visibles.at(-1)?.nombre, "Otros tipos de armado");
  // El grupo residual se resuelve por id como cualquier subcategoría.
  assert.ok(subcategoriaDe(mobiliario, "otros"));
});

test("Instalación usa las subcategorías del PIM, con su Otros al final", () => {
  const instalacion = categoriaDe(DEPARTAMENTO_MIPRO, "Instalación");
  assert.ok(instalacion);
  const nombres = subcategoriasVisibles(instalacion).map((s) => s.nombre);
  assert.ok(nombres.length <= MAXIMO_SUBCATEGORIAS);
  assert.equal(nombres.at(-1), "Otros servicios de instalación");
  // Muebles RTA NO es subcategoría de Instalación: vive en Mobiliario.
  assert.ok(!nombres.some((n) => n.includes("Muebles RTA")));
});

test("el ejemplo del requerimiento existe: Instalación → línea blanca → AA 9-12k BTU", () => {
  const instalacion = categoriaDe(DEPARTAMENTO_MIPRO, "Instalación");
  const lineaBlanca = instalacion?.subcategorias.find(
    (s) => s.nombre === "Instalación de línea blanca",
  );
  assert.ok(lineaBlanca);
  const aa = lineaBlanca.articulos.find((a) => a.sku === "Y051-000036");
  assert.ok(aa);
  assert.equal(aa.nombre, "Aire acondicionado de 9,000 - 12,000 BTU");
  assert.equal(aa.precio, 120); // precio del PIM, no el del fixture previo
  assert.equal(aa.evaluacion, "depende");
});

test("los ids de artículo son únicos y los SKUs no se repiten", () => {
  const ids = new Set<string>();
  const skus = new Set<string>();
  for (const { articulo } of todosLosArticulos()) {
    const id = idDeArticulo(articulo);
    assert.ok(!ids.has(id), `id repetido: ${id}`);
    ids.add(id);
    if (articulo.sku) {
      assert.ok(!skus.has(articulo.sku), `SKU repetido: ${articulo.sku}`);
      skus.add(articulo.sku);
    }
  }
});

test("la matriz de evaluación es coherente con el PIM", () => {
  for (const { articulo } of todosLosArticulos()) {
    if (articulo.evaluacion === "obligatoria") {
      // Marcados "Inspección" en el PIM: sin precio cerrado.
      assert.equal(articulo.precio, undefined, articulo.nombre);
    }
    if (articulo.evaluacion === "depende") {
      assert.ok(articulo.cuestionarioId, `${articulo.nombre} sin cuestionario`);
    }
  }
  // Casos conocidos del documento.
  const breakers = todosLosArticulos().find(({ articulo }) => articulo.sku === "Y050-000010");
  assert.equal(breakers?.articulo.evaluacion, "obligatoria");
  const lavadora = todosLosArticulos().find(({ articulo }) => articulo.sku === "Y051-000030");
  assert.equal(lavadora?.articulo.evaluacion, "depende");
  assert.equal(lavadora?.articulo.precio, 45);
});

test("todo artículo con evaluación depende resuelve un cuestionario real", () => {
  for (const { articulo } of todosLosArticulos()) {
    if (articulo.evaluacion !== "depende") continue;
    const c = cuestionarioDe(idDeArticulo(articulo));
    assert.ok(c, `${articulo.nombre}: sin cuestionario resoluble`);
    assert.ok(c.preguntas.length >= 1);
  }
});

test("el precio se presenta con la regla de producto (Desde, a cotizar, m²)", () => {
  // Precio del PIM con inspección posible → "Desde $X".
  assert.equal(
    presentarPrecio({ id: "x", nombre: "x", categoria: "x", incluye: [], precioDesde: 120, requiereInspeccion: true }),
    "Desde $120",
  );
  // Centavos del PIM: siempre dos decimales.
  assert.equal(
    presentarPrecio({ id: "x", nombre: "x", categoria: "x", incluye: [], precioDesde: 112.5, requiereInspeccion: true }),
    "Desde $112.50",
  );
  // Unidad explícita del PIM.
  assert.equal(
    presentarPrecio({ id: "x", nombre: "x", categoria: "x", incluye: [], precioDesde: 12.5, unidad: "m²", requiereInspeccion: true }),
    "Desde $12.50 por m²",
  );
  // Sin precio cerrado del PIM: todos los SKUs muestran precio (ningún
  // servicio dice "Precio a cotizar"), cae al precio base referencial.
  assert.equal(
    presentarPrecio({ id: "x", nombre: "x", categoria: "x", incluye: [] }),
    `Desde $${PRECIO_BASE_REFERENCIAL_USD}`,
  );
});
