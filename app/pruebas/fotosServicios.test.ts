import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEPARTAMENTO_MIPRO } from "../src/app/data/catalogoMipro.ts";

// Las fotos del catálogo viven en el sistema de archivos y se resuelven con
// el glob de Vite, que en node no existe: por eso esto se prueba mirando la
// carpeta y no importando el módulo. Lo que cuida es que una carpeta no
// quede huérfana ni a medias, que es el error que nadie ve hasta que una
// ficha aparece sin foto en la demo.

// fileURLToPath y no `.pathname`: una ruta con espacios o con "|" viene
// percent-encoded en la URL y readdirSync no la encuentra.
const CARPETA = fileURLToPath(new URL("../src/assets/servicios/", import.meta.url));

const carpetas = readdirSync(CARPETA).filter((d) =>
  statSync(join(CARPETA, d)).isDirectory(),
);

const subcategorias = new Map<string, string>();
for (const c of DEPARTAMENTO_MIPRO.categorias) {
  for (const s of c.subcategorias) subcategorias.set(s.id, `${c.nombre} / ${s.nombre}`);
}

test("FS · hay fotos cargadas", () => {
  assert.ok(carpetas.length >= 30, `solo ${carpetas.length} subcategorías con foto`);
});

test("FS · cada carpeta de fotos es una subcategoría del catálogo", () => {
  for (const id of carpetas) {
    assert.ok(
      subcategorias.has(id),
      `"${id}" no es una subcategoría: esas fotos no las ve nadie`,
    );
  }
});

test("FS · cada subcategoría con foto trae las dos que necesita", () => {
  for (const id of carpetas) {
    const archivos = readdirSync(join(CARPETA, id));
    assert.ok(archivos.includes("cuadrada.jpg"), `${id}: falta la miniatura cuadrada`);
    assert.ok(archivos.includes("ancha.jpg"), `${id}: falta la foto apaisada`);
  }
});

test("FS · ninguna foto pesa de más", () => {
  for (const id of carpetas) {
    for (const archivo of readdirSync(join(CARPETA, id))) {
      const kb = statSync(join(CARPETA, id, archivo)).size / 1024;
      assert.ok(kb < 220, `${id}/${archivo} pesa ${Math.round(kb)} KB`);
    }
  }
});

test("FS · queda declarado qué subcategorías todavía no tienen foto", () => {
  const sinFoto = [...subcategorias.entries()]
    .filter(([id]) => !carpetas.includes(id))
    .map(([, nombre]) => nombre);
  // No es un error: el cliente entregó 33 de las 37 subcategorías. La
  // prueba fija el número para que, si crece, alguien se entere.
  assert.ok(
    sinFoto.length <= 4,
    `quedaron ${sinFoto.length} subcategorías sin foto: ${sinFoto.join(", ")}`,
  );
});
