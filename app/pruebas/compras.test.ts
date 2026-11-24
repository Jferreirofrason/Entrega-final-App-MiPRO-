import test from "node:test";
import assert from "node:assert/strict";
import {
  buscarProductos,
  comercioParaGarantia,
  compraCompleta,
  contextoDeCompra,
  cuantosPorTienda,
  datosDeCompraQueFaltan,
  esComprado,
  esManual,
  fechaDeOrden,
  alternar,
  anioDeCompra,
  aplicarEdicion,
  edicionDesdeProducto,
  puedeEditarse,
  validarEdicionManual,
  aplicarFiltros,
  cuantosFiltros,
  filtrosPuestos,
  hayFiltros,
  opcionesDeFiltro,
  quitarFiltro,
  SIN_FILTROS,
  formatearFechaDeCompra,
  hayManuales,
  listarMisProductos,
  ordenarPorFecha,
  PENDIENTE_DE_LAS_COMPRAS,
  productoSolicitudDesdeCompra,
  puedeSolicitarGarantia,
  puedeSolicitarServicio,
  servicioCompatibleUnico,
  tipoDeGarantia,
  TIENDAS,
  type ProductoPropio,
} from "../src/app/logic/compras.ts";
import { COMPRAS_DEMO } from "../src/app/data/compras.ts";
import { buscarServicioCatalogo } from "../src/app/data/catalogo.ts";

const compra = (parcial: Partial<ProductoPropio> = {}): ProductoPropio => ({
  id: "c-1",
  source: "purchase",
  name: "Aire acondicionado Panasonic",
  sku: "NOV-1",
  image: "x",
  store: "Novey",
  purchaseDate: "2025-10-12",
  invoiceNumber: "FAC-1",
  brand: "Panasonic",
  category: "Aires acondicionados",
  serviceEligible: true,
  eligibleServiceIds: ["mantenimiento-aire"],
  ...parcial,
});

/** Lo que de verdad se sabe de un producto cargado a mano: poco. */
const manual = (parcial: Partial<ProductoPropio> = {}): ProductoPropio => ({
  id: "m-1",
  source: "manual",
  name: "Aire acondicionado de la sala",
  brand: "Panasonic",
  category: "Aire Acondicionado",
  serviceEligible: false,
  ...parcial,
});

test("CP · la fecha de compra se muestra como pide el pedido", () => {
  assert.equal(formatearFechaDeCompra("2025-10-12"), "12 oct. 2025");
  assert.equal(formatearFechaDeCompra("2024-05-01"), "1 may. 2024");
  assert.equal(formatearFechaDeCompra(undefined), null);
  assert.equal(formatearFechaDeCompra("sin fecha"), null);
  assert.equal(formatearFechaDeCompra("2025-13-02"), null, "mes inválido");
});

test("CP · las dos procedencias se distinguen", () => {
  assert.equal(esComprado(compra()), true);
  assert.equal(esManual(compra()), false);
  assert.equal(esManual(manual()), true);
  assert.equal(hayManuales([compra()]), false, "sin manuales no hay filtro que dibujar");
  assert.equal(hayManuales([compra(), manual()]), true);
});

test("CP · la acción de servicio solo aparece con un servicio compatible", () => {
  assert.equal(puedeSolicitarServicio(compra()), true);
  assert.equal(
    puedeSolicitarServicio(compra({ serviceEligible: false, eligibleServiceIds: undefined })),
    false,
  );
  assert.equal(
    puedeSolicitarServicio(compra({ serviceEligible: true, eligibleServiceIds: [] })),
    false,
    "elegible pero sin servicios: no se ofrece un flujo que no lleva a nada",
  );
  assert.equal(puedeSolicitarServicio(manual()), false);
});

test("CP · la garantía está en todos los productos, también en los cargados a mano", () => {
  assert.equal(puedeSolicitarGarantia(compra()), true);
  assert.equal(
    puedeSolicitarGarantia(manual()),
    true,
    "que falten datos no esconde la puerta: se piden en el formulario",
  );
  assert.equal(puedeSolicitarGarantia(compra({ warrantyEligible: false })), false);
});

