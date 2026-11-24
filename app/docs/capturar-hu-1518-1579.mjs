// Capturas del handoff de HU-1518 / HU-1579.
//
//   npm run dev -- --port 5199 --strictPort     (en otra terminal)
//   node docs/capturar-hu-1518-1579.mjs
//
// Mismo mecanismo que docs/capturar.mjs: se navega por el protocolo de
// DevTools, se espera a que las imágenes estén completas y recién después se
// fotografía. Tres diferencias:
//
//   1. Mide a 390 de ancho, que es el ancho de validación de esta HU.
//   2. Cada pantalla puede sembrar estado ANTES de montar (`antes`) y tocar
//      controles DESPUÉS de montar (`toques`). Sin eso no hay forma de
//      fotografiar un menú abierto ni la bandeja vacía.
//   3. Puede recortar una fila (`recorte`), para documentar una notificación
//      de servicio y una de garantía por separado.
//
// Se apunta al servidor local a propósito: estas capturas documentan el
// código de esta rama, que todavía no está publicado.

import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP = process.env.APP ?? "http://localhost:5199";
// fileURLToPath y no .pathname: la carpeta del proyecto tiene espacios y el
// .pathname los deja percent-encoded, así que el archivo se escribiría en una
// ruta que no existe.
const SALIDA = fileURLToPath(new URL("./capturas-hu-1518-1579/", import.meta.url));
const PUERTO = 9378;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

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

/** Toca el control cuyo aria-label o texto coincide. */
const tocar = (texto) => `(() => {
  const b = [...document.querySelectorAll('button')].find(
    (e) => (e.getAttribute('aria-label') || '') === ${JSON.stringify(texto)}
      || (e.textContent || '').trim() === ${JSON.stringify(texto)},
  );
  if (!b) throw new Error('no encontré: ' + ${JSON.stringify(texto)});
  b.click();
  return true;
})()`;

/** El rectángulo de la fila cuyo encabezado empieza con este texto. */
const filaQueEmpiezaCon = (texto) => `(() => {
  const marca = [...document.querySelectorAll('span')].find(
    (e) => (e.textContent || '').startsWith(${JSON.stringify(texto)}),
  );
  if (!marca) throw new Error('no encontré la fila: ' + ${JSON.stringify(texto)});
  const fila = marca.closest('div.flex.items-stretch');
  const r = fila.getBoundingClientRect();
  return { x: 0, y: Math.floor(r.top), width: 390, height: Math.ceil(r.height) };
})()`;

const PANTALLAS = [
  { nombre: "01-home-avatar-inicial", ruta: "/", antes: limpiar },
  { nombre: "02-bandeja", ruta: "/notificaciones", antes: limpiar },
  {
    nombre: "03-notificacion-servicio",
    ruta: "/notificaciones",
    antes: limpiar,
    recorte: filaQueEmpiezaCon("Servicio · "),
  },
  {
    nombre: "04-notificacion-garantia",
    ruta: "/notificaciones",
    antes: limpiar,
    recorte: filaQueEmpiezaCon("Garantía · "),
  },
  { nombre: "05-vacio", ruta: "/notificaciones", antes: vaciar },
  {
    nombre: "06-menu-acciones",
    ruta: "/notificaciones",
    antes: limpiar,
    toques: [tocar("Más opciones")],
  },
  {
    nombre: "07-modal-borrar-todas",
    ruta: "/notificaciones",
    antes: limpiar,
    toques: [tocar("Más opciones"), tocar("Borrar todas las notificaciones")],
  },
];

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

const perfil = mkdtempSync(join(tmpdir(), "mipro-hu1518-"));
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

  const MEDIR = `(() => {
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
      const faltan = [...document.images].filter(im => !im.complete);
      if (faltan.length === 0) return [...document.images].length;
      await new Promise(r => setTimeout(r, 250));
    }
    return -1;
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

  const metricas = (alto) =>
    cdp.enviar("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: alto,
      deviceScaleFactor: 2,
      mobile: true,
    });

  const navegar = async (ruta) => {
    const cargada = cdp.unaVez("Page.loadEventFired");
    await cdp.enviar("Page.navigate", { url: `${APP}/#${ruta}` });
    await Promise.race([cargada, dormir(8000)]);
    await dormir(400);
  };

  for (const { nombre, ruta, antes, toques, recorte } of PANTALLAS) {
    await metricas(844);
    await navegar(ruta);

    // El estado se siembra con la pantalla ya cargada (hace falta un origen
    // donde escribir) y recién después se recarga, para montar con ese estado.
    if (antes) {
      await evaluar(antes);
      const recargada = cdp.unaVez("Page.loadEventFired");
      await cdp.enviar("Page.reload");
      await Promise.race([recargada, dormir(8000)]);
      await dormir(500);
    }

    // Los toques van después del montaje: el click necesita el DOM puesto.
    for (const toque of toques ?? []) {
      await evaluar(toque);
      await dormir(350);
    }

    // Una pantalla se fotografía entera (el alto real, medido en la página).
    // Un recorte y una hoja abierta, no: la hoja está anclada al borde de la
    // ventana, así que estirar el alto la dejaría flotando en el medio.
    const alto = recorte || (toques ?? []).length > 0 ? 844 : await evaluar(MEDIR);
    if (alto !== 844) {
      await metricas(alto);
      await dormir(400);
    }

    const total = await evaluar(IMAGENES_LISTAS, true);
    await dormir(300);

    const clip = recorte ? { ...(await evaluar(recorte)), scale: 2 } : undefined;
    const { data } = await cdp.enviar("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
      ...(clip ? { clip } : {}),
    });
    writeFileSync(join(SALIDA, `${nombre}.png`), Buffer.from(data, "base64"));
    console.log(
      `${nombre.padEnd(26)} 390x${String(clip ? clip.height : alto).padEnd(5)} ${
        total === -1 ? "IMAGENES SIN CARGAR" : `${total} imagenes`
      }`,
    );
  }

  cdp.cerrar();
} finally {
  chrome.kill();
}
