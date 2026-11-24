import test from "node:test";
import assert from "node:assert/strict";
import {
  aplicarFiltros,
  buscarSolicitudes,
  cuantasAbiertas,
  desdeElServicio,
  desdeLaGarantia,
  estadoDeGarantia,
  estadoDeServicio,
  estaActiva,
  estaFinalizada,
  ESTADOS_ACTIVOS,
  ESTADOS_SOLICITUD,
  filtrosDesdeLaDireccion,
  filtrosPuestos,
  hayFiltros,
  listarHistorial,
  ordenarSolicitudes,
  PENDIENTE_DE_MIS_SOLICITUDES,
  quitarFiltro,
  SIN_FILTROS,
  type SolicitudUnificada,
} from "../src/app/logic/misSolicitudes.ts";
import { ESTADOS_CASO_RECLAMO } from "../src/app/logic/reclamos.ts";
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
  numero: "REC-2024-0001",
  producto: "Aire acondicionado de la sala",
  citas: [],
  ...parcial,
});

const fila = (parcial: Partial<SolicitudUnificada> = {}): SolicitudUnificada => ({
  id: "x",
  tipo: "servicio",
  titulo: "Algo",
  estado: "Solicitud recibida",
  ruta: "/servicios/x",
  ...parcial,
});

test("MS · el vocabulario de estados es UNO solo en toda la app", () => {
  assert.deepEqual(
    [...ESTADOS_SOLICITUD],
    [...ESTADOS_CASO_RECLAMO],
    "si se separan, un mismo caso puede mostrar dos estados distintos",
  );
  assert.deepEqual(
    [...ESTADOS_SOLICITUD],
    ["Solicitud recibida", "En revisión", "Cita programada", "Completada", "Cancelada"],
  );
});

test("MS · el estado de un servicio sale del estado que ya tenía", () => {
  assert.equal(estadoDeServicio(servicio()), "Solicitud recibida", "sin visitas");
  assert.equal(estadoDeServicio(servicio({ cancelado: true })), "Cancelada");
  assert.equal(
    estadoDeServicio(
      servicio({ visitas: [{ id: 1, estado: "Cita confirmada", visitAt: "2026-11-20T14:00:00" }] }),
    ),
    "Cita programada",
  );
  assert.equal(
    estadoDeServicio(servicio({ visitas: [{ id: 1, estado: "Por coordinar" }] })),
    "En revisión",
  );
  assert.equal(
    estadoDeServicio(servicio({ visitas: [{ id: 1, estado: "Completada" }] })),
    "Completada",
  );
});

test("MS · el estado de UNA visita no clasifica a la solicitud entera", () => {
  // Una visita "En curso" no convierte al caso en un estado propio: para
  // quien espera, lo que hay es una cita en pie. Que esté sucediendo ahora
  // lo dice el detalle de esa visita.
  const enCurso = servicio({ visitas: [{ id: 1, estado: "En curso" }] });
  assert.equal(estadoDeServicio(enCurso), "Cita programada");
  assert.ok(ESTADOS_SOLICITUD.includes(estadoDeServicio(enCurso)));
});

test("MS · el estado de una garantía ya viene en este vocabulario", () => {
  assert.equal(estadoDeGarantia(garantia()), "Solicitud recibida");
  assert.equal(estadoDeGarantia(garantia({ cancelado: true })), "Cancelada");
  assert.equal(
    estadoDeGarantia(
      garantia({ citas: [{ id: 1, tipo: "Inspección", estado: "Cita confirmada", fecha: "2026-11-18T09:00:00" }] }),
    ),
    "Cita programada",
  );
});

test("MS · la fila lleva al detalle que ya existe, no a uno nuevo", () => {
  assert.equal(desdeElServicio(servicio({ id: "s-9" })).ruta, "/servicios/s-9");
  assert.equal(desdeLaGarantia(garantia({ id: "r-9" })).ruta, "/reclamos/r-9");
});

test("MS · la fila de garantía toma la fecha, que se llama distinto", () => {
  const f = desdeLaGarantia(
    garantia({
      codigoProducto: "SKU-7",
      citas: [
        {
          id: 1,
          tipo: "Inspección",
          estado: "Cita confirmada",
          fecha: "2026-11-18T09:00:00",
          horario: "8:00 a. m. a 12:00 p. m.",
          tecnico: "Luis Pérez",
        },
      ],
    }),
  );
  assert.equal(f.citaAt, "2026-11-18T09:00:00");
  assert.equal(f.tecnico, "Luis Pérez");
  assert.equal(f.sku, "SKU-7");
});

test("MS · activa es lo que todavía puede pasar", () => {
  for (const estado of ESTADOS_ACTIVOS) {
    assert.equal(estaActiva(fila({ estado })), true, estado);
  }
  assert.equal(estaActiva(fila({ estado: "Completada" })), false);
  assert.equal(estaActiva(fila({ estado: "Cancelada" })), false);
  assert.equal(estaFinalizada(fila({ estado: "Cancelada" })), true);
});

