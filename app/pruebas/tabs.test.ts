// Pruebas de la sección activa del tab bar: cada pantalla enciende UNA
// sección (o ninguna, para pantallas globales como Notificaciones).

import test from "node:test";
import assert from "node:assert/strict";
import { seccionActiva, TABS } from "../src/app/logic/tabs.ts";

test("cada pantalla enciende la sección correcta", () => {
  assert.equal(seccionActiva("/"), "inicio");
  // Catálogo y casos de servicio encienden Servicios.
  assert.equal(seccionActiva("/catalogo"), "servicios");
  assert.equal(seccionActiva("/catalogo/sku-y051-000036"), "servicios");
  // /proyectos ya solo redirige al historial recortado a Servicios, y
  // enciende el mismo tab para que el salto no se vea como un cambio de
  // sección.
  assert.equal(seccionActiva("/proyectos"), "servicios");
  assert.equal(seccionActiva("/servicios/fixture-aire-multivisita"), "servicios");
  assert.equal(seccionActiva("/solicitud-enviada"), "servicios");
  // Garantía y reclamos encienden Garantía.
  assert.equal(seccionActiva("/garantia"), "garantia");
  assert.equal(seccionActiva("/reclamos/fixture-reclamo-taller"), "garantia");
  // Cuenta y pantallas de perfil encienden Perfil.
  assert.equal(seccionActiva("/perfil"), "perfil");
  assert.equal(seccionActiva("/configuracion"), "perfil");
});

test("las pantallas globales no encienden ninguna sección", () => {
  assert.equal(seccionActiva("/notificaciones"), null);
});

test("TB · el historial enciende el tab de la puerta por la que se entró", () => {
  // Vive adentro de Perfil, pero se entra desde tres lugares. Ver "Perfil"
  // marcado después de tocar "Ver todos" en Garantía se lee como si la app
  // te hubiera cambiado de sección sin avisar.
  assert.equal(seccionActiva("/historial"), "perfil");
  assert.equal(seccionActiva("/historial", "?tipo=servicios"), "servicios");
  assert.equal(seccionActiva("/historial", "?tipo=garantias"), "garantia");
  assert.equal(seccionActiva("/historial", "?estado=activos"), "perfil");
  // La ruta vieja redirige, y mientras tanto enciende lo mismo.
  assert.equal(seccionActiva("/mis-solicitudes"), "perfil");
});

test("TB · todo lo de productos enciende el tab Productos", () => {
  // La lista, el detalle, el alta y la edición son UN solo módulo.
  assert.equal(seccionActiva("/mis-productos"), "productos");
  assert.equal(seccionActiva("/mis-productos/agregar"), "productos");
  assert.equal(seccionActiva("/mis-productos/manual-1"), "productos");
  assert.equal(seccionActiva("/mis-productos/manual-1/editar"), "productos");
  // Las rutas viejas solo redirigen: encienden el mismo tab para que el
  // salto no se vea como un cambio de sección.
  assert.equal(seccionActiva("/productos"), "productos");
  assert.equal(seccionActiva("/productos/3"), "productos");
  assert.equal(seccionActiva("/productos/agregar"), "productos");
});

test("TB · la barra tiene cuatro entradas y Perfil no es una", () => {
  assert.deepEqual(
    TABS.map((t) => t.seccion),
    ["inicio", "servicios", "productos", "garantia"],
  );
  assert.ok(
    !TABS.some((t) => t.seccion === "perfil"),
    "Perfil se entra por la foto del Inicio, no por la barra",
  );
  // Y sin embargo la sección sigue existiendo: estar en Perfil es estar en
  // Perfil, aunque ninguna entrada de la barra se encienda.
  assert.equal(seccionActiva("/perfil"), "perfil");
});
