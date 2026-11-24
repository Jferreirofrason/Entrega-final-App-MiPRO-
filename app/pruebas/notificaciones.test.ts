// Pruebas de la bandeja de notificaciones: el contrato cerrado de estados y
// títulos, el encabezado que dice de qué caso habla, la agrupación por fecha
// relativa y el orden por fecha descendente.

import test from "node:test";
import assert from "node:assert/strict";
import {
  ESTADOS_NOTIFICABLES,
  ETIQUETA_DE_TIPO,
  TITULOS,
  agruparNotificaciones,
  encabezadoDeCaso,
  grupoDeFecha,
  ordenarNotificaciones,
  tituloDeNotificacion,
  type EstadoDeSolicitud,
} from "../src/app/logic/notificaciones.ts";
import { ESTADOS_CASO_RECLAMO } from "../src/app/logic/reclamos.ts";
import { listarNotificaciones } from "../src/app/data/notificaciones.ts";

const HOY = "2026-09-04";

// ── El contrato ──────────────────────────────────────────────────────

test("NT · los estados notificables son los cinco del modelo, sin vocabulario paralelo", () => {
  assert.deepEqual([...ESTADOS_NOTIFICABLES], [...ESTADOS_CASO_RECLAMO]);
  assert.deepEqual(
    [...ESTADOS_NOTIFICABLES],
    ["Solicitud recibida", "En revisión", "Cita programada", "Completada", "Cancelada"],
  );
});

test("NT · la matriz de títulos cubre los cinco estados en servicio y en garantía", () => {
  for (const tipo of ["servicio", "garantia"] as const) {
    for (const estado of ESTADOS_NOTIFICABLES) {
      const titulo = tituloDeNotificacion(tipo, estado);
      assert.equal(typeof titulo, "string");
      assert.ok(titulo.trim().length > 0, `${tipo} / ${estado}`);
    }
    // Ni un título de más: la matriz es cerrada.
    assert.equal(Object.keys(TITULOS[tipo]).length, ESTADOS_NOTIFICABLES.length);
  }
});

test("NT · los títulos son los acordados con negocio, palabra por palabra", () => {
  assert.equal(tituloDeNotificacion("servicio", "Solicitud recibida"), "Recibimos tu solicitud");
  assert.equal(tituloDeNotificacion("servicio", "En revisión"), "Estamos revisando tu solicitud");
  assert.equal(tituloDeNotificacion("servicio", "Cita programada"), "Tu cita está programada");
  assert.equal(tituloDeNotificacion("servicio", "Completada"), "Tu servicio fue completado");
  assert.equal(tituloDeNotificacion("servicio", "Cancelada"), "Tu solicitud fue cancelada");

  assert.equal(
    tituloDeNotificacion("garantia", "Solicitud recibida"),
    "Recibimos tu solicitud de garantía",
  );
  assert.equal(
    tituloDeNotificacion("garantia", "En revisión"),
    "Estamos revisando tu solicitud de garantía",
  );
  assert.equal(tituloDeNotificacion("garantia", "Cita programada"), "Tu atención está programada");
  assert.equal(tituloDeNotificacion("garantia", "Completada"), "Tu solicitud fue completada");
  assert.equal(tituloDeNotificacion("garantia", "Cancelada"), "Tu solicitud fue cancelada");
});

test("NT · garantía y servicio no dicen lo mismo en los estados iniciales", () => {
  // En garantía la persona pidió ayuda por garantía, no "un servicio": si
  // las dos columnas se igualaran, la notificación dejaría de sonar a lo
  // que pidió.
  for (const estado of ["Solicitud recibida", "En revisión"] as EstadoDeSolicitud[]) {
    assert.notEqual(
      tituloDeNotificacion("servicio", estado),
      tituloDeNotificacion("garantia", estado),
      estado,
    );
  }
});

