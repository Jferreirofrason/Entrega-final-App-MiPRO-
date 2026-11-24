// Capturas numeradas para el documento de detalles de diseño.
//
//   npm run dev -- --port 5199 --strictPort     (en otra terminal)
//   node docs/capturar-plantilla.mjs
//
// Son las mismas pantallas que saca `capturar-hu-1518-1579.mjs`, pero con el
// número de cada elemento al margen. Ese número es el de la primera columna
// de la tabla que acompaña a la captura en el documento.
//
// Los números NO se dibujan a mano encima de una imagen: se miden en el DOM
// de la app, así que si un elemento se mueve, la marca se mueve con él.
//
// Cómo funciona, en dos pasos:
//   1. Se navega, se siembra el estado, se tocan los controles y se mide el
//      rectángulo de cada elemento. Después se fotografía la pantalla.
//   2. Esa foto se vuelve a abrir dentro de una página de composición que le
//      agrega los márgenes, los globos con el número y la línea de guía.

import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP = process.env.APP ?? "http://localhost:5199";
const SALIDA = fileURLToPath(
  new URL("./capturas-hu-1518-1579/", import.meta.url),
);
const PUERTO = 9379;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const ANCHO = 390;
const MARGEN = 62; // el aire de cada lado donde van los números

const LEIDAS = "mipro-notificaciones-leidas";
const ELIMINADAS = "mipro-notificaciones-eliminadas";
const IDS = [
  "n-serv-cita",
  "n-gar-cita",
  "n-serv-revision",
  "n-gar-revision",
  "n-serv-recibida",
  "n-gar-recibida",
  "n-serv-completada",
  "n-gar-completada",
  "n-serv-cancelada",
  "n-gar-cancelada",
];

const limpiar = `sessionStorage.removeItem('${LEIDAS}');sessionStorage.removeItem('${ELIMINADAS}');true`;
const vaciar = `sessionStorage.setItem('${ELIMINADAS}', ${JSON.stringify(JSON.stringify(IDS))});true`;

const tocar = (texto) => `(() => {
  const b = [...document.querySelectorAll('button')].find(
    (e) => (e.getAttribute('aria-label') || '') === ${JSON.stringify(texto)}
      || (e.textContent || '').trim() === ${JSON.stringify(texto)},
  );
  if (!b) throw new Error('no encontré: ' + ${JSON.stringify(texto)});
  b.click();
  return true;
})()`;

// --- Cómo se nombra un elemento para medirlo ---------------------------
//
// Cada punto trae un buscador en JS que devuelve el elemento. Se escribe en
// texto plano porque viaja por el protocolo de DevTools y se evalúa adentro
// de la página.

/** Ayudas disponibles dentro de la página al medir. */
const AYUDAS = `
  const rotulo = (t) => [...document.querySelectorAll('button')].find(
    (e) => (e.getAttribute('aria-label') || '') === t);
  const rotuloEmpieza = (t) => [...document.querySelectorAll('button')].find(
    (e) => (e.getAttribute('aria-label') || '').startsWith(t));
  const texto = (t) => [...document.querySelectorAll('h1,h2,h3,p,span,button')]
    .filter((e) => (e.textContent || '').trim() === t)
    .sort((a, b) => a.getElementsByTagName('*').length - b.getElementsByTagName('*').length)[0];
  const empieza = (t) => [...document.querySelectorAll('span,p')]
    .find((e) => (e.textContent || '').trim().startsWith(t) && e.children.length === 0);
  const uno = (sel) => document.querySelector(sel);
  const fila = (t) => empieza(t).closest('div.flex.items-stretch');
`;

/**
 * Mide los puntos de una pantalla.
 * `puntos` es una lista de { n, lado, buscar }, donde `buscar` es una
 * expresión que devuelve el elemento (o un rectángulo ya armado).
 */
