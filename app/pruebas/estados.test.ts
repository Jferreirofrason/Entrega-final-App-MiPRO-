import { test } from "node:test";
import assert from "node:assert/strict";
import { presentarEstado } from "../src/app/i18n/estados.ts";

// La capa de presentación traduce los estados internos a lenguaje cotidiano
// sin cambiar los valores del dominio.

test("los seis estados del requerimiento usan la microcopy aprobada", () => {
  assert.equal(presentarEstado("Pendiente sincronizar").etiqueta, "Estamos enviando tu solicitud");
  assert.equal(presentarEstado("Solicitud recibida").etiqueta, "Recibimos tu solicitud");
  assert.equal(presentarEstado("Visita coordinada").etiqueta, "Tu visita está confirmada");
  assert.equal(presentarEstado("En progreso").etiqueta, "El servicio está en curso");
  assert.equal(presentarEstado("Completado").etiqueta, "Servicio completado");
  assert.equal(presentarEstado("Cancelado").etiqueta, "Visita cancelada");
});

test("cada estado explica qué esperar cuando la tabla lo define", () => {
  assert.equal(presentarEstado("Pendiente sincronizar").explicacion, "Puede demorar unos minutos.");
  assert.equal(presentarEstado("Solicitud recibida").explicacion, "Pronto coordinaremos la visita contigo.");
  assert.equal(presentarEstado("En progreso").explicacion, "El técnico está trabajando en tu solicitud.");
  assert.equal(presentarEstado("Completado").explicacion, "La visita fue finalizada.");
  assert.ok(presentarEstado("Cancelado").explicacion);
});

test("no distingue mayúsculas ni espacios sobrantes", () => {
  assert.equal(presentarEstado("  PENDIENTE SINCRONIZAR ").etiqueta, "Estamos enviando tu solicitud");
});

test("el vocabulario del modelo existente comparte etiquetas coherentes", () => {
  assert.equal(presentarEstado("Coordinado").etiqueta, presentarEstado("Visita coordinada").etiqueta);
  assert.equal(presentarEstado("Finalizado").etiqueta, presentarEstado("Completado").etiqueta);
  assert.ok(presentarEstado("Agendado").etiqueta.length > 0);
  assert.ok(presentarEstado("En camino").etiqueta.length > 0);
  assert.ok(presentarEstado("En pausa").etiqueta.length > 0);
});

test("un estado desconocido se muestra tal cual, sin inventar explicación", () => {
  const p = presentarEstado("Estado nuevo del backend");
  assert.equal(p.etiqueta, "Estado nuevo del backend");
  assert.equal(p.explicacion, undefined);
});

test("ninguna etiqueta ni explicación expone lenguaje técnico o administrativo", () => {
  const prohibidos = ["sincronizar", "sincronización", "request", "ticket", "workflow", "procesando", "orden en", "estado actualizado"];
  const estados = [
    "Pendiente sincronizar", "Solicitud recibida", "Visita coordinada",
    "En progreso", "Completado", "Cancelado",
    "Coordinado", "Agendado", "En camino", "En pausa", "Finalizado",
  ];
  for (const estado of estados) {
    const p = presentarEstado(estado);
    const texto = `${p.etiqueta} ${p.explicacion ?? ""}`.toLowerCase();
    for (const palabra of prohibidos) {
      assert.ok(!texto.includes(palabra), `"${estado}" expone "${palabra}": ${texto}`);
    }
  }
});
