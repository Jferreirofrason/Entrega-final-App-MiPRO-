import test from "node:test";
import assert from "node:assert/strict";
import {
  seguimientoDeLaGarantia,
  seguimientoDelServicio,
  sePuedeReagendar,
} from "../src/app/logic/seguimiento.ts";
import type { ServicioCliente } from "../src/app/logic/servicios.ts";
import type { ReclamoGarantiaCliente } from "../src/app/logic/reclamos.ts";

const servicio = (parcial: Partial<ServicioCliente> = {}): ServicioCliente => ({
  id: "s-1",
  nombre: "Instalación de aire acondicionado",
  visitas: [],
  ...parcial,
});

const garantia = (parcial: Partial<ReclamoGarantiaCliente> = {}): ReclamoGarantiaCliente => ({
  id: "r-1",
  numero: "REC-1",
  producto: "Aire acondicionado",
  citas: [],
  ...parcial,
});

const titulos = (etapas: { titulo: string }[]) => etapas.map((e) => e.titulo);

test("SG · una solicitud recién hecha muestra UNA etapa, no el camino completo", () => {
  const etapas = seguimientoDelServicio(servicio({ creadaEl: "2026-11-01T09:00:00" }));
  assert.deepEqual(titulos(etapas), ["Solicitud recibida"]);
  assert.equal(etapas[0].fecha, "2026-11-01T09:00:00");
  assert.equal(etapas[0].ultima, true, "la última es donde está el caso hoy");
});

test("SG · las etapas de un servicio se alcanzan en orden y solo si pasaron", () => {
  const enRevision = seguimientoDelServicio(
    servicio({ visitas: [{ id: 1, estado: "Por coordinar" }] }),
  );
  assert.deepEqual(titulos(enRevision), ["Solicitud recibida", "En revisión"]);
  assert.equal(enRevision[1].fecha, undefined, "no hay fecha: no se estima una");

  const agendada = seguimientoDelServicio(
    servicio({
      visitas: [{ id: 1, estado: "Cita confirmada", visitAt: "2026-11-20T14:00:00" }],
    }),
  );
  assert.deepEqual(titulos(agendada), ["Solicitud recibida", "En revisión", "Cita programada"]);
  assert.equal(agendada[2].fecha, "2026-11-20T14:00:00");
});

test("SG · un servicio terminado llega hasta el final, con sus fechas", () => {
  const etapas = seguimientoDelServicio(
    servicio({
      creadaEl: "2026-10-01T09:00:00",
      finalizadoEl: "2026-11-21T16:00:00",
      visitas: [{ id: 1, estado: "Completada", visitAt: "2026-11-20T14:00:00" }],
    }),
  );
  assert.deepEqual(titulos(etapas), [
    "Solicitud recibida",
    "En revisión",
    "Cita programada",
    "Visita realizada",
    "Servicio completado",
  ]);
  assert.equal(etapas[3].fecha, "2026-11-20T14:00:00");
  assert.equal(etapas[4].fecha, "2026-11-21T16:00:00");
  assert.equal(etapas[4].ultima, true);
});

test("SG · con una visita pendiente el servicio NO figura completado", () => {
  const etapas = seguimientoDelServicio(
    servicio({
      visitas: [
        { id: 1, estado: "Completada", visitAt: "2026-11-01T10:00:00" },
        { id: 2, estado: "Por coordinar" },
      ],
    }),
  );
  assert.ok(!titulos(etapas).includes("Servicio completado"));
});

test("SG · cancelar cierra la línea y se marca aparte", () => {
  const etapas = seguimientoDelServicio(
    servicio({ cancelado: true, canceladoEl: "2026-11-05T12:00:00" }),
  );
  assert.deepEqual(titulos(etapas), ["Solicitud recibida", "Solicitud cancelada"]);
  assert.equal(etapas[1].cancelada, true);
  assert.equal(etapas[1].fecha, "2026-11-05T12:00:00");
});

test("SG · las etapas de una garantía usan su propio vocabulario", () => {
  const etapas = seguimientoDeLaGarantia(
    garantia({
      iniciadoEl: "2026-10-01T09:00:00",
      resueltoEl: "2026-11-02T17:00:00",
      citas: [
        {
          id: 1,
          tipo: "Inspección",
          estado: "Completada",
          fecha: "2026-11-01T09:00:00",
          historial: [
            { estado: "Por coordinar", fecha: "2026-10-02T10:00:00" },
            { estado: "Cita confirmada", fecha: "2026-10-20T10:00:00" },
            { estado: "Completada", fecha: "2026-11-01T11:00:00" },
          ],
        },
      ],
    }),
  );
  assert.deepEqual(titulos(etapas), [
    "Solicitud recibida",
    "En revisión",
    "Atención coordinada",
    "Resolución registrada",
    "Solicitud completada",
  ]);
  assert.equal(etapas[2].fecha, "2026-10-20T10:00:00", "del historial, no de la cita");
  assert.equal(etapas[3].fecha, "2026-11-01T11:00:00");
});

test("SG · una garantía sin citas no inventa etapas", () => {
  assert.deepEqual(titulos(seguimientoDeLaGarantia(garantia())), ["Solicitud recibida"]);
});

test("SG · nunca aparece un evento que el modelo no tiene", () => {
  const todas = [
    ...seguimientoDelServicio(
      servicio({ visitas: [{ id: 1, estado: "En curso", visitAt: "2026-11-20T10:00:00" }] }),
    ),
    ...seguimientoDeLaGarantia(
      garantia({ citas: [{ id: 1, tipo: "Inspección", estado: "En curso", fecha: "2026-11-20T10:00:00" }] }),
    ),
  ];
  const texto = titulos(todas).join(" ").toLowerCase();
  for (const inventado of ["en camino", "asignando", "pendiente de", "próximamente"]) {
    assert.ok(!texto.includes(inventado), `apareció un evento inventado: ${inventado}`);
  }
});

test("SG · reagendar necesita un caso abierto Y una cita con fecha", () => {
  assert.equal(sePuedeReagendar({ activa: true, tieneCitaConFecha: true }), true);
  assert.equal(
    sePuedeReagendar({ activa: true, tieneCitaConFecha: false }),
    false,
    "sin cita no hay nada que mover",
  );
  assert.equal(sePuedeReagendar({ activa: false, tieneCitaConFecha: true }), false);
});
