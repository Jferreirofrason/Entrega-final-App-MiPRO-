import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIAS_PROBLEMA,
  categoriaPorId,
  generarNumeroSolicitud,
  listaParaEnviar,
  progresoDePaso,
  validarDireccionGarantia,
  validarPaso1,
  validarPaso2,
  validarPaso3,
  type BorradorGarantia,
  type ProductoSolicitud,
} from "../src/app/logic/solicitudGarantia.ts";
import { STR } from "../src/app/i18n/strings.ts";

const completo: BorradorGarantia = {
  producto: { registradoId: "1", nombre: "Aire Acondicionado Sala" },
  problema: { categoria: "no-enciende", adjuntos: [] },
  contacto: { nombre: "María González", telefono: "+507 6000-0000" },
  direccion: { id: "casa", etiqueta: "Casa", direccion: "Calle 50" },
};

// ── Paso 1 ───────────────────────────────────────────────────────────

test("un producto registrado elegido alcanza para continuar", () => {
  assert.deepEqual(validarPaso1(completo), []);
});

/** Producto cargado a mano con TODO completo menos la serie. */
function productoManual(parcial?: Partial<ProductoSolicitud>): ProductoSolicitud {
  return {
    nombre: "Lavadora del patio",
    numeroFactura: "FAC-001-2026",
    fechaCompra: "2026-01-10",
    comercio: "Cochez",
    tipo: "Lavadora",
    marca: "Mabe",
    codigoProducto: "COD-987654",
    modelo: "Deluxe 2000",
    alias: "Lavadora del patio",
    ...parcial,
  };
}

test("en el formulario manual se piden todos los datos menos la serie", () => {
  // Sin nada: se reportan los ocho obligatorios.
  assert.equal(validarPaso1({ producto: { nombre: "" } }).length, 8);

  // Completo (sin serie): alcanza para continuar.
  assert.deepEqual(validarPaso1({ producto: productoManual() }), []);

  // Cualquiera que falte se pide, uno por uno.
  const obligatorios: (keyof ProductoSolicitud)[] = [
    "numeroFactura", "fechaCompra", "comercio", "tipo",
    "marca", "codigoProducto", "modelo", "alias",
  ];
  for (const campo of obligatorios) {
    assert.equal(
      validarPaso1({ producto: productoManual({ [campo]: "" }) }).length,
      1,
      `"${campo}" tendría que ser obligatorio`,
    );
  }
});

test("la serie es el ÚNICO opcional: se puede continuar sin ingresarla", () => {
  assert.deepEqual(validarPaso1({ producto: productoManual({ serie: "" }) }), []);
  assert.deepEqual(validarPaso1({ producto: productoManual({ serie: "SN-123456789" }) }), []);
});

test("sin producto, el error explica qué hacer en lenguaje claro", () => {
  const errores = validarPaso1({});
  assert.equal(errores.length, 1);
  assert.ok(!errores[0].toLowerCase().includes("inválido"));
  assert.ok(!errores[0].toLowerCase().includes("error de validación"));
});

// ── Paso 2 ───────────────────────────────────────────────────────────

test("la categoría del problema es obligatoria; la descripción y los adjuntos no", () => {
  assert.equal(validarPaso2({}).length, 1);
  assert.deepEqual(validarPaso2({ problema: { categoria: "otro", adjuntos: [] } }), []);
});

test("solo las categorías con riesgo llevan aviso de seguridad (mecanismo de demostración)", () => {
  const conAviso = CATEGORIAS_PROBLEMA.filter((c) => c.avisoSeguridad);
  assert.equal(conAviso.length, 1);
  assert.equal(conAviso[0].id, "pierde-agua");
  assert.equal(categoriaPorId("no-enciende")?.avisoSeguridad, undefined);
});

// ── Paso 3 ───────────────────────────────────────────────────────────

test("el paso 3 exige contacto con teléfono y una ubicación elegida", () => {
  assert.deepEqual(validarPaso3(completo), []);
  assert.equal(validarPaso3({ ...completo, direccion: undefined }).length, 1);
  assert.equal(
    validarPaso3({ ...completo, contacto: { nombre: "", telefono: "" } }).length,
    2,
  );
});

test("una solicitud completa queda lista para enviar", () => {
  assert.equal(listaParaEnviar(completo), true);
  assert.equal(listaParaEnviar({}), false);
});

// ── Alta de dirección (paso 3) ──────────────────────────────────────

test("la dirección de garantía exige nombre, provincia y distrito; el corregimiento no", () => {
  assert.equal(validarDireccionGarantia({ alias: "", provincia: "", distrito: "" }).length, 3);
  assert.deepEqual(
    validarDireccionGarantia({ alias: "Casa", provincia: "Panamá", distrito: "Panamá" }),
    [],
  );
});

// ── Progreso y número ────────────────────────────────────────────────

