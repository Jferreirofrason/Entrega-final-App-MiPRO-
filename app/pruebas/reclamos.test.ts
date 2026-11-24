import { test } from "node:test";
import assert from "node:assert/strict";
import {
  esReclamoActivo,
  estadoGeneralReclamo,
  citaRelevante,
  citasEnOrden,
  debeMostrarFechaCita,
  debeMostrarTecnicoCita,
  reclamoRequiereAccion,
  prioridadReclamo,
  ordenarReclamos,
  reclamoParaHome,
  debeMostrarVerTodos,
  ultimaActualizacion,
  type ReclamoGarantiaCliente,
  type CitaReclamo,
} from "../src/app/logic/reclamos.ts";
import { presentarEstadoCasoReclamo, presentarEstadoCitaReclamo } from "../src/app/i18n/estados.ts";

let n = 1;
function reclamo(parcial: Partial<ReclamoGarantiaCliente> = {}): ReclamoGarantiaCliente {
  return {
    id: `r-${n++}`,
    numero: `REC-2024-0${n}`,
    producto: "Aire acondicionado",
    citas: [],
    ...parcial,
  };
}

function cita(parcial: Partial<CitaReclamo> & { estado: CitaReclamo["estado"] }): CitaReclamo {
  return { id: 1, tipo: "Inspección", ...parcial };
}

// ── Estado general del caso (derivado, nunca un string suelto) ───────

test("sin citas el caso arranca en Solicitud recibida", () => {
  assert.equal(estadoGeneralReclamo(reclamo()), "Solicitud recibida");
});

test("una cita Por coordinar sin cerrar deja el caso En revisión", () => {
  const r = reclamo({ citas: [cita({ estado: "Por coordinar" })] });
  assert.equal(estadoGeneralReclamo(r), "En revisión");
});

test("una cita confirmada o en curso deja el caso en Cita programada (nunca En curso)", () => {
  assert.equal(
    estadoGeneralReclamo(reclamo({ citas: [cita({ estado: "Cita confirmada" })] })),
    "Cita programada",
  );
  assert.equal(
    estadoGeneralReclamo(reclamo({ citas: [cita({ estado: "En curso" })] })),
    "Cita programada",
  );
});

test("todas las citas completadas cierran el caso en Completada", () => {
  const r = reclamo({ citas: [cita({ estado: "Completada" }), cita({ id: 2, estado: "Completada" })] });
  assert.equal(estadoGeneralReclamo(r), "Completada");
});

test("todas las citas canceladas sin cancelar el caso también lo deja Cancelada", () => {
  const r = reclamo({ citas: [cita({ estado: "Cancelada" })] });
  assert.equal(estadoGeneralReclamo(r), "Cancelada");
});

test("cancelado explícito manda por sobre cualquier cita", () => {
  const r = reclamo({ cancelado: true, citas: [cita({ estado: "Cita confirmada" })] });
  assert.equal(estadoGeneralReclamo(r), "Cancelada");
});

test("card, hub y detalle usan la misma fuente: mismo estado para el mismo reclamo", () => {
  const r = reclamo({ citas: [cita({ estado: "Cita confirmada" })] });
  const a = presentarEstadoCasoReclamo(estadoGeneralReclamo(r));
  const b = presentarEstadoCasoReclamo(estadoGeneralReclamo(r));
  assert.equal(a.etiqueta, b.etiqueta);
  assert.equal(a.etiqueta, "Cita programada");
});

// ── Activo vs finalizado ─────────────────────────────────────────────

test("los estados abiertos cuentan como activos y los cerrados no", () => {
  assert.equal(esReclamoActivo(reclamo()), true, "Solicitud recibida");
  assert.equal(esReclamoActivo(reclamo({ citas: [cita({ estado: "Por coordinar" })] })), true, "En revisión");
  assert.equal(esReclamoActivo(reclamo({ citas: [cita({ estado: "Cita confirmada" })] })), true, "Cita programada");
  assert.equal(esReclamoActivo(reclamo({ citas: [cita({ estado: "Completada" })] })), false, "Completada");
  assert.equal(esReclamoActivo(reclamo({ cancelado: true })), false, "Cancelada");
});

