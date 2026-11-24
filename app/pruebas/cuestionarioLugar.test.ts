import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cuestionarioDe,
  tieneCuestionario,
  todosLosCuestionarios,
  validarCuestionario,
  type CuestionarioLugar,
  type OpcionLugar,
} from "../src/app/data/cuestionarioLugar.ts";

// ── Validación estructural de todas las configuraciones ──────────────

test("todas las configuraciones son estructuralmente válidas", () => {
  for (const c of todosLosCuestionarios()) {
    assert.deepEqual(validarCuestionario(c), [], c.servicioId);
  }
});

test("toda rama termina en un resultado (recorrido exhaustivo, sin ciclos)", () => {
  for (const c of todosLosCuestionarios()) {
    const caminos: string[][] = [];
    const recorrer = (preguntaId: string, visitadas: string[]) => {
      assert.ok(!visitadas.includes(preguntaId), `ciclo en ${c.servicioId}: ${preguntaId}`);
      const p = c.preguntas.find((x) => x.id === preguntaId);
      assert.ok(p, `pregunta inexistente: ${preguntaId}`);
      for (const o of p!.opciones) {
        if (o.siguiente) recorrer(o.siguiente, [...visitadas, preguntaId]);
        else {
          assert.ok(o.resultado, `rama sin resultado: ${preguntaId}/${o.id}`);
          caminos.push([...visitadas, preguntaId]);
        }
      }
    };
    recorrer(c.inicial, []);
    assert.ok(caminos.length > 0);
    // El máximo declarado para el avance visual nunca se queda corto.
    const masLargo = Math.max(...caminos.map((camino) => camino.length));
    assert.ok(masLargo <= c.maximoPreguntas, `${c.servicioId}: máximo declarado menor al recorrido real`);
  }
});

test("las preguntas técnicas de Sí/No siempre ofrecen No estoy seguro", () => {
  for (const c of todosLosCuestionarios()) {
    for (const p of c.preguntas) {
      const etiquetas = p.opciones.map((o) => o.etiqueta);
      if (etiquetas.includes("Sí") && etiquetas.includes("No")) {
        // Excepción documentada: la pregunta de equipo existente es de hecho
        // conocible por el cliente (ve si hay un equipo o no). En el
        // cuestionario de apiladas hay una por rama (g-/e-existente).
        if (p.id.endsWith("existente")) continue;
        assert.ok(
          p.opciones.some((o) => o.esNoEstoySeguro),
          `${c.servicioId}/${p.id} no ofrece "No estoy seguro"`,
        );
      }
    }
  }
});

test("No estoy seguro nunca lleva a instalación estándar", () => {
  for (const c of todosLosCuestionarios()) {
    for (const p of c.preguntas) {
      for (const o of p.opciones.filter((x: OpcionLugar) => x.esNoEstoySeguro)) {
        assert.notEqual(o.resultado, "estandar", `${c.servicioId}/${p.id}`);
      }
    }
  }
});

// ── Recorrido del aire acondicionado (fuente: PDF Línea Blanca) ──────

function responder(c: CuestionarioLugar, respuestas: string[][]) {
  let actual = c.inicial;
  let resultado: string | undefined;
  let desinstalacion = false;
  for (const [preguntaId, opcionId] of respuestas) {
    assert.equal(actual, preguntaId);
    const p = c.preguntas.find((x) => x.id === preguntaId)!;
    const o = p.opciones.find((x) => x.id === opcionId)!;
    if (o.marcaDesinstalacion) desinstalacion = true;
    if (o.siguiente) actual = o.siguiente;
    else resultado = o.resultado;
  }
  return { resultado, desinstalacion };
}

test("camino feliz del aire: casa, planta baja, sin equipo, 220 V, menos de 3 m", () => {
  const c = cuestionarioDe("instalacion-aire")!;
  const r = responder(c, [
    ["donde", "casa"],
    ["planta", "si"],
    ["existente", "no"],
    ["electrica", "si"],
    ["distancia", "si"],
  ]);
  assert.equal(r.resultado, "estandar");
  assert.equal(r.desinstalacion, false);
});

test("edificio corta el recorrido y pide inspección (regla del PDF)", () => {
  const c = cuestionarioDe("instalacion-aire")!;
  const r = responder(c, [["donde", "edificio"]]);
  assert.equal(r.resultado, "inspeccion");
});

