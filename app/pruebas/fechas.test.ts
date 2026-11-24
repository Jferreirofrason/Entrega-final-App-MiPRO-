import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatearFechaHora,
  formatearFechaRangoCompacto,
} from "../src/app/logic/fechas.ts";

// La fecha de la cita se presenta en un formato fácil de reconocer, con día
// de la semana y mes con nombre, sin formatos ambiguos tipo "10/09/26".

test("formatea la fecha ISO de la visita con día de la semana y mes con nombre", () => {
  const texto = formatearFechaHora("2025-03-12T14:30:00", "Mié 12 Mar", "2:30 pm");
  assert.ok(texto.startsWith("Miércoles 12 de marzo"), texto);
  assert.ok(texto.includes("2:30"), texto);
});

test("la primera letra va en mayúscula y la hora conserva el formato de la app", () => {
  const texto = formatearFechaHora("2025-03-14T09:00:00", "Vie 14 Mar", "9:00 am");
  assert.ok(texto.startsWith("Viernes 14 de marzo"), texto);
  assert.ok(texto.includes("9:00"), texto);
  assert.ok(/a\.?\s?m\.?/i.test(texto), texto);
});

test("sin fecha ISO conserva los textos del modelo tal cual", () => {
  assert.equal(formatearFechaHora(undefined, "Lun 10 Mar", "10:00 am"), "Lun 10 Mar, 10:00 am");
});

test("una fecha inválida no rompe: usa el texto del modelo", () => {
  assert.equal(formatearFechaHora("no-es-fecha", "Hoy", "4:00 pm"), "Hoy, 4:00 pm");
});

// ── Rango compacto para cards ────────────────────────────────────────

test("rango compacto con mismo meridiano lo dice una sola vez", () => {
  assert.equal(
    formatearFechaRangoCompacto("2025-03-12T14:00:00", "2025-03-12T16:00:00"),
    "Miércoles 12 de marzo · 2:00–⁠4:00 p. m.",
  );
});

test("rango compacto que cruza el mediodía conserva ambos meridianos", () => {
  assert.equal(
    formatearFechaRangoCompacto("2025-03-12T11:00:00", "2025-03-12T13:00:00"),
    "Miércoles 12 de marzo · 11:00 a. m.–⁠1:00 p. m.",
  );
});

test("rango compacto sin fin muestra solo la hora de inicio", () => {
  assert.equal(
    formatearFechaRangoCompacto("2025-03-12T14:30:00", undefined),
    "Miércoles 12 de marzo · 2:30 p. m.",
  );
});
