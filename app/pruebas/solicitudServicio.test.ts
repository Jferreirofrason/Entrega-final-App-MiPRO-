import { test } from "node:test";
import assert from "node:assert/strict";
import type {
  BorradorServicio,
  DireccionNueva,
} from "../src/app/logic/solicitudServicio.ts";
import {
  BLOQUES_HORARIOS,
  CANTIDAD_MAXIMA,
  CANTIDAD_MINIMA,
  borradorInicial,
  cantidadValida,
  concatenarDireccion,
  etiquetaBloque,
  listaParaConfirmar,
  progresoDeEtapa,
  totalConAdicionales,
  totalEstimado,
  validarConfiguracion,
  validarContacto,
  validarDireccion,
  validarDireccionNueva,
  validarFecha,
} from "../src/app/logic/solicitudServicio.ts";

const HOY = "2026-08-28";

function direccion(parcial?: Partial<DireccionNueva>): DireccionNueva {
  return {
    alias: "Casa",
    provincia: "Panamá",
    distrito: "Panamá",
    corregimiento: "Bella Vista",
    barrio: "El Cangrejo",
    calle: "Calle 50",
    casa: "Edificio Global Bank",
    edificio: "Torre A",
    piso: "12",
    numero: "12B",
    detalles: "Portón negro, al lado de la farmacia",
    ...parcial,
  };
}

function borradorCompleto(parcial?: Partial<BorradorServicio>): BorradorServicio {
  return {
    ...borradorInicial("instalacion-aire"),
    direccionId: "casa",
    fechaPreferida: "2026-09-05",
    bloque: "manana",
    ...parcial,
  };
}

// ── Cantidad y total estimado ────────────────────────────────────────

test("la cantidad válida va del mínimo al máximo, en enteros", () => {
  assert.equal(cantidadValida(CANTIDAD_MINIMA), true);
  assert.equal(cantidadValida(CANTIDAD_MAXIMA), true);
  assert.equal(cantidadValida(0), false);
  assert.equal(cantidadValida(CANTIDAD_MAXIMA + 1), false);
  assert.equal(cantidadValida(2.5), false);
});

test("el total estimado es precio base por cantidad", () => {
  assert.equal(totalEstimado(175, 2), 350);
  assert.equal(totalEstimado(175, 1), 175);
});

test("sin precio base no hay total: el precio se confirma al cotizar", () => {
  assert.equal(totalEstimado(undefined, 2), null);
});

test("los adicionales con precio real se suman al total estimado", () => {
  assert.equal(totalConAdicionales(175, 2, 25), 375);
  assert.equal(totalConAdicionales(175, 1, undefined), 175);
});

test("sin precio base, el adicional no inventa un total", () => {
  assert.equal(totalConAdicionales(undefined, 1, 25), null);
});

test("una cantidad inválida tampoco produce total", () => {
  assert.equal(totalEstimado(175, 0), null);
});

test("una configuración con cantidad fuera de rango se reporta", () => {
  const b = { ...borradorInicial("x"), cantidad: 0 };
  assert.equal(validarConfiguracion(b).length, 1);
  assert.equal(validarConfiguracion(borradorInicial("x")).length, 0);
});

// ── Dirección ────────────────────────────────────────────────────────

test("la dirección nueva exige TODOS sus campos", () => {
  assert.deepEqual(validarDireccionNueva(direccion()), []);

  // Cualquiera que falte deja la dirección incompleta, uno por uno.
  const campos: (keyof DireccionNueva)[] = [
    "alias", "provincia", "distrito", "corregimiento", "barrio",
    "calle", "casa", "edificio", "piso", "numero", "detalles",
  ];
  for (const campo of campos) {
    assert.equal(
      validarDireccionNueva(direccion({ [campo]: " " })).length,
      1,
      `"${campo}" tendría que ser obligatorio`,
    );
  }

  // Un formulario vacío reporta los once, no uno.
  const vacia = Object.fromEntries(campos.map((c) => [c, ""])) as DireccionNueva;
  assert.equal(validarDireccionNueva(vacia).length, campos.length);
});

