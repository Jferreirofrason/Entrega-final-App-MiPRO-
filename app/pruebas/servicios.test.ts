import { test } from "node:test";
import assert from "node:assert/strict";
import {
  estadoGeneralServicio,
  clasificarServicio,
  proximaVisita,
  progresoServicio,
  ordenarEnCurso,
  ordenarFinalizadas,
  fechaDeCierre,
  visitasEnOrden,
  type ServicioCliente,
  type VisitaServicio,
} from "../src/app/logic/servicios.ts";

let siguienteId = 1;
function visita(parcial: Partial<VisitaServicio> & { estado: string }): VisitaServicio {
  return { id: siguienteId++, ...parcial };
}

function servicio(parcial: Partial<ServicioCliente>): ServicioCliente {
  return {
    id: `s-${siguienteId++}`,
    nombre: "Instalación de aire acondicionado",
    visitas: [],
    ...parcial,
  };
}

// ── Estado general y clasificación en tabs ───────────────────────────

test("servicio de una sola visita agendada: visita agendada, tab En curso", () => {
  const s = servicio({
    visitas: [visita({ estado: "Agendado", visitAt: "2025-03-12T14:30:00" })],
  });
  assert.equal(estadoGeneralServicio(s), "visita-agendada");
  assert.equal(clasificarServicio(s), "en-curso");
});

test("servicio con trabajo activo ahora: En curso", () => {
  const s = servicio({
    visitas: [
      visita({ estado: "Completado", visitAt: "2025-03-03T10:00:00" }),
      visita({ estado: "En progreso", visitAt: "2025-03-10T10:00:00" }),
    ],
  });
  assert.equal(estadoGeneralServicio(s), "en-curso");
});

// Vocabulario exacto del seguimiento por estados (ej. "Inspección de aire
// acondicionado"): Por coordinar → Cita confirmada → En curso → Completado.
test("Por coordinar: sin fecha, el servicio queda coordinando", () => {
  const s = servicio({ visitas: [visita({ estado: "Por coordinar" })] });
  assert.equal(estadoGeneralServicio(s), "coordinando");
});

test("Cita confirmada con fecha: visita agendada", () => {
  const s = servicio({
    visitas: [visita({ estado: "Cita confirmada", visitAt: "2026-09-18T10:00:00" })],
  });
  assert.equal(estadoGeneralServicio(s), "visita-agendada");
});

test("En curso: el servicio queda en curso", () => {
  const s = servicio({
    visitas: [visita({ estado: "En curso", visitAt: "2026-09-11T10:00:00" })],
  });
  assert.equal(estadoGeneralServicio(s), "en-curso");
});

test("solicitud sin visitas todavía: Solicitud recibida, tab En curso", () => {
  const s = servicio({ visitas: [] });
  assert.equal(estadoGeneralServicio(s), "solicitud-recibida");
  assert.equal(clasificarServicio(s), "en-curso");
});

test("visitas pendientes sin fecha: Coordinando, tab En curso", () => {
  const s = servicio({
    visitas: [visita({ estado: "Pendiente de coordinación" })],
  });
  assert.equal(estadoGeneralServicio(s), "coordinando");
  assert.equal(clasificarServicio(s), "en-curso");
});

test("todas las visitas completadas: Completado, tab Finalizadas", () => {
  const s = servicio({
    visitas: [
      visita({ estado: "Completado", visitAt: "2025-02-10T09:00:00" }),
      visita({ estado: "Completado", visitAt: "2025-02-14T10:00:00" }),
    ],
  });
  assert.equal(estadoGeneralServicio(s), "completado");
  assert.equal(clasificarServicio(s), "finalizadas");
});

test("servicio cancelado va a Finalizadas como cancelado, nunca como completado", () => {
  const s = servicio({
    cancelado: true,
    canceladoEl: "2025-02-12T12:00:00",
    visitas: [visita({ estado: "Completado", visitAt: "2025-02-05T11:00:00" })],
  });
  assert.equal(estadoGeneralServicio(s), "cancelado");
  assert.equal(clasificarServicio(s), "finalizadas");
});

test("caso límite: una visita cancelada pero otra futura mantiene el servicio en curso", () => {
  const s = servicio({
    visitas: [
      visita({ estado: "Cancelado", visitAt: "2025-03-05T16:00:00" }),
      visita({ estado: "Agendado", visitAt: "2025-03-20T10:00:00" }),
    ],
  });
  assert.equal(estadoGeneralServicio(s), "visita-agendada");
  assert.equal(clasificarServicio(s), "en-curso");
});

test("caso inconsistente: todas las visitas canceladas sin cancelar el padre se trata como cancelado", () => {
  const s = servicio({ visitas: [visita({ estado: "Cancelado" })] });
  assert.equal(estadoGeneralServicio(s), "cancelado");
});

