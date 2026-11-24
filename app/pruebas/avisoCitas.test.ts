import { test } from "node:test";
import assert from "node:assert/strict";
import { situacionRelevante, prioridadDeAviso } from "../src/app/logic/avisoCitas.ts";
import type { ServicioCliente, VisitaServicio } from "../src/app/logic/servicios.ts";

let n = 1;
function visita(parcial: Partial<VisitaServicio> & { estado: string }): VisitaServicio {
  return { id: n++, ...parcial };
}
function servicio(parcial: Partial<ServicioCliente> & { visitas: VisitaServicio[] }): ServicioCliente {
  return { id: `s-${n++}`, nombre: "Instalación eléctrica", ...parcial };
}

test("sin servicios no hay aviso: el Home prioriza descubrimiento", () => {
  assert.equal(situacionRelevante([]), null);
});

test("una solicitud recibida sin fecha NO genera aviso", () => {
  assert.equal(situacionRelevante([servicio({ visitas: [] })]), null);
});

test("servicios finalizados no generan aviso", () => {
  const finalizado = servicio({ visitas: [visita({ estado: "Completado", visitAt: "2025-02-18T15:00:00" })] });
  assert.equal(situacionRelevante([finalizado]), null);
});

test("una próxima visita agendada genera el aviso con su visita", () => {
  const s = servicio({ visitas: [visita({ estado: "Agendado", visitAt: "2025-03-12T14:30:00", tecnico: "Carlos Rodríguez" })] });
  const aviso = situacionRelevante([s]);
  assert.equal(aviso?.tipo, "proxima-visita");
  assert.equal(aviso?.visita?.tecnico, "Carlos Rodríguez");
});

test("entre varias próximas gana la más cercana", () => {
  const lejana = servicio({ id: "lejana", visitas: [visita({ estado: "Agendado", visitAt: "2025-03-20T10:00:00" })] });
  const cercana = servicio({ id: "cercana", visitas: [visita({ estado: "Agendado", visitAt: "2025-03-11T09:00:00" })] });
  assert.equal(situacionRelevante([lejana, cercana])?.servicio.id, "cercana");
});

test("una visita en curso ahora le gana a cualquier próxima visita", () => {
  const proxima = servicio({ id: "proxima", visitas: [visita({ estado: "Agendado", visitAt: "2025-03-11T09:00:00" })] });
  const activa = servicio({ id: "activa", visitas: [visita({ estado: "En progreso", visitAt: "2025-03-10T08:00:00" })] });
  const aviso = situacionRelevante([proxima, activa]);
  assert.equal(aviso?.tipo, "visita-en-curso");
  assert.equal(aviso?.servicio.id, "activa");
});

test("En curso (vocabulario exacto del seguimiento por estados) dispara el mismo aviso que En progreso", () => {
  const proxima = servicio({ id: "proxima", visitas: [visita({ estado: "Cita confirmada", visitAt: "2026-09-18T10:00:00" })] });
  const activa = servicio({ id: "inspeccion", visitas: [visita({ estado: "En curso", visitAt: "2026-09-11T08:00:00" })] });
  const aviso = situacionRelevante([proxima, activa]);
  assert.equal(aviso?.tipo, "visita-en-curso");
  assert.equal(aviso?.servicio.id, "inspeccion");
});

test("el técnico en camino tiene su propio aviso, debajo del en curso", () => {
  const enCamino = servicio({ id: "camino", visitas: [visita({ estado: "En camino", visitAt: "2025-03-09T16:00:00" })] });
  assert.equal(situacionRelevante([enCamino])?.tipo, "tecnico-en-camino");

  const enProgreso = servicio({ id: "progreso", visitas: [visita({ estado: "En progreso", visitAt: "2025-03-10T08:00:00" })] });
  const aviso = situacionRelevante([enCamino, enProgreso]);
  assert.equal(aviso?.tipo, "visita-en-curso");
  assert.equal(aviso?.otrasEnCurso, 1);
});

test("con varias en curso gana la que comenzó antes y se cuentan las demás", () => {
  const tarde = servicio({ id: "tarde", visitas: [visita({ estado: "En progreso", visitAt: "2025-03-10T10:00:00" })] });
  const temprano = servicio({ id: "temprano", visitas: [visita({ estado: "En progreso", visitAt: "2025-03-10T08:00:00" })] });
  const aviso = situacionRelevante([tarde, temprano]);
  assert.equal(aviso?.servicio.id, "temprano");
  assert.equal(aviso?.otrasEnCurso, 1);
});

test("la prioridad de posición: activas arriba, próximas e informativas abajo", () => {
  assert.equal(prioridadDeAviso("visita-en-curso"), "alta");
  assert.equal(prioridadDeAviso("tecnico-en-camino"), "alta");
  assert.equal(prioridadDeAviso("proxima-visita"), "media");
  assert.equal(prioridadDeAviso("enviando-solicitud"), "media");
});

test("una solicitud sincronizándose avisa solo si no hay nada más importante", () => {
  const sincronizando = servicio({ id: "sync", visitas: [visita({ estado: "Pendiente sincronizar" })] });
  assert.equal(situacionRelevante([sincronizando])?.tipo, "enviando-solicitud");

  const conProxima = servicio({ id: "prox", visitas: [visita({ estado: "Agendado", visitAt: "2025-03-11T09:00:00" })] });
  assert.equal(situacionRelevante([sincronizando, conProxima])?.tipo, "proxima-visita");
});