test("CP · la búsqueda encuentra por nombre, por SKU y sin acentos", () => {
  const lista = [
    compra({ id: "a", name: "Aire acondicionado Panasonic", sku: "NOV-412938" }),
    compra({ id: "b", name: "Colchón Queen", sku: "NOV-503117", brand: "Spring Air" }),
    manual({ id: "c", name: "Abanico de techo", brand: undefined, category: undefined }),
  ];
  assert.deepEqual(buscarProductos(lista, "NOV-5031").map((p) => p.id), ["b"], "por SKU");
  assert.deepEqual(buscarProductos(lista, "colchon").map((p) => p.id), ["b"], "sin acento");
  assert.deepEqual(buscarProductos(lista, "COLCHÓN").map((p) => p.id), ["b"], "en mayúsculas");
  assert.deepEqual(buscarProductos(lista, "panasonic").map((p) => p.id), ["a"], "por marca");
  assert.deepEqual(
    buscarProductos(lista, "abanico").map((p) => p.id),
    ["c"],
    "un producto sin SKU ni marca también se encuentra",
  );
  assert.equal(buscarProductos(lista, "   ").length, 3, "espacios no filtran");
  assert.equal(buscarProductos(lista, "televisor").length, 0);
});

test("CP · los filtros recortan por procedencia, tienda, categoría y año", () => {
  const lista = [
    compra({ id: "a", store: "Novey", category: "Aires acondicionados", purchaseDate: "2025-10-12" }),
    compra({ id: "b", store: "Cochez", category: "Lavadoras", purchaseDate: "2024-11-28" }),
    compra({ id: "c", store: "Kohler", category: "Grifería", purchaseDate: "2025-06-21" }),
    manual({ id: "d", comercioDeclarado: "Novey", category: "Aire Acondicionado" }),
  ];

  assert.equal(aplicarFiltros(lista, SIN_FILTROS).length, 4, "sin filtros no se recorta nada");
  assert.deepEqual(
    aplicarFiltros(lista, { ...SIN_FILTROS, origen: "purchase" }).map((p) => p.id),
    ["a", "b", "c"],
  );
  assert.deepEqual(
    aplicarFiltros(lista, { ...SIN_FILTROS, origen: "manual" }).map((p) => p.id),
    ["d"],
  );
  assert.deepEqual(
    aplicarFiltros(lista, { ...SIN_FILTROS, tiendas: ["Novey"] }).map((p) => p.id),
    ["a"],
    "lo que la persona escribió como comercio no es una compra en Novey",
  );
  assert.deepEqual(
    aplicarFiltros(lista, { ...SIN_FILTROS, tiendas: ["Novey", "Kohler"] }).map((p) => p.id),
    ["a", "c"],
    "la tienda admite varias a la vez",
  );
  assert.deepEqual(
    aplicarFiltros(lista, { ...SIN_FILTROS, categorias: ["Lavadoras"] }).map((p) => p.id),
    ["b"],
  );
  assert.deepEqual(
    aplicarFiltros(lista, { ...SIN_FILTROS, anios: [2025] }).map((p) => p.id),
    ["a", "c"],
    "sin fecha de compra no hay año: el cargado a mano queda afuera",
  );
  assert.deepEqual(
    aplicarFiltros(lista, { ...SIN_FILTROS, tiendas: ["Novey"], anios: [2024] }).map((p) => p.id),
    [],
    "los filtros se suman, no se reemplazan",
  );
});

test("CP · sin filtros es sin filtros, no 'todas las opciones'", () => {
  assert.equal(hayFiltros(SIN_FILTROS), false);
  assert.equal(cuantosFiltros(SIN_FILTROS), 0);
  const puestos = { ...SIN_FILTROS, origen: "manual" as const, tiendas: ["Novey" as const], anios: [2025] };
  assert.equal(hayFiltros(puestos), true);
  assert.equal(cuantosFiltros(puestos), 3, "el número que lleva el ícono");
});

test("CP · el año de compra sale de la fecha, y solo de ahí", () => {
  assert.equal(anioDeCompra(compra({ purchaseDate: "2025-10-12" })), 2025);
  assert.equal(anioDeCompra(manual()), null, "un cargado a mano no tiene año de compra");
  assert.equal(anioDeCompra(compra({ purchaseDate: "sin fecha" })), null);
});

