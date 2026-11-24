// Capturas de la app con las fotos REALES cargadas.
//
// El camino corto (--screenshot con --virtual-time-budget) fotografía antes de
// que terminen las imágenes remotas y quedan recuadros grises. Acá se usa el
// protocolo de DevTools: se navega, se espera a que TODAS las imágenes estén
// completas y recién después se saca la foto.
//
//   node docs/capturar.mjs
//
// El alto de cada pantalla es el real: 812 (el viewport del teléfono) más lo
// que falte de scroll. Se mide en la propia página antes de fotografiar.

import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const APP = "https://app-mipro-app.vercel.app";
const SALIDA = new URL("./capturas/", import.meta.url).pathname;
const PUERTO = 9377;
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const PANTALLAS = [
  ["01-inicio", "/"],
  ["02-catalogo", "/catalogo"],
  ["03-catalogo-ficha", "/catalogo/instalacion-aire"],
  ["04-detalle-servicio", "/servicios/fixture-aire-multivisita"],
  ["05-mis-servicios", "/proyectos"],
  ["06-garantia", "/garantia"],
  ["07-garantia-paso1", "/garantia/producto"],
  ["08-garantia-problema", "/garantia/problema"],
  ["09-garantia-contacto", "/garantia/revisar"],
  ["09b-garantia-confirmar", "/garantia/confirmar"],
  ["10-detalle-reclamo", "/reclamos/reclamo-1"],
  ["11-notificaciones", "/notificaciones"],
  ["12-perfil", "/perfil"],
  ["13-sugerencias", "/sugerencias"],
  ["14-direccion-nueva", "/garantia/direccion/nueva"],
  ["15-configurar", "/catalogo/instalacion-aire/configurar"],
  ["16-fecha", "/catalogo/instalacion-aire/fecha"],
  ["17-resumen", "/catalogo/instalacion-aire/resumen"],
  ["18-solicitud-enviada", "/solicitud-enviada"],
  ["19-productos", "/productos"],
  ["20-configuracion", "/configuracion"],
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

const perfil = mkdtempSync(join(tmpdir(), "mipro-capturas-"));
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

  // Medir el alto real: el viewport del teléfono más el scroll que falta.
  const MEDIR = `(() => {
    let extra = 0;
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.clientHeight > 0)
        extra = Math.max(extra, el.scrollHeight - el.clientHeight);
    }
    return 812 + Math.ceil(extra);
  })()`;

  // Las fotos son remotas: no se fotografía hasta que estén todas completas.
  const IMAGENES_LISTAS = `(async () => {
    for (let i = 0; i < 60; i++) {
      const faltan = [...document.images].filter(im => !im.complete);
      if (faltan.length === 0) return [...document.images].length;
      await new Promise(r => setTimeout(r, 250));
    }
    return -1;
  })()`;

  const evaluar = async (expr, esperarPromesa = false) => {
    const { result } = await cdp.enviar("Runtime.evaluate", {
      expression: expr,
      awaitPromise: esperarPromesa,
      returnByValue: true,
    });
    return result.value;
  };

  const metricas = (alto) =>
    cdp.enviar("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: alto,
      deviceScaleFactor: 2,
      mobile: true,
    });

  for (const [nombre, ruta] of PANTALLAS) {
    await metricas(812);
    const cargada = cdp.unaVez("Page.loadEventFired");
    await cdp.enviar("Page.navigate", { url: `${APP}/#${ruta}` });
    await Promise.race([cargada, dormir(8000)]);
    await dormir(700);

    const alto = await evaluar(MEDIR);
    if (alto !== 812) {
      await metricas(alto);
      await dormir(500);
    }

    const total = await evaluar(IMAGENES_LISTAS, true);
    await dormir(400);

    const { data } = await cdp.enviar("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    writeFileSync(join(SALIDA, `${nombre}.png`), Buffer.from(data, "base64"));
    console.log(
      `${nombre.padEnd(24)} 375x${String(alto).padEnd(5)} ${
        total === -1 ? "IMAGENES SIN CARGAR" : `${total} imagenes`
      }`,
    );
  }

  cdp.cerrar();
} finally {
  chrome.kill();
}
