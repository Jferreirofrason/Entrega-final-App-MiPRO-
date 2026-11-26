// Íconos de servicios de MiPRO, los que la app dibuja en amarillo.
//
//   node docs/iconos-de-servicios.mjs
//
// Escribe docs/iconos-servicios/:
//
//   amarillo/<nombre>.svg    el glifo solo, en amarillo de marca, 24 × 24
//   sello/<nombre>.svg       el glifo sobre el sello negro, como se ve
//   lamina.svg               los 14 juntos
//   README.md                el índice
//
// Los dibujos NO se copian a mano: se leen del mismo paquete de íconos que
// compila la app. Si cambia de versión, los archivos cambian con él.
//
// Dos variantes y no una: el glifo amarillo solo es invisible sobre blanco,
// así que para mirarlo hace falta el sello. Y el sello solo no sirve para
// reusar el dibujo en otro fondo. Van los dos.

import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ICONOS_DIR = new URL(
  "../node_modules/lucide-react/dist/esm/icons/",
  import.meta.url,
);
const SALIDA = new URL("./iconos-servicios/", import.meta.url);

const AMARILLO = "#FFEE00";
const NEGRO = "#000000";

// Las nueve categorías del catálogo, en el orden del mapa de la app, y
// después los cinco que usan los servicios sueltos.
//
// `archivo` es el nombre del archivo: dice QUÉ es el ícono, no cómo se
// llama en la librería. Quien lo busca busca \"fumigación\", no \"bug\".
// `catalogo` es el nombre con el que se lee el dibujo de la librería.
const ICONOS = [
  { n: "Wrench", catalogo: "wrench", archivo: "instalacion", uso: "Instalación", tipo: "Categoría" },
  { n: "Settings", catalogo: "settings", archivo: "mantenimiento", uso: "Mantenimiento", tipo: "Categoría" },
  { n: "Hammer", catalogo: "hammer", archivo: "reparacion", uso: "Reparación", tipo: "Categoría" },
  { n: "Bug", catalogo: "bug", archivo: "fumigacion", uso: "Fumigación", tipo: "Categoría" },
  { n: "Sparkles", catalogo: "sparkles", archivo: "limpieza", uso: "Limpieza", tipo: "Categoría" },
  { n: "Paintbrush", catalogo: "paintbrush", archivo: "pintura", uso: "Pintura", tipo: "Categoría" },
  { n: "Armchair", catalogo: "armchair", archivo: "mobiliario", uso: "Mobiliario", tipo: "Categoría" },
  { n: "Leaf", catalogo: "leaf", archivo: "jardineria", uso: "Jardinería", tipo: "Categoría" },
  { n: "Truck", catalogo: "truck", archivo: "mudanza", uso: "Mudanza", tipo: "Categoría" },
  { n: "Wind", catalogo: "wind", archivo: "aire-acondicionado", uso: "Aire acondicionado", tipo: "Servicio" },
  { n: "Fan", catalogo: "fan", archivo: "ventilacion", uso: "Ventilación", tipo: "Servicio" },
  { n: "Droplets", catalogo: "droplets", archivo: "plomeria", uso: "Plomería y agua", tipo: "Servicio" },
  { n: "Zap", catalogo: "zap", archivo: "electricidad", uso: "Electricidad", tipo: "Servicio" },
  { n: "Flame", catalogo: "flame", archivo: "gas", uso: "Gas y calor", tipo: "Servicio" },
];

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const dibujar = (nodo) =>
  nodo
    .map(([etiqueta, atributos]) => {
      const attrs = Object.entries(atributos)
        .filter(([k]) => k !== "key")
        .map(([k, v]) => `${k}="${esc(v)}"`)
        .join(" ");
      return `<${etiqueta} ${attrs} />`;
    })
    .join("");

mkdirSync(new URL("./amarillo/", SALIDA), { recursive: true });
mkdirSync(new URL("./sello/", SALIDA), { recursive: true });

const celdas = [];
const filas = [];

const COLUMNAS = 5;
const CELDA_W = 150;
const CELDA_H = 134;
const MARGEN = 16;