test("CP · las opciones del panel salen de los datos", () => {
  const lista = [
    compra({ id: "a", store: "Novey", category: "Aires acondicionados", purchaseDate: "2025-10-12" }),
    compra({ id: "b", store: "Cochez", category: "Lavadoras", purchaseDate: "2024-11-28" }),
    manual({ id: "c", category: "Aire Acondicionado" }),
  ];
  const o = opcionesDeFiltro(lista);
  assert.equal(o.conProcedencia, true);
  assert.deepEqual(o.tiendas, ["Novey", "Cochez"], "Kohler no tiene nada: no se ofrece");
  assert.deepEqual(o.anios, [2025, 2024], "el más reciente primero");
  assert.ok(o.categorias.includes("Lavadoras"));

  assert.equal(
    opcionesDeFiltro([compra({ store: "Novey" })]).conProcedencia,
    false,
    "sin nada cargado a mano, separar por procedencia no separa nada",
  );

  // Ninguna opción puede abrir una lista vacía: esa es la regla.
  for (const t of o.tiendas) {
    assert.ok(aplicarFiltros(lista, { ...SIN_FILTROS, tiendas: [t] }).length > 0);
  }
  for (const a of o.anios) {
    assert.ok(aplicarFiltros(lista, { ...SIN_FILTROS, anios: [a] }).length > 0);
  }
  for (const c of o.categorias) {
    assert.ok(aplicarFiltros(lista, { ...SIN_FILTROS, categorias: [c] }).length > 0);
  }
});

test("CP · cada filtro puesto es un chip que se puede quitar solo", () => {
  const filtros = {
    origen: "purchase" as const,
    tiendas: ["Novey" as const, "Cochez" as const],
    categorias: ["Lavadoras"],
    anios: [2025],
  };
  const puestos = filtrosPuestos(filtros);
  assert.equal(puestos.length, cuantosFiltros(filtros));
  assert.deepEqual(puestos[0], { tipo: "origen", valor: "purchase" });

  // Quitar uno no toca a los demás.
  const sinCochez = quitarFiltro(filtros, { tipo: "tienda", valor: "Cochez" });
  assert.deepEqual(sinCochez.tiendas, ["Novey"]);
  assert.deepEqual(sinCochez.categorias, ["Lavadoras"]);
  assert.equal(sinCochez.origen, "purchase");

  assert.equal(quitarFiltro(filtros, { tipo: "origen", valor: "purchase" }).origen, "todos");
  assert.deepEqual(quitarFiltro(filtros, { tipo: "anio", valor: 2025 }).anios, []);
  // Y no muta el estado anterior.
  assert.equal(filtros.tiendas.length, 2);
});

test("CP · alternar pone y saca el mismo valor", () => {
  assert.deepEqual(alternar(["Novey"], "Cochez"), ["Novey", "Cochez"]);
  assert.deepEqual(alternar(["Novey", "Cochez"], "Novey"), ["Cochez"]);
});

test("CP · lo más reciente va arriba, venga de una compra o de un alta", () => {
  const lista = [
    compra({ id: "vieja", purchaseDate: "2024-05-17" }),
    manual({ id: "cargada", addedAt: "2026-01-04" }),
    compra({ id: "nueva", purchaseDate: "2025-10-12" }),
  ];
  assert.deepEqual(ordenarPorFecha(lista).map((p) => p.id), ["cargada", "nueva", "vieja"]);
  assert.equal(lista[0].id, "vieja", "el orden no muta la lista original");
  assert.equal(fechaDeOrden(manual({ addedAt: "2026-01-04" })), "2026-01-04");
  assert.equal(fechaDeOrden(manual()), "", "sin fecha, al final");
});

test("CP · el listado aplica filtros, búsqueda y orden a la vez", () => {
  const lista = [
    compra({ id: "a", store: "Novey", name: "Aire", purchaseDate: "2024-01-01" }),
    compra({ id: "b", store: "Novey", name: "Aire grande", purchaseDate: "2025-01-01" }),
    compra({ id: "c", store: "Cochez", name: "Aire chico", purchaseDate: "2026-01-01" }),
    manual({ id: "d", name: "Aire a mano" }),
  ];
  assert.deepEqual(
    listarMisProductos(lista, { ...SIN_FILTROS, tiendas: ["Novey"] }, "aire").map((p) => p.id),
    ["b", "a"],
  );
  assert.deepEqual(
    listarMisProductos(lista, { ...SIN_FILTROS, origen: "manual" }, "aire").map((p) => p.id),
    ["d"],
  );
  assert.deepEqual(
    listarMisProductos(lista, { ...SIN_FILTROS, origen: "purchase" }, "aire").map((p) => p.id),
    ["c", "b", "a"],
  );
});