// ── Próxima visita ───────────────────────────────────────────────────

test("la próxima visita es la pendiente con fecha más cercana", () => {
  const cableado = visita({ proposito: "Cableado", estado: "Agendado", visitAt: "2025-03-12T14:30:00" });
  const s = servicio({
    visitas: [
      visita({ estado: "Completado", visitAt: "2025-03-03T10:00:00" }),
      visita({ proposito: "Finalización", estado: "Agendado", visitAt: "2025-03-20T10:00:00" }),
      cableado,
    ],
  });
  assert.equal(proximaVisita(s)?.proposito, "Cableado");
});

test("sin visitas coordinadas no hay próxima visita: la interfaz explica la coordinación", () => {
  const s = servicio({ visitas: [visita({ estado: "Pendiente de coordinación" })] });
  assert.equal(proximaVisita(s), null);
});

test("cada visita puede tener un técnico distinto: la próxima trae el suyo", () => {
  const s = servicio({
    visitas: [
      visita({ estado: "Completado", visitAt: "2025-03-03T10:00:00", tecnico: "Juan Pérez" }),
      visita({ estado: "Agendado", visitAt: "2025-03-12T14:30:00", tecnico: "Carlos Rodríguez" }),
    ],
  });
  assert.equal(proximaVisita(s)?.tecnico, "Carlos Rodríguez");
});

// ── Progreso ─────────────────────────────────────────────────────────

test("progreso con plan confirmado: 2 de 4, sin contar canceladas", () => {
  const s = servicio({
    totalVisitasConfirmado: true,
    visitas: [
      visita({ estado: "Completado" }),
      visita({ estado: "Completado" }),
      visita({ estado: "Agendado" }),
      visita({ estado: "Pendiente de coordinación" }),
      visita({ estado: "Cancelado" }),
    ],
  });
  const p = progresoServicio(s);
  assert.equal(p.realizadas, 2);
  assert.equal(p.total, 4);
  assert.equal(p.totalConocido, true);
});

test("sin plan confirmado el total no se promete", () => {
  const s = servicio({
    visitas: [visita({ estado: "Completado" }), visita({ estado: "Agendado" })],
  });
  assert.equal(progresoServicio(s).totalConocido, false);
});

// ── Orden de los listados ────────────────────────────────────────────

test("En curso ordena: trabajo activo, próxima más cercana, coordinando, solicitud", () => {
  const activo = servicio({ id: "activo", visitas: [visita({ estado: "En progreso", visitAt: "2025-03-10T08:00:00" })] });
  const cercano = servicio({ id: "cercano", visitas: [visita({ estado: "Agendado", visitAt: "2025-03-11T09:00:00" })] });
  const lejano = servicio({ id: "lejano", visitas: [visita({ estado: "Agendado", visitAt: "2025-03-20T09:00:00" })] });
  const coordinando = servicio({ id: "coordinando", visitas: [visita({ estado: "Pendiente de coordinación" })] });
  const solicitud = servicio({ id: "solicitud", visitas: [] });
  const orden = ordenarEnCurso([solicitud, lejano, coordinando, activo, cercano]).map((s) => s.id);
  assert.deepEqual(orden, ["activo", "cercano", "lejano", "coordinando", "solicitud"]);
});

test("Finalizadas ordena por fecha de cierre, de más reciente a más antigua", () => {
  const viejo = servicio({ id: "viejo", finalizadoEl: "2025-01-10T10:00:00", visitas: [visita({ estado: "Completado" })] });
  const nuevo = servicio({ id: "nuevo", canceladoEl: "2025-02-12T12:00:00", cancelado: true, visitas: [] });
  assert.deepEqual(ordenarFinalizadas([viejo, nuevo]).map((s) => s.id), ["nuevo", "viejo"]);
});

test("sin fecha explícita de cierre se usa la última visita completada", () => {
  const s = servicio({
    visitas: [
      visita({ estado: "Completado", visitAt: "2025-02-10T09:00:00" }),
      visita({ estado: "Completado", visitAt: "2025-02-18T15:00:00" }),
    ],
  });
  assert.equal(fechaDeCierre(s), "2025-02-18T15:00:00");
});

// ── Recorrido ────────────────────────────────────────────────────────

test("el recorrido ordena cronológicamente y deja al final las visitas sin fecha", () => {
  const s = servicio({
    visitas: [
      visita({ proposito: "Finalización", estado: "Pendiente de coordinación" }),
      visita({ proposito: "Instalación", estado: "Completado", visitAt: "2025-03-07T09:00:00" }),
      visita({ proposito: "Inspección", estado: "Completado", visitAt: "2025-03-03T10:00:00" }),
    ],
  });
  assert.deepEqual(
    visitasEnOrden(s).map((v) => v.proposito),
    ["Inspección", "Instalación", "Finalización"],
  );
});