test("el contacto alternativo sigue siendo lo único opcional del flujo", () => {
  // La dirección pasó a exigir todo; agregar otra persona no.
  assert.deepEqual(validarContacto(undefined), []);
  assert.deepEqual(validarContacto({ nombre: "", telefono: "" }), []);
});

test("la dirección concatenada va de lo particular a lo general", () => {
  assert.equal(
    concatenarDireccion(direccion()),
    "Calle 50, Edificio Global Bank, Torre A, Piso 12, 12B, El Cangrejo, Bella Vista, Panamá, Panamá",
  );
});

test("la concatenación sigue tolerando campos vacíos", () => {
  // El formulario ya no deja guardar una dirección incompleta, pero la
  // función también arma direcciones que vienen de sesiones anteriores:
  // si algún campo llega vacío, se omite en vez de dejar comas sueltas.
  assert.equal(
    concatenarDireccion(direccion({ edificio: "", piso: "", numero: "", barrio: "" })),
    "Calle 50, Edificio Global Bank, Bella Vista, Panamá, Panamá",
  );
});

test("la etapa de dirección acepta una guardada o una nueva válida", () => {
  assert.deepEqual(validarDireccion(borradorCompleto()), []);
  assert.equal(validarDireccion(borradorInicial("x")).length, 1);
  assert.deepEqual(
    validarDireccion({ ...borradorInicial("x"), direccionNueva: direccion() }),
    [],
  );
});

// ── Contacto alternativo (opcional, pero completo si se usa) ─────────

test("el contacto vacío es válido: es opcional", () => {
  assert.deepEqual(validarContacto(undefined), []);
  assert.deepEqual(validarContacto({ nombre: "", telefono: "" }), []);
});

test("un contacto a medias pide el dato que falta", () => {
  assert.equal(validarContacto({ nombre: "Ana", telefono: "" }).length, 1);
  assert.equal(validarContacto({ nombre: "", telefono: "6000-0000" }).length, 1);
  assert.deepEqual(validarContacto({ nombre: "Ana", telefono: "6000-0000" }), []);
});

// ── Fecha y bloque preferidos ────────────────────────────────────────

test("la fecha preferida debe ser a partir de mañana", () => {
  assert.deepEqual(validarFecha(borradorCompleto(), HOY), []);
  assert.equal(validarFecha(borradorCompleto({ fechaPreferida: HOY }), HOY).length, 1);
  assert.equal(validarFecha(borradorCompleto({ fechaPreferida: "2026-08-01" }), HOY).length, 1);
});

test("sin fecha o sin bloque no se puede continuar", () => {
  assert.equal(validarFecha(borradorCompleto({ fechaPreferida: undefined }), HOY).length, 1);
  assert.equal(validarFecha(borradorCompleto({ bloque: undefined }), HOY).length, 1);
});

test("los bloques horarios son mañana y tarde, con etiqueta cotidiana", () => {
  assert.equal(BLOQUES_HORARIOS.length, 2);
  assert.equal(etiquetaBloque("manana"), "En la mañana");
  assert.equal(etiquetaBloque("tarde"), "En la tarde");
  assert.equal(etiquetaBloque(undefined), null);
});

// ── Confirmación ─────────────────────────────────────────────────────

test("solo un borrador completo queda listo para confirmar", () => {
  assert.equal(listaParaConfirmar(borradorCompleto(), HOY), true);
  assert.equal(listaParaConfirmar(borradorInicial("x"), HOY), false);
  assert.equal(
    listaParaConfirmar(borradorCompleto({ contacto: { nombre: "Ana", telefono: "" } }), HOY),
    false,
  );
});

test("el progreso comunica el paso actual sobre cuatro", () => {
  assert.equal(progresoDeEtapa(1).texto, "Paso 1 de 4");
  assert.equal(progresoDeEtapa(4).porcentaje, 100);
});