test("NT · ningún título menciona lo que salió del contrato", () => {
  // Recordatorios de visita, técnico asignado, avisos de reclamo y pedidos
  // de calificación quedaron afuera: no son cambios de estado y el backend
  // todavía no define quién los emite.
  const todos = [...Object.values(TITULOS.servicio), ...Object.values(TITULOS.garantia)]
    .join(" ")
    .toLowerCase();
  for (const palabra of ["mañana", "técnico", "reclamo", "califica", "encuesta", "novedad"]) {
    assert.ok(!todos.includes(palabra), palabra);
  }
});

// ── El encabezado de cada fila ───────────────────────────────────────

test("NT · cada fila dice en TEXTO si es servicio o garantía", () => {
  assert.equal(ETIQUETA_DE_TIPO.servicio, "Servicio");
  assert.equal(ETIQUETA_DE_TIPO.garantia, "Garantía");
  assert.equal(
    encabezadoDeCaso("servicio", "Instalación de aire acondicionado"),
    "Servicio · Instalación de aire acondicionado",
  );
  assert.equal(
    encabezadoDeCaso("garantia", "Refrigeradora Samsung"),
    "Garantía · Refrigeradora Samsung",
  );
});

// ── Las fijaciones de datos ──────────────────────────────────────────

test("NT · la bandeja de ejemplo cubre los cinco estados por los dos tipos", () => {
  const lista = listarNotificaciones();
  for (const tipo of ["servicio", "garantia"] as const) {
    for (const estado of ESTADOS_NOTIFICABLES) {
      assert.ok(
        lista.some((n) => n.tipoCaso === tipo && n.estado === estado),
        `falta ${tipo} / ${estado}`,
      );
    }
  }
});

test("NT · toda notificación apunta a un caso al que se pueda navegar", () => {
  for (const n of listarNotificaciones()) {
    assert.ok(
      Boolean(n.servicioId) !== Boolean(n.reclamoId),
      `${n.id} tiene que apuntar a un servicio O a un reclamo`,
    );
    // El tipo y el destino no pueden contradecirse: una notificación de
    // garantía que navega a un servicio diría una cosa y abriría otra.
    assert.equal(n.tipoCaso === "garantia", Boolean(n.reclamoId), n.id);
  }
});

// ── Agrupación y orden ───────────────────────────────────────────────

test("NT · el grupo relativo distingue hoy, ayer y anteriores", () => {
  assert.equal(grupoDeFecha("2026-09-04T09:30:00", HOY), "hoy");
  assert.equal(grupoDeFecha("2026-09-03T23:59:00", HOY), "ayer");
  assert.equal(grupoDeFecha("2026-09-02T10:00:00", HOY), "anteriores");
  assert.equal(grupoDeFecha("2026-08-20T10:00:00", HOY), "anteriores");
  // El cruce de mes también resuelve bien el "ayer".
  assert.equal(grupoDeFecha("2026-08-31T10:00:00", "2026-09-01"), "ayer");
});

test("NT · manda la fecha: ya no hay notificación prioritaria", () => {
  const lista = [
    { id: "media", fecha: "2026-09-04T08:00:00" },
    { id: "nueva", fecha: "2026-09-04T10:00:00" },
    { id: "vieja", fecha: "2026-09-04T07:00:00" },
  ];
  assert.deepEqual(
    ordenarNotificaciones(lista).map((n) => n.id),
    ["nueva", "media", "vieja"],
  );
});

test("NT · la agrupación va Hoy, Ayer, Anteriores y omite grupos vacíos", () => {
  const lista = [
    { id: "a", fecha: "2026-09-01T10:00:00" },
    { id: "h", fecha: "2026-09-04T09:30:00" },
    { id: "b", fecha: "2026-08-30T10:00:00" },
  ];
  const grupos = agruparNotificaciones(lista, HOY);
  assert.deepEqual(
    grupos.map((g) => g.grupo),
    ["hoy", "anteriores"],
  );
  assert.deepEqual(
    grupos[0].items.map((n) => n.id),
    ["h"],
  );
  // Dentro de Anteriores, la más reciente arriba.
  assert.deepEqual(
    grupos[1].items.map((n) => n.id),
    ["a", "b"],
  );
});