test("CP · se declara qué dato de compra falta, no se inventa", () => {
  assert.deepEqual(datosDeCompraQueFaltan(compra()), []);
  assert.equal(compraCompleta(compra()), true);

  const sinFactura = compra({ invoiceNumber: "   ", brand: undefined });
  assert.deepEqual(datosDeCompraQueFaltan(sinFactura), ["invoiceNumber", "brand"]);
  assert.equal(compraCompleta(sinFactura), false);

  // De un producto cargado a mano falta todo lo de la compra, y está bien.
  assert.deepEqual(datosDeCompraQueFaltan(manual()), [
    "invoiceNumber",
    "purchaseDate",
    "store",
    "sku",
  ]);
});

test("CP · el tipo del formulario de garantía sale de una lista válida", () => {
  assert.equal(tipoDeGarantia("Aires acondicionados"), "Aire acondicionado");
  assert.equal(tipoDeGarantia("Aire Acondicionado"), "Aire acondicionado", "el alta a mano");
  assert.equal(tipoDeGarantia("Grifería"), "Otro", "sin equivalente, la opción honesta");
  assert.equal(tipoDeGarantia(undefined), undefined);
  assert.equal(
    tipoDeGarantia("Categoría que nadie mapeó"),
    "Categoría que nadie mapeó",
    "lo que no está en la tabla pasa tal cual: no se inventa un tipo",
  );
});

test("CP · el comercio de un producto cargado a mano solo se precarga si es real", () => {
  assert.equal(comercioParaGarantia(compra({ store: "Cochez" })), "Cochez");
  assert.equal(comercioParaGarantia(manual({ comercioDeclarado: "Novey" })), "Novey");
  assert.equal(
    comercioParaGarantia(manual({ comercioDeclarado: "Desconocida" })),
    undefined,
    "un relleno del formulario viejo no es un comercio",
  );
  assert.equal(comercioParaGarantia(manual({ comercioDeclarado: undefined })), undefined);
});

test("CP · la precarga de garantía de una compra trae todo lo que el paso 1 pide", () => {
  const p = productoSolicitudDesdeCompra(
    compra({ id: "c-3", category: "Lavadoras", ticketNumber: "TK-1" }),
  );
  assert.equal(p.registradoId, "c-3", "sin esto el paso 1 vuelve a pedir todo");
  assert.equal(p.tipo, "Lavadora");
  assert.equal(p.numeroFactura, "FAC-1");
  assert.equal(p.codigoProducto, "NOV-1");
  assert.equal(p.comercio, "Novey");
  assert.equal(p.compraOriginal?.numeroTicket, "TK-1");
  assert.equal(p.compraOriginal?.sku, "NOV-1");
});

test("CP · un producto cargado a mano NO entra como registrado al formulario", () => {
  const p = productoSolicitudDesdeCompra(manual({ serialNumber: "PN-9" }));
  assert.equal(
    p.registradoId,
    undefined,
    "con registradoId el formulario daría por buenos datos que no existen",
  );
  assert.equal(p.compraOriginal, undefined, "no hay compra que conservar");
  assert.equal(p.numeroFactura, undefined);
  assert.equal(p.fechaCompra, undefined);
  assert.equal(p.codigoProducto, undefined);
  // Lo que sí se sabe, se precarga: no se le vuelve a pedir.
  assert.equal(p.nombre, "Aire acondicionado de la sala");
  assert.equal(p.marca, "Panasonic");
  assert.equal(p.tipo, "Aire acondicionado");
  assert.equal(p.serie, "PN-9");
});

test("CP · el contexto que viaja al servicio dice de dónde salió el producto", () => {
  const ctx = contextoDeCompra(compra({ id: "c-9" }));
  assert.equal(ctx.productoId, "c-9");
  assert.equal(ctx.origen, "purchase");
  assert.equal(ctx.sku, "NOV-1");
  assert.equal(ctx.tienda, "Novey");
  assert.equal(ctx.marca, "Panasonic");
  assert.equal(ctx.fechaCompra, "2025-10-12");

  const aMano = contextoDeCompra(manual());
  assert.equal(aMano.origen, "manual");
  assert.equal(aMano.sku, undefined);
  assert.equal(aMano.tienda, undefined);
  assert.equal(aMano.fechaCompra, undefined);
});

test("CP · con un solo servicio compatible el flujo arranca directo", () => {
  assert.equal(servicioCompatibleUnico(compra()), "mantenimiento-aire");
  assert.equal(
    servicioCompatibleUnico(compra({ eligibleServiceIds: ["a", "b"] })),
    null,
    "con dos, elige la persona",
  );
  assert.equal(servicioCompatibleUnico(compra({ eligibleServiceIds: [] })), null);
});