for (let i = 0; i < ICONOS.length; i++) {
  const { n, catalogo, archivo, uso, tipo } = ICONOS[i];
  const { __iconNode } = await import(new URL(`${catalogo}.js`, ICONOS_DIR));
  const nombre = `${archivo}.svg`;
  const glifo = dibujar(__iconNode);

  // El glifo solo, en amarillo.
  writeFileSync(
    new URL(`./amarillo/${nombre}`, SALIDA),
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
     viewBox="0 0 24 24" fill="none" stroke="${AMARILLO}" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round"
     role="img" aria-label="${esc(uso)}">${glifo}</svg>\n`,
    "utf-8",
  );

  // El sello, tal como aparece en el catálogo: 40 × 40, radio 10, glifo 19.
  writeFileSync(
    new URL(`./sello/${nombre}`, SALIDA),
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"
     viewBox="0 0 40 40" role="img" aria-label="${esc(uso)}">
  <rect width="40" height="40" rx="10" fill="${NEGRO}" />
  <g transform="translate(10.5 10.5) scale(0.79)" fill="none" stroke="${AMARILLO}"
     stroke-width="2.53" stroke-linecap="round" stroke-linejoin="round">${glifo}</g>
</svg>\n`,
    "utf-8",
  );

  filas.push({ nombre, n, uso, tipo });

  // La lámina: el sello, su nombre y para qué es.
  const col = i % COLUMNAS;
  const fila = Math.floor(i / COLUMNAS);
  const x = MARGEN + col * CELDA_W;
  const y = MARGEN + fila * CELDA_H;

  celdas.push(`
  <g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="${CELDA_W - 12}" height="${CELDA_H - 12}" rx="12"
          fill="#FFFFFF" stroke="#ECECEC" stroke-width="1" />
    <g transform="translate(${(CELDA_W - 12) / 2 - 20} 28)">
      <rect width="40" height="40" rx="10" fill="${NEGRO}" />
      <g transform="translate(10.5 10.5) scale(0.79)" fill="none" stroke="${AMARILLO}"
         stroke-width="2.53" stroke-linecap="round" stroke-linejoin="round">${glifo}</g>
    </g>
    <text x="${(CELDA_W - 12) / 2}" y="90" text-anchor="middle"
          font-family="Menlo, monospace" font-size="10.5" fill="${NEGRO}">${esc(archivo)}.svg</text>
    <text x="${(CELDA_W - 12) / 2}" y="105" text-anchor="middle"
          font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#717171">${esc(uso)}</text>
  </g>`);
}

const filasLamina = Math.ceil(ICONOS.length / COLUMNAS);
const ancho = MARGEN * 2 + COLUMNAS * CELDA_W - 12;
const alto = MARGEN * 2 + filasLamina * CELDA_H - 12;

writeFileSync(
  new URL("./lamina.svg", SALIDA),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}"
     viewBox="0 0 ${ancho} ${alto}" role="img"
     aria-label="Íconos de servicios de MiPRO, numerados">
  <rect width="${ancho}" height="${alto}" fill="#F6F6F5" />
${celdas.join("\n")}
</svg>
`,
  "utf-8",
);

copyFileSync(
  fileURLToPath(new URL("../node_modules/lucide-react/LICENSE", import.meta.url)),
  fileURLToPath(new URL("./LICENCIA.txt", SALIDA)),
);

writeFileSync(
  new URL("./README.md", SALIDA),
  `# Íconos de servicios · MiPRO

Los íconos que la app dibuja **en amarillo** en el catálogo: los 9 de las
categorías y los 5 que usan los servicios sueltos.

Cada uno viene en dos variantes:

- \`amarillo/\` el glifo solo, 24 × 24, trazo 2, en \`#FFEE00\`. Es el dibujo,
  para ponerlo sobre el fondo que haga falta. **Sobre blanco no se ve:** el
  amarillo de marca necesita fondo oscuro.
- \`sello/\` el glifo sobre el sello negro, 40 × 40, radio 10, glifo a 19.
  Es exactamente como se ve en la lista de categorías del catálogo.

\`lamina.svg\` los muestra a los 14 juntos.

| Archivo | Qué es | Tipo | Nombre del dibujo |
|---|---|---|---|
${filas
  .map((f) => `| \`${f.nombre}\` | ${f.uso} | ${f.tipo} | \`${f.n}\` |`)
  .join("\n")}

## Cómo se ven en la app

| Dónde | Tamaño | Trazo | Color |
|---|---|---|---|
| Lista de categorías del catálogo | 19 sobre sello negro de 40 | 2 | amarillo \`#FFEE00\` |
| Tarjeta de servicio, catálogo e Inicio | 12 sobre sello negro de 22 | 2.2 | amarillo \`#FFEE00\` |
| Ficha del servicio | 24, sin sello | 2 | negro |
| Resumen y configuración | 20 y 18, sin sello | 2 | gris |

El amarillo es para el sello oscuro. Sobre blanco el mismo ícono va en negro
o en gris, nunca en amarillo.

Licencia ISC, en \`LICENCIA.txt\`.
`,
  "utf-8",
);

console.log(`escrito docs/iconos-servicios/  ${ICONOS.length} íconos, 2 variantes cada uno`);
