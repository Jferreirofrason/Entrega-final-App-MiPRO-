// Hoja de íconos numerada para el documento de detalles de diseño, y el
// repositorio de los íconos sueltos.
//
//   node docs/hoja-de-iconos.mjs
//
// Escribe dos cosas:
//
//   docs/capturas-hu-1518-1579/iconos.svg   la grilla con los números, que
//                                           son los que citan las tablas
//   docs/iconos/NN-nombre.svg               un archivo por ícono, para tomar
//
// Los dibujos NO se copian a mano: se leen de `lucide-react` en
// node_modules, del mismo paquete y la misma versión que compila la app. Si
// la librería cambia de versión, la hoja y los archivos cambian con ella.

import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ICONOS_DIR = new URL(
  "../node_modules/lucide-react/dist/esm/icons/",
  import.meta.url,
);
const SALIDA = fileURLToPath(
  new URL("./capturas-hu-1518-1579/iconos.svg", import.meta.url),
);
const REPO = new URL("./iconos/", import.meta.url);

// Orden de la hoja. `nombre` es el que se importa en el código; `catalogo` es
// el nombre con el que se lo busca en lucide.dev. Cuando los dos no coinciden
// es porque el nombre del código es un alias viejo de la librería.
const HOJA = [
  { nombre: "ArrowLeft", catalogo: "arrow-left", uso: "Volver" },
  { nombre: "MoreVertical", catalogo: "ellipsis-vertical", uso: "Más opciones" },
  { nombre: "Bell", catalogo: "bell", uso: "Notificaciones" },
  { nombre: "User", catalogo: "user", uso: "Perfil sin inicial" },
  { nombre: "Trash2", catalogo: "trash-2", uso: "Eliminar" },
  { nombre: "CheckCheck", catalogo: "check-check", uso: "Marcar leídas" },
  { nombre: "X", catalogo: "x", uso: "Cerrar" },
  { nombre: "Inbox", catalogo: "inbox", uso: "Solicitud recibida" },
  { nombre: "Clock", catalogo: "clock", uso: "En revisión" },
  { nombre: "Calendar", catalogo: "calendar", uso: "Cita programada" },
  { nombre: "CheckCircle", catalogo: "circle-check-big", uso: "Completada" },
  { nombre: "XCircle", catalogo: "circle-x", uso: "Cancelada" },
];

const COLUMNAS = 4;
const CELDA_W = 168;
const CELDA_H = 132;
const MARGEN = 16;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Convierte el nodo de lucide en etiquetas SVG. */
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

mkdirSync(REPO, { recursive: true });

const celdas = [];
const sueltos = [];

for (let i = 0; i < HOJA.length; i++) {
  const { nombre, catalogo, uso } = HOJA[i];
  const { __iconNode } = await import(new URL(`${catalogo}.js`, ICONOS_DIR));

  // El ícono suelto, para tomarlo de la carpeta. Va con `currentColor` y sin
  // tamaño fijo en el trazo: el color y el cuerpo los pone quien lo usa.
  const archivo = `${String(i + 1).padStart(2, "0")}-${catalogo}.svg`;
  writeFileSync(
    new URL(archivo, REPO),
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round"
     role="img" aria-label="${esc(uso)}">${dibujar(__iconNode)}</svg>\n`,
    "utf-8",
  );
  sueltos.push({ archivo, nombre, catalogo, uso });

  const col = i % COLUMNAS;
  const fila = Math.floor(i / COLUMNAS);
  const x = MARGEN + col * CELDA_W;
  const y = MARGEN + fila * CELDA_H;
  const numero = String(i + 1).padStart(2, "0");

  celdas.push(`
  <g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="${CELDA_W - 12}" height="${CELDA_H - 12}" rx="12"
          fill="#FFFFFF" stroke="#ECECEC" stroke-width="1" />

    <circle cx="20" cy="20" r="12" fill="#FFEE00" />
    <text x="20" y="24.5" text-anchor="middle"
          font-family="Helvetica, Arial, sans-serif" font-size="11"
          font-weight="600" fill="#000000">${numero}</text>

    <g transform="translate(${(CELDA_W - 12) / 2 - 16} 38)"
       fill="none" stroke="#000000" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
      <svg viewBox="0 0 24 24" width="32" height="32">${dibujar(__iconNode)}</svg>
    </g>

    <text x="${(CELDA_W - 12) / 2}" y="94" text-anchor="middle"
          font-family="Menlo, monospace" font-size="11" fill="#000000">${esc(nombre)}</text>
    <text x="${(CELDA_W - 12) / 2}" y="110" text-anchor="middle"
          font-family="Helvetica, Arial, sans-serif" font-size="10.5" fill="#717171">${esc(uso)}</text>
  </g>`);
}

const filas = Math.ceil(HOJA.length / COLUMNAS);
const ancho = MARGEN * 2 + COLUMNAS * CELDA_W - 12;
const alto = MARGEN * 2 + filas * CELDA_H - 12;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}"
     viewBox="0 0 ${ancho} ${alto}" role="img"
     aria-label="Íconos de la entrega, numerados">
  <rect width="${ancho}" height="${alto}" fill="#F6F6F5" />
${celdas.join("\n")}
</svg>
`;

mkdirSync(new URL("./capturas-hu-1518-1579/", import.meta.url), {
  recursive: true,
});
writeFileSync(SALIDA, svg, "utf-8");

// La licencia viaja con los archivos: los dibujos son de lucide (ISC).
copyFileSync(
  fileURLToPath(new URL("../node_modules/lucide-react/LICENSE", import.meta.url)),
  fileURLToPath(new URL("LICENCIA.txt", REPO)),
);

// El índice de la carpeta, para que se entienda sin abrir archivo por archivo.
writeFileSync(
  new URL("README.md", REPO),
  `# Íconos · MiPRO

Los 12 íconos de Notificaciones y del encabezado de Inicio, uno por archivo.

- **24 × 24, trazo 2, color heredado.** El color y el cuerpo de cada uso
  están en la sección 1.5 del documento de detalles de diseño.
- **El número del nombre manda.** Es el mismo en la lámina del documento y en
  la columna «Icono» de las tablas de pantalla.

| # | Archivo | Nombre | Dónde se usa |
|---|---|---|---|
${sueltos
  .map(
    (s, i) =>
      `| ${String(i + 1).padStart(2, "0")} | \`${s.archivo}\` | \`${s.nombre}\` | ${s.uso} |`,
  )
  .join("\n")}

Licencia ISC, en \`LICENCIA.txt\`.
`,
  "utf-8",
);

console.log(`escrito docs/capturas-hu-1518-1579/iconos.svg  ${HOJA.length} íconos`);
console.log(`escrito docs/iconos/                          ${HOJA.length} archivos sueltos`);
