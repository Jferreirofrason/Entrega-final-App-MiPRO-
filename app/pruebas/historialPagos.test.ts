import test from "node:test";
import assert from "node:assert/strict";
import {
  agruparPorMes,
  claveDelMes,
  desdeElComprobante,
  estadoDesdeElCobro,
  nombreDelMes,
  PENDIENTE_DEL_HISTORIAL,
  type PagoDelHistorial,
} from "../src/app/logic/historialPagos.ts";
import { PAGOS_DEMO } from "../src/app/data/historialPagos.ts";

const pago = (id: string, pagadoEl: string): PagoDelHistorial => ({
  id,
  servicio: "Servicio",
  pagadoEl,
  numeroReserva: "MPR-1000-1",
  monto: 10,
  estado: "aprobado",
  medio: "Visa •••• 4242",
});

test("HP · el mes se agrupa por números, no por el nombre", () => {
  assert.equal(claveDelMes("2026-10-14T09:00:00.000Z"), "2026-10");
  assert.equal(claveDelMes("2026-09-30T23:00:00.000Z").slice(0, 4), "2026");
  assert.equal(nombreDelMes("2026-10"), "Octubre 2026");
  assert.equal(nombreDelMes("2026-09"), "Septiembre 2026");
});

test("HP · los meses van del más nuevo al más viejo, y los pagos adentro también", () => {
  const grupos = agruparPorMes([
    pago("viejo", "2026-09-02T10:00:00.000Z"),
    pago("nuevo", "2026-10-20T10:00:00.000Z"),
    pago("medio", "2026-10-02T10:00:00.000Z"),
  ]);
  assert.deepEqual(
    grupos.map((g) => g.clave),
    ["2026-10", "2026-09"],
  );
  assert.deepEqual(
    grupos[0].pagos.map((p) => p.id),
    ["nuevo", "medio"],
  );
  assert.deepEqual(
    grupos[1].pagos.map((p) => p.id),
    ["viejo"],
  );
});

test("HP · sin pagos no hay grupos", () => {
  assert.deepEqual(agruparPorMes([]), []);
});

test("HP · un cobro que no se aprobó queda pendiente, no rechazado", () => {
  assert.equal(estadoDesdeElCobro("aprobado"), "aprobado");
  assert.equal(estadoDesdeElCobro("rechazado"), "pendiente");
  assert.equal(estadoDesdeElCobro("validacion-pendiente"), "pendiente");
  assert.equal(estadoDesdeElCobro("error-conexion"), "pendiente");
});

test("HP · la línea del historial conserva el medio enmascarado y su detalle", () => {
  const linea = desdeElComprobante(
    {
      tipo: "credito-cmf",
      medio: "Crédito CMF",
      detalleMedio: "CMF Clásica •••• 7788 · 3 cuotas de $15",
      monto: 45,
      autorizacion: "AUT-ABC123",
      confirmadoEl: "2026-10-14T12:00:00.000Z",
      resultado: "aprobado",
    },
    { id: "s-1", servicio: "Lavadora", numeroReserva: "MPR-7857-8", direccion: "Calle 50" },
  );
  assert.equal(linea.estado, "aprobado");
  assert.equal(linea.medio, "Crédito CMF");
  assert.equal(linea.detalleMedio, "CMF Clásica •••• 7788 · 3 cuotas de $15");
  assert.equal(linea.numeroReserva, "MPR-7857-8");
  assert.equal(linea.direccion, "Calle 50");
});

test("HP · ningún pago de la demo muestra un número de tarjeta completo", () => {
  for (const p of PAGOS_DEMO) {
    const texto = `${p.medio} ${p.detalleMedio ?? ""}`;
    assert.ok(!/\d{7,}/.test(texto.replace(/\s/g, "")), `medio con demasiados dígitos: ${texto}`);
  }
});

test("HP · la demo tiene más de un mes y más de un estado", () => {
  const grupos = agruparPorMes(PAGOS_DEMO);
  assert.ok(grupos.length >= 2, "con un solo mes no se ve la agrupación");
  const estados = new Set(PAGOS_DEMO.map((p) => p.estado));
  assert.ok(estados.size >= 2, "hace falta más de un estado para mostrarlos");
});

test("HP · lo pendiente del historial queda declarado en el código", () => {
  assert.ok(PENDIENTE_DEL_HISTORIAL.length >= 3);
  const texto = PENDIENTE_DEL_HISTORIAL.join(" ").toLowerCase();
  for (const tema of ["endpoint", "reembolsado", "comprobante"]) {
    assert.ok(texto.includes(tema), `falta declarar: ${tema}`);
  }
});
