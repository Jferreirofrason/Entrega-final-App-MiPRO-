import test from "node:test";
import assert from "node:assert/strict";
import {
  ESTADOS_CITA,
  RECORRIDO_CITA,
  claveVisualCita,
  debeMostrarFecha,
  debeMostrarTecnico,
  esCitaCancelada,
  esCitaCompletada,
  esCitaPendiente,
  estadosAlcanzados,
  etiquetaEstadoCita,
  normalizarEstadoCita,
} from "../src/app/logic/estadosCita.ts";
import { historialCita, type CitaReclamo } from "../src/app/logic/reclamos.ts";

// ── El vocabulario ───────────────────────────────────────────────────

test("los estados de cita son exactamente los cinco acordados", () => {
  assert.deepEqual(ESTADOS_CITA, [
    "Por coordinar",
    "Cita confirmada",
    "En curso",
    "Completada",
    "Cancelada",
  ]);
});

test("el recorrido habitual no incluye Cancelada: es una salida, no un paso", () => {
  assert.deepEqual(RECORRIDO_CITA, ["Por coordinar", "Cita confirmada", "En curso", "Completada"]);
  assert.ok(!RECORRIDO_CITA.includes("Cancelada"));
});

// ── Traducción del vocabulario viejo ─────────────────────────────────

test("las variantes viejas se traducen al vocabulario único", () => {
  assert.equal(normalizarEstadoCita("Pendiente de coordinación"), "Por coordinar");
  assert.equal(normalizarEstadoCita("Cita programada"), "Cita confirmada");
  assert.equal(normalizarEstadoCita("Agendado"), "Cita confirmada");
  assert.equal(normalizarEstadoCita("Coordinado"), "Cita confirmada");
  assert.equal(normalizarEstadoCita("En progreso"), "En curso");
  assert.equal(normalizarEstadoCita("En camino"), "En curso");
  assert.equal(normalizarEstadoCita("Completado"), "Completada");
  assert.equal(normalizarEstadoCita("Finalizado"), "Completada");
  assert.equal(normalizarEstadoCita("Cancelado"), "Cancelada");
});

test("la traducción no distingue mayúsculas ni espacios sobrantes", () => {
  assert.equal(normalizarEstadoCita("  AGENDADO  "), "Cita confirmada");
});

test("un estado desconocido no se traduce ni se inventa", () => {
  assert.equal(normalizarEstadoCita("En pausa"), null);
  // Se muestra tal cual llegó, antes que mentir con un estado que no es.
  assert.equal(etiquetaEstadoCita("En pausa"), "En pausa");
});

// ── Reglas de negocio de la cita ─────────────────────────────────────

test("una cita pendiente no está ni completada ni cancelada", () => {
  assert.ok(esCitaPendiente("Por coordinar"));
  assert.ok(esCitaPendiente("Cita confirmada"));
  assert.ok(esCitaPendiente("En curso"));
  assert.ok(esCitaCompletada("Completada"));
  assert.ok(esCitaCancelada("Cancelada"));
  assert.ok(!esCitaPendiente("Completada"));
});

test("solo Por coordinar oculta fecha y técnico", () => {
  assert.equal(debeMostrarFecha("Por coordinar"), false);
  assert.equal(debeMostrarTecnico("Por coordinar"), false);
  for (const estado of ["Cita confirmada", "En curso", "Completada", "Cancelada"]) {
    assert.equal(debeMostrarFecha(estado), true, estado);
    assert.equal(debeMostrarTecnico(estado), true, estado);
  }
});

test("cada estado tiene su color e ícono del sistema existente", () => {
  assert.equal(claveVisualCita("Por coordinar"), "solicitud recibida");
  assert.equal(claveVisualCita("Cita confirmada"), "agendado");
  assert.equal(claveVisualCita("En curso"), "en progreso");
  assert.equal(claveVisualCita("Completada"), "completado");
  assert.equal(claveVisualCita("Cancelada"), "cancelado");
});

// ── Estados alcanzados (historial) ───────────────────────────────────

test("solo se listan los estados por los que la cita YA pasó", () => {
  assert.deepEqual(estadosAlcanzados("Por coordinar"), ["Por coordinar"]);
  assert.deepEqual(estadosAlcanzados("Cita confirmada"), ["Por coordinar", "Cita confirmada"]);
  assert.deepEqual(estadosAlcanzados("En curso"), ["Por coordinar", "Cita confirmada", "En curso"]);
  assert.deepEqual(estadosAlcanzados("Completada"), [
    "Por coordinar",
    "Cita confirmada",
    "En curso",
    "Completada",
  ]);
});

test("una etapa futura nunca aparece como alcanzada", () => {
  const alcanzados = estadosAlcanzados("Cita confirmada");
  assert.ok(!alcanzados.includes("En curso"));
  assert.ok(!alcanzados.includes("Completada"));
});

test("cancelar corta el recorrido: sin historial cargado no se adivina hasta dónde llegó", () => {
  assert.deepEqual(estadosAlcanzados("Cancelada"), ["Cancelada"]);
});

// ── Historial de una cita de garantía ────────────────────────────────

const citaBase: CitaReclamo = { id: 1, tipo: "Inspección", estado: "Cita confirmada" };

test("sin historial cargado, el recorrido se deriva del estado actual", () => {
  const cambios = historialCita({ ...citaBase, fecha: "2024-06-03T09:00:00" });
  assert.deepEqual(
    cambios.map((c) => c.estado),
    ["Por coordinar", "Cita confirmada"],
  );
  // La única fecha conocida es la de la cita: al resto no se le inventa una.
  assert.equal(cambios[0].fecha, undefined);
  assert.equal(cambios[1].fecha, "2024-06-03T09:00:00");
});

test("con historial cargado se usa el de backoffice, que es lo que realmente pasó", () => {
  const cambios = historialCita({
    ...citaBase,
    estado: "Cancelada",
    historial: [
      { estado: "Por coordinar", fecha: "2024-06-01T09:00:00" },
      { estado: "Cita confirmada", fecha: "2024-06-02T16:00:00" },
      { estado: "Cancelada", fecha: "2024-06-04T18:20:00" },
    ],
  });
  // Una cancelación desde un estado previo conserva el camino recorrido.
  assert.deepEqual(
    cambios.map((c) => c.estado),
    ["Por coordinar", "Cita confirmada", "Cancelada"],
  );
});
