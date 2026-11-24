import { test } from "node:test";
import assert from "node:assert/strict";
import {
  elegirCitaMasReciente,
  debeMostrarTecnico,
  debeMostrarVerMas,
  type CitaHome,
} from "../src/app/logic/citas.ts";

const base: Omit<CitaHome, "id" | "estado"> = {
  titulo: "Mantenimiento de aire acondicionado",
  fecha: "Lun 10 Mar",
  hora: "10:00 am",
};

function cita(parcial: Partial<CitaHome> & { id: number; estado: string }): CitaHome {
  return { ...base, ...parcial };
}

// ── Selección de la cita más reciente ────────────────────────────────

test("sin citas devuelve null", () => {
  assert.equal(elegirCitaMasReciente([]), null);
});

test("con una sola cita devuelve esa cita", () => {
  const unica = cita({ id: 1, estado: "En progreso", visitAt: "2026-03-10T10:00:00" });
  assert.equal(elegirCitaMasReciente([unica]), unica);
});

test("con varias citas gana la de fecha de visita más reciente, sin importar el estado", () => {
  const lista = [
    cita({ id: 1, estado: "En progreso", visitAt: "2026-03-10T10:00:00" }),
    cita({ id: 3, estado: "Cancelado", visitAt: "2026-03-12T14:30:00" }),
    cita({ id: 2, estado: "Completado", visitAt: "2026-03-09T16:00:00" }),
  ];
  assert.equal(elegirCitaMasReciente(lista)?.id, 3);
});

test("si falta visitAt en algún registro conserva el orden de la lista (comportamiento actual del listado)", () => {
  const lista = [
    cita({ id: 7, estado: "Agendado" }),
    cita({ id: 8, estado: "En progreso", visitAt: "2026-03-12T14:30:00" }),
  ];
  assert.equal(elegirCitaMasReciente(lista)?.id, 7);
});

// ── "Ver más" ────────────────────────────────────────────────────────

test("Ver más: oculto con cero o una cita, visible con dos o más", () => {
  assert.equal(debeMostrarVerMas(0), false);
  assert.equal(debeMostrarVerMas(1), false);
  assert.equal(debeMostrarVerMas(2), true);
  assert.equal(debeMostrarVerMas(5), true);
});

// ── Visibilidad del técnico por estado ───────────────────────────────

test("estados sin técnico: Pendiente sincronizar y Solicitud recibida lo ocultan aunque el dato venga", () => {
  for (const estado of ["Pendiente sincronizar", "Solicitud recibida"]) {
    assert.equal(
      debeMostrarTecnico(cita({ id: 1, estado, tecnico: "Luis Herrera" })),
      false,
      estado,
    );
  }
});

test("estados con técnico: Visita coordinada, En progreso y Completado lo muestran si viene asignado", () => {
  for (const estado of ["Visita coordinada", "En progreso", "Completado"]) {
    assert.equal(
      debeMostrarTecnico(cita({ id: 1, estado, tecnico: "Luis Herrera" })),
      true,
      estado,
    );
  }
});

test("estados con técnico pero sin dato asignado no muestran nada", () => {
  assert.equal(debeMostrarTecnico(cita({ id: 1, estado: "Visita coordinada" })), false);
  assert.equal(debeMostrarTecnico(cita({ id: 1, estado: "En progreso", tecnico: "  " })), false);
});

test("vocabulario del modelo existente: Coordinado, Agendado, En camino y Finalizado también muestran técnico", () => {
  for (const estado of ["Coordinado", "Agendado", "En camino", "Finalizado"]) {
    assert.equal(
      debeMostrarTecnico(cita({ id: 1, estado, tecnico: "Juan Pérez" })),
      true,
      estado,
    );
  }
});

test("cancelada que llegó a tener técnico asignado lo muestra", () => {
  const c = cita({
    id: 1,
    estado: "Cancelado",
    tecnico: "Juan Pérez",
    tuvoTecnicoAsignado: true,
  });
  assert.equal(debeMostrarTecnico(c), true);
});

test("cancelada sin técnico previo no lo muestra, aunque el registro traiga un nombre", () => {
  const c = cita({
    id: 1,
    estado: "Cancelado",
    tecnico: "Juan Pérez",
    tuvoTecnicoAsignado: false,
  });
  assert.equal(debeMostrarTecnico(c), false);
});

test("cancelada sin el flag del contrato: se aproxima con la presencia del técnico (gap documentado)", () => {
  assert.equal(
    debeMostrarTecnico(cita({ id: 1, estado: "Cancelado", tecnico: "Juan Pérez" })),
    true,
  );
  assert.equal(debeMostrarTecnico(cita({ id: 1, estado: "Cancelado" })), false);
});

// ── Vocabulario exacto del seguimiento por estados (ej. "Inspección de
// aire acondicionado"): Por coordinar → Cita confirmada → En curso →
// Completado, con Cancelado como rama opcional. ─────────────────────

test("Por coordinar oculta el técnico aunque el dato venga", () => {
  assert.equal(
    debeMostrarTecnico(cita({ id: 1, estado: "Por coordinar", tecnico: "Juan Pérez" })),
    false,
  );
});

test("Cita confirmada y En curso muestran el técnico asignado", () => {
  for (const estado of ["Cita confirmada", "En curso"]) {
    assert.equal(
      debeMostrarTecnico(cita({ id: 1, estado, tecnico: "Juan Pérez" })),
      true,
      estado,
    );
  }
});

test("estado desconocido nunca muestra técnico", () => {
  assert.equal(
    debeMostrarTecnico(cita({ id: 1, estado: "Otro estado", tecnico: "Juan Pérez" })),
    false,
  );
});