test("el progreso anuncia paso, nombre y porcentaje", () => {
  assert.deepEqual(progresoDePaso(2), {
    texto: "Paso 2 de 4",
    titulo: "Contar el problema",
    porcentaje: 50,
  });
});

test("el paso 4 es la revisión final", () => {
  assert.deepEqual(progresoDePaso(4), {
    texto: "Paso 4 de 4",
    titulo: "Revisar y enviar",
    porcentaje: 100,
  });
});

test("el número de solicitud usa el formato GAR-año-secuencia", () => {
  assert.equal(generarNumeroSolicitud(new Date("2026-08-25T10:00:00"), 892), "GAR-2026-0892");
  assert.equal(generarNumeroSolicitud(new Date("2026-08-25T10:00:00"), 123456), "GAR-2026-3456");
});

// ── Lenguaje del flujo ───────────────────────────────────────────────

// "SKU" tiene UNA excepción deliberada: la ayuda del código de producto
// explica que es el mismo número, porque en la factura del comercio puede
// figurar con ese nombre y quien lo busca necesita reconocerlo. La app
// sigue sin llamar "SKU" a ningún campo suyo: ninguna etiqueta, ningún
// placeholder, ningún título. Por eso la exclusión es de ese texto puntual
// y el resto del flujo se sigue revisando entero.
const AYUDA_CODIGO_EXPLICA_SKU = "p1CodigoAyudaTexto";

test("ningún texto del flujo expone términos técnicos o internos", () => {
  const prohibidos = ["sku", "salesforce", "workflow", "ticket", "reporte", "gestión realizada", "caso procesado"];
  const { [AYUDA_CODIGO_EXPLICA_SKU]: _ayudaCodigo, ...resto } = STR.garantiaFlujo as Record<string, unknown>;
  const textos = JSON.stringify(resto).toLowerCase();
  for (const palabra of prohibidos) {
    assert.ok(!textos.includes(palabra), `el flujo expone "${palabra}"`);
  }
});

test("solo la ayuda del código de producto nombra el SKU, y lo hace para explicarlo", () => {
  const ayuda = STR.garantiaFlujo.p1CodigoAyudaTexto.toLowerCase();
  assert.ok(ayuda.includes("sku"), "la ayuda debe nombrar el SKU para que se reconozca en la factura");
  // Ninguna etiqueta ni placeholder del flujo puede llamarse así: el campo
  // se llama "Código de producto" en todas partes.
  const etiquetas = [
    STR.garantiaFlujo.p1Codigo,
    STR.garantiaFlujo.p1CodigoPlaceholder,
    STR.garantiaFlujo.p1CodigoAyuda,
  ];
  for (const etiqueta of etiquetas) {
    assert.ok(!etiqueta.toLowerCase().includes("sku"), `"${etiqueta}" no puede nombrar el SKU`);
  }
});

test("no se prometen plazos ni cobertura asegurada", () => {
  const textos = JSON.stringify(STR.garantiaFlujo).toLowerCase();
  assert.ok(!textos.includes("24"), "promete un plazo en horas");
  assert.ok(!textos.includes("48"), "promete un plazo en horas");
  assert.ok(!textos.includes("aprobada"), "afirma cobertura aprobada");
  assert.ok(!textos.includes("minutos."), "promete una duración sin respaldo");
});

// ── Contacto alternativo (opcional, pero completo si se usa) ─────────

test("el contacto alternativo vacío no bloquea el envío", () => {
  const base: BorradorGarantia = {
    producto: { nombre: "Lavadora", tipo: "Lavadora" },
    problema: { categoria: "no-enciende", adjuntos: [] },
    contacto: { nombre: "María González", telefono: "6000-0000" },
    direccion: { id: "casa", etiqueta: "Casa", direccion: "Calle 50" },
  };
  assert.deepEqual(validarPaso3(base), []);
  assert.deepEqual(
    validarPaso3({ ...base, contactoAlternativo: { nombre: "", telefono: "" } }),
    [],
  );
});

test("el contacto alternativo a medias pide el dato que falta", () => {
  const base: BorradorGarantia = {
    producto: { nombre: "Lavadora", tipo: "Lavadora" },
    problema: { categoria: "no-enciende", adjuntos: [] },
    contacto: { nombre: "María González", telefono: "6000-0000" },
    direccion: { id: "casa", etiqueta: "Casa", direccion: "Calle 50" },
  };
  assert.equal(
    validarPaso3({ ...base, contactoAlternativo: { nombre: "Pedro", telefono: "" } }).length,
    1,
  );
  assert.equal(
    validarPaso3({ ...base, contactoAlternativo: { nombre: "", telefono: "6111-2222" } }).length,
    1,
  );
  assert.deepEqual(
    validarPaso3({ ...base, contactoAlternativo: { nombre: "Pedro", telefono: "6111-2222" } }),
    [],
  );
});