// ── Requiere acción (flag ortogonal, no es uno de los 5 estados) ─────

test("requiereAccionCliente es independiente del estado derivado", () => {
  const r = reclamo({ requiereAccionCliente: "Envíanos una foto de la placa." });
  assert.equal(reclamoRequiereAccion(r), true);
  assert.equal(estadoGeneralReclamo(r), "Solicitud recibida");
  assert.equal(reclamoRequiereAccion(reclamo()), false);
});

// ── Cita relevante y orden cronológico ───────────────────────────────

test("la cita relevante es la coordinada con fecha más cercana (ni Por coordinar ni cancelada)", () => {
  const r = reclamo({
    citas: [
      cita({ id: 1, estado: "Completada", fecha: "2024-05-20T10:00:00" }),
      cita({ id: 2, estado: "Cita confirmada", fecha: "2024-06-03T10:00:00", tecnico: "Luis Herrera" }),
      cita({ id: 3, estado: "Por coordinar" }),
    ],
  });
  assert.equal(citaRelevante(r)?.tecnico, "Luis Herrera");
});

test("sin citas coordinadas no hay cita relevante", () => {
  assert.equal(citaRelevante(reclamo({ citas: [cita({ estado: "Por coordinar" })] })), null);
});

test("las citas se ordenan cronológicamente, sin fecha al final", () => {
  const r = reclamo({
    citas: [
      cita({ id: 2, estado: "Completada", fecha: "2024-05-20T10:00:00" }),
      cita({ id: 3, estado: "Por coordinar" }),
      cita({ id: 1, estado: "Cita confirmada", fecha: "2024-05-10T09:00:00" }),
    ],
  });
  assert.deepEqual(citasEnOrden(r).map((c) => c.id), [1, 2, 3]);
});

test("Por coordinar nunca muestra fecha ni técnico; desde Cita confirmada sí", () => {
  assert.equal(debeMostrarFechaCita(cita({ estado: "Por coordinar" })), false);
  assert.equal(debeMostrarTecnicoCita(cita({ estado: "Por coordinar" })), false);
  assert.equal(debeMostrarFechaCita(cita({ estado: "Cita confirmada" })), true);
  assert.equal(debeMostrarTecnicoCita(cita({ estado: "Cita confirmada" })), true);
});

// ── Priorización ─────────────────────────────────────────────────────

test("orden: acción requerida, cita próxima, activos recientes, completados, cancelados", () => {
  const accion = reclamo({ id: "accion", requiereAccionCliente: "Falta info", actualizadoEl: "2024-05-01T09:00:00" });
  const conCita = reclamo({ id: "cita", citas: [cita({ estado: "Cita confirmada", fecha: "2024-06-03T10:00:00" })] });
  const activo = reclamo({ id: "activo", citas: [cita({ estado: "Por coordinar" })], actualizadoEl: "2024-05-28T09:00:00" });
  const completado = reclamo({ id: "completado", citas: [cita({ estado: "Completada" })], resueltoEl: "2024-04-18T15:00:00" });
  const cancelado = reclamo({ id: "cancelado", cancelado: true, actualizadoEl: "2024-05-30T09:00:00" });

  const orden = ordenarReclamos([cancelado, completado, activo, conCita, accion]).map((r) => r.id);
  assert.deepEqual(orden, ["accion", "cita", "activo", "completado", "cancelado"]);
});

test("entre activos gana el actualizado más recientemente", () => {
  const viejo = reclamo({ id: "viejo", actualizadoEl: "2024-05-01T09:00:00" });
  const nuevo = reclamo({ id: "nuevo", citas: [cita({ estado: "Por coordinar" })], actualizadoEl: "2024-05-28T09:00:00" });
  assert.deepEqual(ordenarReclamos([viejo, nuevo]).map((r) => r.id), ["nuevo", "viejo"]);
});

// ── Reclamo destacado del Home ───────────────────────────────────────

test("el Home muestra el más prioritario, no el último creado", () => {
  const nuevoPeroPasivo = reclamo({ id: "pasivo", iniciadoEl: "2024-05-28T09:00:00", actualizadoEl: "2024-05-28T09:00:00" });
  const viejoConAccion = reclamo({ id: "conAccion", requiereAccionCliente: "Falta info", iniciadoEl: "2024-05-01T09:00:00" });
  assert.equal(reclamoParaHome([nuevoPeroPasivo, viejoConAccion])?.id, "conAccion");
});