test("MS · los filtros recortan por estado y por tipo a la vez", () => {
  const lista = [
    fila({ id: "a", tipo: "servicio", estado: "Cita programada" }),
    fila({ id: "b", tipo: "garantia", estado: "Completada" }),
    fila({ id: "c", tipo: "garantia", estado: "En revisión" }),
  ];
  assert.equal(aplicarFiltros(lista, SIN_FILTROS).length, 3);
  assert.deepEqual(
    aplicarFiltros(lista, { estado: "activos", tipo: "todos" }).map((s) => s.id),
    ["a", "c"],
  );
  assert.deepEqual(
    aplicarFiltros(lista, { estado: "finalizados", tipo: "todos" }).map((s) => s.id),
    ["b"],
  );
  assert.deepEqual(
    aplicarFiltros(lista, { estado: "activos", tipo: "garantia" }).map((s) => s.id),
    ["c"],
    "los filtros se suman, no se reemplazan",
  );
});

test("MS · los accesos contextuales entran con su recorte puesto", () => {
  assert.deepEqual(filtrosDesdeLaDireccion("?tipo=servicios"), {
    estado: "todos",
    tipo: "servicio",
  });
  assert.deepEqual(filtrosDesdeLaDireccion("?tipo=garantias"), {
    estado: "todos",
    tipo: "garantia",
  });
  assert.deepEqual(filtrosDesdeLaDireccion("?estado=activos"), {
    estado: "activos",
    tipo: "todos",
  });
  assert.deepEqual(filtrosDesdeLaDireccion(""), SIN_FILTROS, "desde Perfil, sin filtros");
  assert.deepEqual(filtrosDesdeLaDireccion("?tipo=cualquiera"), SIN_FILTROS);
});

test("MS · cada filtro puesto es un chip que se quita solo", () => {
  const filtros = { estado: "activos" as const, tipo: "garantia" as const };
  assert.equal(hayFiltros(SIN_FILTROS), false);
  assert.equal(hayFiltros(filtros), true);
  assert.deepEqual(filtrosPuestos(SIN_FILTROS), []);
  assert.equal(filtrosPuestos(filtros).length, 2);

  const sinEstado = quitarFiltro(filtros, { dimension: "estado", valor: "activos" });
  assert.equal(sinEstado.estado, "todos");
  assert.equal(sinEstado.tipo, "garantia", "quitar uno no toca al otro");
  assert.equal(filtros.estado, "activos", "no muta el estado anterior");
});

test("MS · la búsqueda encuentra por número, por nombre y por código", () => {
  const lista = [
    fila({ id: "a", numero: "REC-2024-0892", titulo: "Aire acondicionado de la sala" }),
    fila({ id: "b", numero: "MPR-3061-1", titulo: "Instalación de lavadora", sku: "SKU-9" }),
  ];
  assert.deepEqual(buscarSolicitudes(lista, "0892").map((s) => s.id), ["a"], "un pedazo del número");
  assert.deepEqual(buscarSolicitudes(lista, "mpr-3061").map((s) => s.id), ["b"], "sin importar mayúsculas");
  assert.deepEqual(buscarSolicitudes(lista, "lavadora").map((s) => s.id), ["b"]);
  assert.deepEqual(buscarSolicitudes(lista, "sku-9").map((s) => s.id), ["b"]);
  assert.deepEqual(buscarSolicitudes(lista, "acondicionado").map((s) => s.id), ["a"]);
  assert.equal(buscarSolicitudes(lista, "   ").length, 2, "espacios no filtran");
  assert.equal(buscarSolicitudes(lista, "televisor").length, 0);
});

test("MS · lo abierto arriba, y dentro de lo abierto la cita más próxima", () => {
  const ordenadas = ordenarSolicitudes([
    fila({ id: "cerrada-nueva", estado: "Completada", citaAt: "2026-12-01T10:00:00" }),
    fila({ id: "sin-cita", estado: "Solicitud recibida", creadaEl: "2026-11-01T10:00:00" }),
    fila({ id: "lejos", estado: "Cita programada", citaAt: "2026-12-20T10:00:00" }),
    fila({ id: "cerca", estado: "Cita programada", citaAt: "2026-11-10T10:00:00" }),
  ]);
  assert.deepEqual(
    ordenadas.map((s) => s.id),
    ["cerca", "lejos", "sin-cita", "cerrada-nueva"],
  );
});

test("MS · la lista aplica filtros, búsqueda y orden a la vez", () => {
  const lista = [
    fila({ id: "a", tipo: "servicio", estado: "Completada", titulo: "Pintura interior" }),
    fila({ id: "b", tipo: "servicio", estado: "Cita programada", titulo: "Pintura exterior", citaAt: "2026-11-10T10:00:00" }),
    fila({ id: "c", tipo: "garantia", estado: "Cita programada", titulo: "Pintura de algo" }),
  ];
  assert.deepEqual(
    listarHistorial(lista, { estado: "activos", tipo: "servicio" }, "pintura").map((s) => s.id),
    ["b"],
  );
});

test("MS · el contador del acceso cuenta solo lo abierto", () => {
  assert.equal(
    cuantasAbiertas([
      fila({ estado: "Solicitud recibida" }),
      fila({ estado: "Completada" }),
      fila({ estado: "Cita programada" }),
      fila({ estado: "Cancelada" }),
    ]),
    2,
  );
});

test("MS · lo pendiente queda declarado en el código", () => {
  assert.ok(PENDIENTE_DE_MIS_SOLICITUDES.length >= 4);
  const texto = PENDIENTE_DE_MIS_SOLICITUDES.join(" ").toLowerCase();
  for (const tema of ["endpoint", "garantía", "paginado", "reprogramar", "factura"]) {
    assert.ok(texto.includes(tema), `falta declarar: ${tema}`);
  }
});