test("CP · los fixtures cubren los casos que pide el pedido", () => {
  const cuenta = cuantosPorTienda(COMPRAS_DEMO);
  for (const tienda of TIENDAS) {
    assert.ok(cuenta[tienda] > 0, `falta una compra de ${tienda}`);
  }
  assert.ok(
    COMPRAS_DEMO.some((p) => p.store === "Novey" && puedeSolicitarServicio(p) && puedeSolicitarGarantia(p)),
    "Novey con garantía y servicio",
  );
  assert.ok(
    COMPRAS_DEMO.some((p) => p.store === "Cochez" && puedeSolicitarServicio(p) && puedeSolicitarGarantia(p)),
    "Cochez con garantía y servicio",
  );
  assert.ok(
    COMPRAS_DEMO.some((p) => p.store === "Kohler" && !puedeSolicitarServicio(p) && puedeSolicitarGarantia(p)),
    "Kohler solo con garantía",
  );
  assert.ok(COMPRAS_DEMO.some((p) => !puedeSolicitarServicio(p)), "una compra sin servicio elegible");
  const fechas = new Set(COMPRAS_DEMO.map((p) => p.purchaseDate));
  assert.ok(fechas.size >= 4, "fechas distintas para probar búsqueda y orden");
});

test("CP · toda compra trae los datos que el flujo de garantía pide", () => {
  for (const p of COMPRAS_DEMO) {
    assert.equal(p.source, "purchase");
    assert.deepEqual(
      datosDeCompraQueFaltan(p),
      [],
      `${p.id} dejaría a la persona escribiendo datos de compra`,
    );
  }
});

test("CP · los servicios compatibles existen en el catálogo", () => {
  for (const p of COMPRAS_DEMO) {
    for (const id of p.eligibleServiceIds ?? []) {
      assert.ok(buscarServicioCatalogo(id), `${p.id} apunta a un servicio que no existe: ${id}`);
    }
  }
});

test("CP · solo se edita lo que cargó la persona", () => {
  assert.equal(puedeEditarse(manual()), true);
  assert.equal(
    puedeEditarse(compra()),
    false,
    "los datos de una compra vienen del comercio: pisarlos acá no corrige la factura",
  );
});

test("CP · la edición arranca con lo que el producto ya tiene", () => {
  const e = edicionDesdeProducto(manual({ brand: "Panasonic", serialNumber: "PN-9" }));
  assert.equal(e.name, "Aire acondicionado de la sala");
  assert.equal(e.brand, "Panasonic");
  assert.equal(e.serialNumber, "PN-9");
  assert.equal(e.modelo, "", "lo que no está llega vacío, no como undefined");
});

test("CP · el nombre es el único dato que no puede faltar", () => {
  const base = edicionDesdeProducto(manual());
  assert.deepEqual(validarEdicionManual(base), []);
  assert.deepEqual(validarEdicionManual({ ...base, brand: "", modelo: "", serialNumber: "" }), []);
  assert.equal(validarEdicionManual({ ...base, name: "   " }).length, 1);
});

test("CP · guardar un campo vacío BORRA el dato, no lo deja como estaba", () => {
  const p = manual({ brand: "Panasonic", modelo: "XR-10", serialNumber: "PN-9" });
  const corregido = aplicarEdicion(p, {
    name: "  Aire del cuarto  ",
    brand: "",
    category: "Aire Acondicionado",
    modelo: "XR-11",
    serialNumber: "",
  });
  assert.equal(corregido.name, "Aire del cuarto", "se recortan los espacios");
  assert.equal(corregido.brand, undefined, "vaciar la marca la borra");
  assert.equal(corregido.serialNumber, undefined);
  assert.equal(corregido.modelo, "XR-11");
  assert.equal(corregido.category, "Aire Acondicionado");
  // Lo que no es editable no se toca.
  assert.equal(corregido.source, "manual");
  assert.equal(corregido.id, p.id);
  assert.equal(p.brand, "Panasonic", "no muta el original");
});

test("CP · lo pendiente del negocio queda declarado en el código", () => {
  assert.ok(PENDIENTE_DE_LAS_COMPRAS.length >= 4);
  const texto = PENDIENTE_DE_LAS_COMPRAS.join(" ").toLowerCase();
  for (const tema of ["compras", "devolución", "vigencia"]) {
    assert.ok(texto.includes(tema), `falta declarar: ${tema}`);
  }
});