const medir = (puntos, clip) => `(() => {
  ${AYUDAS}
  const base = ${clip ? clip : "{ x: 0, y: 0 }"};
  const salida = [];
  for (const p of ${JSON.stringify(puntos.map(({ n, lado }) => ({ n, lado })))}) salida.push(p);
  const rects = [
    ${puntos
      .map(
        ({ buscar }) => `(() => {
      const e = ${buscar};
      if (!e) throw new Error('no encontré el punto');
      const r = e.getBoundingClientRect ? e.getBoundingClientRect() : e;
      return { x: r.x - base.x, y: r.y - base.y, w: r.width, h: r.height };
    })()`,
      )
      .join(",\n    ")}
  ];
  return salida.map((p, i) => ({ ...p, ...rects[i] }));
})()`;

// --- Las figuras -------------------------------------------------------

/** El rectángulo del encabezado del Inicio. */
const CLIP_HEADER = `(() => {
  const r = document.querySelector('header').getBoundingClientRect();
  return { x: 0, y: 0, width: 390, height: Math.ceil(r.height) };
})()`;

/** El rectángulo de la fila cuyo encabezado empieza con este texto. */
const clipFila = (t) => `(() => {
  const marca = [...document.querySelectorAll('span')].find(
    (e) => (e.textContent || '').startsWith(${JSON.stringify(t)}));
  if (!marca) throw new Error('no encontré la fila: ' + ${JSON.stringify(t)});
  const r = marca.closest('div.flex.items-stretch').getBoundingClientRect();
  return { x: 0, y: Math.floor(r.top), width: 390, height: Math.ceil(r.height) };
})()`;

const FIGURAS = [
  {
    nombre: "p1-inicio-encabezado",
    ruta: "/",
    antes: limpiar,
    recorte: CLIP_HEADER,
    puntos: [
      { n: 1, lado: "izq", buscar: `rotuloEmpieza('Perfil de')` },
      { n: 2, lado: "izq", buscar: `uno('header h1')` },
      { n: 3, lado: "izq", buscar: `uno('header p')` },
      { n: 4, lado: "der", buscar: `rotuloEmpieza('Notificaciones')` },
      {
        n: 5,
        lado: "der",
        buscar: `rotuloEmpieza('Notificaciones').querySelector('span')`,
      },
    ],
  },
  {
    nombre: "p2-bandeja",
    ruta: "/notificaciones",
    antes: limpiar,
    // Solo lo que entra en pantalla: la bandeja entera mide 1346 y en el PDF
    // quedaría ilegible. Lo que sigue abajo son más filas iguales.
    recorte: `({ x: 0, y: 0, width: 390, height: 844 })`,
    puntos: [
      { n: 1, lado: "izq", buscar: `rotulo('Volver')` },
      { n: 2, lado: "izq", buscar: `uno('h1')` },
      { n: 3, lado: "der", buscar: `rotulo('Más opciones')` },
      { n: 4, lado: "izq", buscar: `empieza('10 notificaciones sin leer')` },
      { n: 5, lado: "izq", buscar: `uno('h2')` },
      { n: 6, lado: "der", buscar: `fila('Servicio · ')` },
    ],
  },
  {
    nombre: "p3-fila",
    ruta: "/notificaciones",
    antes: limpiar,
    recorte: clipFila("Servicio · "),
    puntos: [
      {
        n: 1,
        lado: "izq",
        buscar: `(() => { const f = fila('Servicio · ').getBoundingClientRect();
          return { x: f.x, y: f.y, width: 6, height: f.height }; })()`,
      },
      {
        n: 2,
        lado: "izq",
        buscar: `fila('Servicio · ').querySelector('span[aria-hidden="true"]')`,
      },
      { n: 3, lado: "izq", buscar: `empieza('Servicio · ')` },
      {
        n: 4,
        lado: "izq",
        buscar: `empieza('Servicio · ').parentElement.querySelector('span.line-clamp-2')`,
      },
      {
        n: 5,
        lado: "der",
        buscar: `empieza('Servicio · ').parentElement
          .querySelector('span.flex-shrink-0')`,
      },
      {
        n: 6,
        lado: "izq",
        buscar: `empieza('Servicio · ').parentElement.querySelector('span.inline-flex')`,
      },
      {
        n: 7,
        lado: "der",
        buscar: `fila('Servicio · ').querySelector('button[aria-label^="Eliminar"]')`,
      },
    ],
  },
  {
    nombre: "p4-vacio",
    ruta: "/notificaciones",
    antes: vaciar,
    puntos: [
      { n: 1, lado: "izq", buscar: `uno('[role="status"] svg')` },
      { n: 2, lado: "izq", buscar: `uno('[role="status"] h2')` },
      { n: 3, lado: "izq", buscar: `uno('[role="status"] p')` },
    ],
  },
  {
    nombre: "p5-menu",
    ruta: "/notificaciones",
    antes: limpiar,
    toques: [tocar("Más opciones")],
    puntos: [
      { n: 1, lado: "izq", buscar: `uno('[role="dialog"] h3')` },
      { n: 2, lado: "der", buscar: `rotulo('Cerrar')` },
      { n: 3, lado: "izq", buscar: `texto('Marcar todas como leídas')` },
      { n: 4, lado: "izq", buscar: `texto('Borrar todas las notificaciones')` },
    ],
  },
  {
    nombre: "p6-confirmacion",
    ruta: "/notificaciones",
    antes: limpiar,
    toques: [tocar("Más opciones"), tocar("Borrar todas las notificaciones")],
    puntos: [
      { n: 1, lado: "izq", buscar: `uno('[role="dialog"] h3')` },
      // La X de esta hoja se anuncia "Cancelar", no "Cerrar".
      { n: 2, lado: "der", buscar: `uno('[role="dialog"] button[aria-label="Cancelar"]')` },
      { n: 3, lado: "izq", buscar: `uno('[role="dialog"] p')` },
      { n: 4, lado: "izq", buscar: `texto('Cancelar')` },
      { n: 5, lado: "der", buscar: `texto('Borrar todas')` },
    ],
  },
];