test("equipo existente marca la oferta de desinstalación sin cambiar el recorrido", () => {
  const c = cuestionarioDe("instalacion-aire")!;
  const r = responder(c, [
    ["donde", "casa"],
    ["planta", "si"],
    ["existente", "si"],
    ["electrica", "si"],
    ["distancia", "si"],
  ]);
  assert.equal(r.resultado, "estandar");
  assert.equal(r.desinstalacion, true);
});

test("el precio de la desinstalación del aire es el confirmado por el PDF", () => {
  assert.equal(cuestionarioDe("instalacion-aire")?.precioDesinstalacion, 25);
});

test("los servicios que no están en el PDF no tienen cuestionario", () => {
  assert.equal(tieneCuestionario("pintura-interior"), false);
  assert.equal(tieneCuestionario("revision-plomeria"), false);
  assert.equal(tieneCuestionario("instalacion-aire"), true);
});

test("ninguna pregunta expone SKU ni terminología interna", () => {
  for (const c of todosLosCuestionarios()) {
    for (const p of c.preguntas) {
      const visible = `${p.texto} ${p.ayudaBreve ?? ""} ${p.comoIdentifico?.descripcion ?? ""} ${p.opciones.map((o) => o.etiqueta).join(" ")}`.toLowerCase();
      for (const palabra of ["sku", "y051", "instalación básica", "split", "compresor", "workflow"]) {
        assert.ok(!visible.includes(palabra), `${c.servicioId}/${p.id} expone "${palabra}"`);
      }
    }
  }
});

// ── Línea blanca: reglas del PDF ─────────────────────────────────────

test("todas las instalaciones de línea blanca tienen cuestionario", () => {
  const ids = [
    "instalacion-secadora-gas", "instalacion-secadora-electrica", "instalacion-lavadora",
    "instalacion-estufa-gas", "instalacion-estufa-electrica", "instalacion-estufa-empotrable-gas",
    "instalacion-horno-empotrable", "instalacion-lavavajillas", "instalacion-refrigeradora-french",
    "instalacion-vinera", "instalacion-calentador-electrico", "instalacion-calentador-gas",
  ];
  for (const id of ids) assert.ok(tieneCuestionario(id), id);
});

test("secadora con equipo existente: instalación estándar directa y oferta de desinstalación (regla del PDF)", () => {
  const c = cuestionarioDe("instalacion-secadora-gas")!;
  const r = responder(c, [["existente", "si"]]);
  assert.equal(r.resultado, "estandar");
  assert.equal(r.desinstalacion, true);
});

test("estufa empotrable sin equipo previo va directo a inspección (regla del PDF)", () => {
  const c = cuestionarioDe("instalacion-estufa-empotrable-gas")!;
  const r = responder(c, [["existente", "no"]]);
  assert.equal(r.resultado, "inspeccion");
});

test("lavadora: No estoy seguro sobre el tomacorriente lleva a inspección", () => {
  const c = cuestionarioDe("instalacion-lavadora")!;
  const r = responder(c, [["electrica", "ns"]]);
  assert.equal(r.resultado, "inspeccion");
});

test("calentador a gas: el camino completo encadena gas y agua antes de la estándar", () => {
  const c = cuestionarioDe("instalacion-calentador-gas")!;
  const r = responder(c, [
    ["existente", "no"],
    ["gas", "si"],
    ["agua", "si"],
  ]);
  assert.equal(r.resultado, "estandar");
  assert.equal(r.desinstalacion, false);
});

test("todo cuestionario que ofrece desinstalación tiene un precio (confirmado o referencial)", () => {
  assert.equal(cuestionarioDe("instalacion-secadora-gas")?.precioDesinstalacion, 20);
  assert.equal(cuestionarioDe("instalacion-horno-empotrable")?.precioDesinstalacion, 20);
  // Sin monto propio del PDF: usa el mismo referencial de sus hermanas ($20)
  // para no dejar la desinstalación sin precio.
  assert.equal(cuestionarioDe("instalacion-estufa-gas")?.precioDesinstalacion, 20);
  assert.equal(cuestionarioDe("instalacion-calentador-gas")?.precioDesinstalacion, 20);
  assert.equal(cuestionarioDe("instalacion-estufa-electrica")?.precioDesinstalacion, 20);
  assert.equal(cuestionarioDe("instalacion-estufa-empotrable-gas")?.precioDesinstalacion, 20);
  assert.equal(cuestionarioDe("instalacion-calentador-electrico")?.precioDesinstalacion, 20);
  assert.equal(cuestionarioDe("instalacion-estufa-industrial")?.precioDesinstalacion, 20);
  assert.equal(cuestionarioDe("instalacion-estufa-empotrable-electrica")?.precioDesinstalacion, 20);
});
