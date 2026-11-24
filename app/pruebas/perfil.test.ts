import test from "node:test";
import assert from "node:assert/strict";
import { etiquetaDePerfil, inicialDePerfil } from "../src/app/logic/perfil.ts";

test("PF · la inicial es la primera letra, en mayúscula", () => {
  assert.equal(inicialDePerfil("María"), "M");
  assert.equal(inicialDePerfil("maría"), "M");
  assert.equal(inicialDePerfil("María López"), "M", "nunca dos iniciales");
});

test("PF · el español se respeta: tildes y eñe", () => {
  assert.equal(inicialDePerfil("Álvaro"), "Á");
  assert.equal(inicialDePerfil("álvaro"), "Á");
  assert.equal(inicialDePerfil("Ñusta"), "Ñ");
  assert.equal(inicialDePerfil("ñusta"), "Ñ");
  assert.equal(inicialDePerfil("Óscar"), "Ó");
});

test("PF · los espacios del principio no cuentan", () => {
  assert.equal(inicialDePerfil("   maría"), "M");
  assert.equal(inicialDePerfil("\n\t Álvaro "), "Á");
});

test("PF · sin un nombre con el que armarla, no hay inicial", () => {
  assert.equal(inicialDePerfil(""), null);
  assert.equal(inicialDePerfil("   "), null);
  assert.equal(inicialDePerfil(undefined), null);
  assert.equal(inicialDePerfil(null), null);
});

test("PF · un nombre que no empieza con letra tampoco da inicial", () => {
  // Un "1" o un "#" adentro del círculo amarillo no identifican a nadie:
  // ahí va el ícono genérico de perfil.
  assert.equal(inicialDePerfil("123"), null);
  assert.equal(inicialDePerfil("#maría"), null);
  assert.equal(inicialDePerfil("_"), null);
});

test("PF · el rótulo accesible nombra a la persona", () => {
  assert.equal(etiquetaDePerfil("María"), "Perfil de María");
  assert.equal(etiquetaDePerfil("  María López  "), "Perfil de María López");
  assert.equal(etiquetaDePerfil(""), "Mi perfil", "sin nombre, el genérico");
  assert.equal(etiquetaDePerfil(undefined), "Mi perfil");
});