test("solo finalizados: el Home muestra el más reciente", () => {
  const viejo = reclamo({ id: "viejo", citas: [cita({ estado: "Completada" })], resueltoEl: "2024-03-10T09:00:00" });
  const nuevo = reclamo({ id: "nuevo", citas: [cita({ estado: "Completada" })], resueltoEl: "2024-04-18T09:00:00" });
  assert.equal(reclamoParaHome([viejo, nuevo])?.id, "nuevo");
});

test("sin reclamos no hay destacado y Ver todos solo aparece con más de uno", () => {
  assert.equal(reclamoParaHome([]), null);
  assert.equal(debeMostrarVerTodos(1), false);
  assert.equal(debeMostrarVerTodos(2), true);
});

// ── Presentación de estados del caso (los 5 exactos) ─────────────────

test("cada estado del caso trae el mensaje exacto de negocio", () => {
  assert.equal(presentarEstadoCasoReclamo("Solicitud recibida").mensaje, "Recibimos tu solicitud. Te avisaremos cuando tengamos novedades.");
  assert.equal(presentarEstadoCasoReclamo("En revisión").mensaje, "Estamos revisando tu solicitud para coordinar la atención.");
  assert.equal(presentarEstadoCasoReclamo("Cita programada").mensaje, "Coordinamos tu cita. Revisa la fecha y el horario.");
  assert.equal(presentarEstadoCasoReclamo("Completada").mensaje, "La atención fue finalizada.");
  assert.equal(presentarEstadoCasoReclamo("Cancelada").mensaje, "La solicitud fue cancelada.");
});

test("ningún texto de estado del caso expone lenguaje administrativo o técnico", () => {
  const prohibidos = ["gestión realizada", "ticket", "workflow", "caso procesado", "request", "estado pendiente"];
  for (const estado of ["Solicitud recibida", "En revisión", "Cita programada", "Completada", "Cancelada"] as const) {
    const p = presentarEstadoCasoReclamo(estado);
    const texto = `${p.etiqueta} ${p.mensaje}`.toLowerCase();
    for (const palabra of prohibidos) {
      assert.ok(!texto.includes(palabra), `"${estado}" expone "${palabra}"`);
    }
  }
});

test("la cobertura nunca se promete en los estados abiertos", () => {
  for (const estado of ["Solicitud recibida", "En revisión", "Cita programada"] as const) {
    const texto = presentarEstadoCasoReclamo(estado).mensaje.toLowerCase();
    assert.ok(!texto.includes("está cubierto") && !texto.includes("será cubierto"), estado);
  }
});

// ── Presentación de estados de cita (vocabulario distinto y exclusivo) ──

test("los 5 estados de cita tienen su propia etiqueta, distinta del vocabulario de caso", () => {
  assert.equal(presentarEstadoCitaReclamo("Por coordinar").etiqueta, "Por coordinar");
  assert.equal(presentarEstadoCitaReclamo("Cita confirmada").etiqueta, "Cita confirmada");
  assert.equal(presentarEstadoCitaReclamo("En curso").etiqueta, "En curso");
  assert.equal(presentarEstadoCitaReclamo("Completada").etiqueta, "Completada");
  assert.equal(presentarEstadoCitaReclamo("Cancelada").etiqueta, "Cancelada");
});

// ── Última actualización ─────────────────────────────────────────────

test("la última actualización responde a la cita más reciente", () => {
  const r = reclamo({
    citas: [
      cita({ id: 1, estado: "Cita confirmada", fecha: "2024-05-10T09:00:00" }),
      cita({ id: 2, estado: "Completada", fecha: "2024-05-27T11:00:00" }),
    ],
  });
  assert.equal(ultimaActualizacion(r), "2024-05-27T11:00:00");
});

test("sin citas con fecha, la última actualización cae a las fechas administrativas", () => {
  assert.equal(ultimaActualizacion(reclamo({ iniciadoEl: "2024-05-01T09:00:00" })), "2024-05-01T09:00:00");
});