// --- La página de composición -----------------------------------------

/**
 * Arma el HTML que pega los números al costado de la foto.
 *
 * El globo se alinea con su elemento. Cuando dos caen demasiado cerca, el de
 * abajo se corre hacia abajo y la guía sale en diagonal: un número torcido se
 * sigue leyendo, dos globos encimados no.
 */
function composicion(dataUrl, altoFoto, puntos) {
  const SEPARACION = 28;
  const RADIO = 12;

  // El punto al que apunta la guía: el alto del elemento, o 14 abajo de su
  // borde cuando es alto. Los globos se ordenan por ese mismo valor, así las
  // guías no se cruzan entre sí.
  const anclaY = (p) => p.y + Math.min(p.h / 2, 14);

  // A la misma altura (dentro de 8 px) manda el orden de la tabla.
  const orden = (a, b) =>
    Math.abs(anclaY(a) - anclaY(b)) < 8
      ? a.n - b.n
      : anclaY(a) - anclaY(b);

  const porLado = { izq: [], der: [] };
  for (const p of [...puntos].sort(orden)) {
    const lista = porLado[p.lado];
    const deseado = Math.max(anclaY(p), RADIO + 2);
    const ultimo = lista.length ? lista[lista.length - 1].cy : -Infinity;
    lista.push({ ...p, cy: Math.max(deseado, ultimo + SEPARACION) });
  }

  const todos = [...porLado.izq, ...porLado.der];
  // El lienzo crece si los globos no entran en el alto de la foto.
  const alto = Math.max(
    altoFoto,
    Math.ceil(Math.max(...todos.map((p) => p.cy)) + RADIO + 4),
  );

  const marcas = todos
    .map((p) => {
      const izq = p.lado === "izq";
      const cx = izq ? MARGEN / 2 : MARGEN + ANCHO + MARGEN / 2;
      // La guía apunta al borde del elemento, del lado por el que entra.
      const ax = izq ? MARGEN + p.x : MARGEN + p.x + p.w;
      const ay = Math.min(Math.max(anclaY(p), 2), altoFoto - 2);
      const bx = izq ? cx + RADIO : cx - RADIO;
      return `
      <line x1="${bx}" y1="${p.cy}" x2="${ax}" y2="${ay}"
            stroke="#929292" stroke-width="1" />
      <circle cx="${ax}" cy="${ay}" r="2" fill="#929292" />
      <circle cx="${cx}" cy="${p.cy}" r="${RADIO}" fill="#FFEE00" />
      <text x="${cx}" y="${p.cy + 4}" text-anchor="middle"
            font-family="Helvetica, Arial, sans-serif" font-size="12"
            font-weight="600" fill="#000">${p.n}</text>`;
    })
    .join("");

  const ancho = MARGEN * 2 + ANCHO;

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; }
    .lienzo { position: relative; width: ${ancho}px; height: ${alto}px; }
    .foto { position: absolute; left: ${MARGEN}px; top: 0; width: ${ANCHO}px;
            height: ${altoFoto}px; display: block; }
    svg { position: absolute; left: 0; top: 0; }
  </style></head><body>
    <div class="lienzo">
      <img class="foto" src="${dataUrl}">
      <svg width="${ancho}" height="${alto}">${marcas}</svg>
    </div>
  </body></html>`;

  return { html, ancho, alto };
}

// --- Mecánica de Chrome (igual que capturar-hu-1518-1579.mjs) ----------

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function esperarPuerto() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PUERTO}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
    await dormir(250);
  }
  throw new Error("Chrome no abrió el puerto de depuración");
}

function conectar(url) {
  const ws = new WebSocket(url);
  const pendientes = new Map();
  const oyentes = new Map();
  let id = 0;

  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pendientes.has(m.id)) {
      const { resolver, rechazar } = pendientes.get(m.id);
      pendientes.delete(m.id);
      m.error ? rechazar(new Error(m.error.message)) : resolver(m.result);
    } else if (m.method && oyentes.has(m.method)) {
      oyentes.get(m.method).forEach((f) => f(m.params));
      oyentes.delete(m.method);
    }
  });

  return {
    lista: new Promise((r) => ws.addEventListener("open", r)),
    enviar(method, params = {}) {
      const n = ++id;
      ws.send(JSON.stringify({ id: n, method, params }));
      return new Promise((resolver, rechazar) =>
        pendientes.set(n, { resolver, rechazar }),
      );
    },
    unaVez(method) {
      return new Promise((r) => {
        if (!oyentes.has(method)) oyentes.set(method, []);
        oyentes.get(method).push(r);
      });
    },
    cerrar: () => ws.close(),
  };
}

mkdirSync(SALIDA, { recursive: true });

const perfil = mkdtempSync(join(tmpdir(), "mipro-plantilla-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-prefers-reduced-motion",
  `--remote-debugging-port=${PUERTO}`,
  `--user-data-dir=${perfil}`,
  "about:blank",
]);

try {
  await esperarPuerto();
  const nueva = await fetch(
    `http://127.0.0.1:${PUERTO}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" },
  ).then((r) => r.json());

  const cdp = conectar(nueva.webSocketDebuggerUrl);
  await cdp.lista;
  await cdp.enviar("Page.enable");
  await cdp.enviar("Runtime.enable");

  const MEDIR_ALTO = `(() => {
    let extra = 0;
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.clientHeight > 0)
        extra = Math.max(extra, el.scrollHeight - el.clientHeight);
    }
    return 844 + Math.ceil(extra);
  })()`;

  const IMAGENES_LISTAS = `(async () => {
    for (let i = 0; i < 60; i++) {
      if ([...document.images].every((im) => im.complete)) return true;
      await new Promise((r) => setTimeout(r, 250));
    }
    return false;
  })()`;

  const evaluar = async (expr, esperarPromesa = false) => {
    const { result, exceptionDetails } = await cdp.enviar("Runtime.evaluate", {
      expression: expr,
      awaitPromise: esperarPromesa,
      returnByValue: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.text);
    return result.value;
  };

  const metricas = (ancho, alto) =>
    cdp.enviar("Emulation.setDeviceMetricsOverride", {
      width: ancho,
      height: alto,
      deviceScaleFactor: 2,
      mobile: ancho === ANCHO,
    });

  const navegar = async (url) => {
    const cargada = cdp.unaVez("Page.loadEventFired");
    await cdp.enviar("Page.navigate", { url });
    await Promise.race([cargada, dormir(8000)]);
    await dormir(400);
  };

  for (const fig of FIGURAS) {
    await metricas(ANCHO, 844);
    await navegar(`${APP}/#${fig.ruta}`);

    if (fig.antes) {
      await evaluar(fig.antes);
      const recargada = cdp.unaVez("Page.loadEventFired");
      await cdp.enviar("Page.reload");
      await Promise.race([recargada, dormir(8000)]);
      await dormir(500);
    }

    for (const toque of fig.toques ?? []) {
      await evaluar(toque);
      await dormir(350);
    }

    // Una hoja abierta o un recorte se quedan con el alto de la ventana: la
    // hoja está anclada al borde, estirar el alto la dejaría en el aire.
    const alto =
      fig.recorte || (fig.toques ?? []).length > 0
        ? 844
        : await evaluar(MEDIR_ALTO);
    if (alto !== 844) {
      await metricas(ANCHO, alto);
      await dormir(400);
    }

    await evaluar(IMAGENES_LISTAS, true);
    await dormir(300);

    const clip = fig.recorte ? await evaluar(fig.recorte) : null;
    const puntos = await evaluar(medir(fig.puntos, fig.recorte));

    const { data } = await cdp.enviar("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
      ...(clip ? { clip: { ...clip, scale: 2 } } : {}),
    });

    // Segundo paso: la foto, ya sacada, se compone con sus números.
    const altoFoto = clip ? clip.height : alto;
    const { html, ancho, alto: altoLienzo } = composicion(
      `data:image/png;base64,${data}`,
      altoFoto,
      puntos,
    );
    await metricas(ancho, altoLienzo);
    await navegar(
      `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
    );
    await evaluar(IMAGENES_LISTAS, true);
    await dormir(250);

    const compuesta = await cdp.enviar("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    writeFileSync(
      join(SALIDA, `${fig.nombre}.png`),
      Buffer.from(compuesta.data, "base64"),
    );
    console.log(
      `${fig.nombre.padEnd(22)} ${ancho}x${String(altoLienzo).padEnd(5)} ${puntos.length} números`,
    );
  }

  // --- Los cinco chips de estado, uno por archivo ----------------------
  //
  // Son la muestra real del color y del ícono de cada estado, recortada de
  // la bandeja. Se marcan todas como leídas antes de sacarlas: sobre la
  // fila sin leer el fondo es amarillo y el chip no se vería contra blanco.
  await metricas(ANCHO, 844);
  await navegar(`${APP}/#/notificaciones`);
  await evaluar(
    `sessionStorage.setItem('${LEIDAS}', ${JSON.stringify(JSON.stringify(IDS))});true`,
  );
  {
    const recargada = cdp.unaVez("Page.loadEventFired");
    await cdp.enviar("Page.reload");
    await Promise.race([recargada, dormir(8000)]);
    await dormir(500);
  }
  const altoBandeja = await evaluar(MEDIR_ALTO);
  await metricas(ANCHO, altoBandeja);
  await dormir(400);

  for (const [estado, archivo] of [
    ["Solicitud recibida", "chip-solicitud-recibida"],
    ["En revisión", "chip-en-revision"],
    ["Cita programada", "chip-cita-programada"],
    ["Completada", "chip-completada"],
    ["Cancelada", "chip-cancelada"],
  ]) {
    const rect = await evaluar(`(() => {
      const chip = [...document.querySelectorAll('span.inline-flex')].find(
        (e) => (e.textContent || '').trim() === ${JSON.stringify(estado)});
      if (!chip) throw new Error('sin chip: ' + ${JSON.stringify(estado)});
      const r = chip.getBoundingClientRect();
      return { x: Math.floor(r.x) - 6, y: Math.floor(r.y) - 5,
               width: Math.ceil(r.width) + 12, height: Math.ceil(r.height) + 10 };
    })()`);

    const { data } = await cdp.enviar("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
      clip: { ...rect, scale: 3 },
    });
    writeFileSync(join(SALIDA, `${archivo}.png`), Buffer.from(data, "base64"));
    console.log(`${archivo.padEnd(22)} ${rect.width}x${rect.height}`);
  }

  cdp.cerrar();
} finally {
  chrome.kill();
}
