# Entrega final — App MiPRO

## Prototipo publicado

https://app-mipro-app.vercel.app

## Contenido de la entrega

- Código y archivos de la aplicación.
- Recursos visuales utilizados.
- ZIP de la aplicación completa.
- ZIP de iconos.
- ZIP de imágenes.
- Documentación de referencia.

## Nota sobre recursos visuales

Las imágenes incluidas se entregan como referencia de los recursos utilizados en el prototipo actual. El equipo de Contenido deberá validar su uso definitivo o reemplazarlas cuando corresponda.

## Seguridad

Este repositorio no incluye credenciales, tokens ni variables de entorno reales.

Se revisó el paquete completo, incluido el interior de los tres ZIP, buscando archivos `.env`, `.pem`, claves privadas, `node_modules`, builds, caches y archivos de sistema. No se encontró ninguno, así que no hubo que excluir nada de la entrega. El `.gitignore` de la raíz deja esas rutas bloqueadas de ahí en adelante.

---

## Estructura del repositorio

```text
entrega-final-app-mipro/
├── README.md                    este archivo
├── .gitignore                   exclusiones de credenciales, builds y archivos de sistema
├── manifest.json                inventario del paquete, con hash de cada ZIP
├── App-MiPRO-completa.zip       el proyecto entero, listo para instalar y correr
├── Iconos-MiPRO.zip             los 80 íconos que usa la app, en SVG
├── Imagenes-MiPRO.zip           todas las imágenes que muestra la app
└── fuentes/                     lo mismo que los dos últimos ZIP, sin comprimir
    ├── iconos/
    └── imagenes/
```

`fuentes/` está para poder mirar los recursos sin descomprimir nada. El contenido es idéntico al de los ZIP.

La documentación de diseño (`docs/mipro-design-handoff.md` y su versión en PDF, más las capturas de las 20 pantallas) viaja dentro de `App-MiPRO-completa.zip`.

## Stack

| | |
|---|---|
| Framework | React 18.3.1 |
| Build | Vite 6.3.5 |
| Lenguaje | TypeScript 6 |
| Estilos | Tailwind CSS 4.1.12, más tokens propios en `src/styles/theme.css` |
| Ruteo | react-router 7.13.0, con `createHashRouter`: todas las URL llevan `#` |
| Componentes base | Radix UI, con las primitivas de shadcn en `src/app/components/ui/` |
| Íconos | lucide-react 0.487.0 |
| Gestor de paquetes | npm, con `package-lock.json` |

No es Next.js. Es una SPA de Vite que se sirve como estático.

## Instalar y ejecutar

Hace falta Node 20 o más y npm. Probado con Node 24.14.1.

```bash
unzip App-MiPRO-completa.zip
cd App-MiPRO
npm install
npm run dev
```

Vite imprime la URL local, normalmente `http://localhost:5173`. La app abre en la pantalla de acceso; con cualquier dato entra a la sesión de demostración.

Los otros comandos del proyecto:

```bash
npm run lint     # tsc --noEmit, chequeo de tipos
npm test         # 188 pruebas de la lógica, con el runner de Node
npm run build    # vite build --emptyOutDir, deja el estático en dist/
```

## Build y deploy

El build es `npm run build` y la salida queda en `dist/`. El deploy actual se hace con la CLI de Vercel (`npx vercel --prod`) desde una copia del proyecto **sin la carpeta `.git`**: si la carpeta que se deploya contiene `.git`, Vercel la trata como un deploy de Git y lo bloquea, porque la cuenta de Vercel no tiene conectada la de GitHub. Ponerlo en `.vercelignore` no alcanza, porque Vercel lee los metadatos de Git antes de aplicar los ignores.

No hay `vercel.json`. Con hash routing no hacen falta reescrituras.

## Variables de entorno

La app **funciona sin ninguna variable**. En el código hay una sola referencia: `src/services/mapsService.ts` lee `VITE_GEMINI_API_KEY` o `GEMINI_API_KEY` para buscar direcciones con el SDK de Google. Sin clave, la función devuelve una lista vacía y no rompe nada, y además ningún componente importa ese servicio: hoy es código sin uso.

No hay `.env` ni `.env.example` en el paquete. Si en algún momento se usa esa búsqueda, la variable va en un `.env` local, nunca en el repositorio.

## Origen de los íconos

Todos los íconos de interfaz salen de **lucide-react 0.487.0**, licencia ISC. Es la única librería de íconos del proyecto.

`Iconos-MiPRO.zip` no trae la librería completa: trae los **80 íconos que la app realmente usa**, extraídos uno por uno y guardados como 78 archivos SVG, organizados por rol (`navegacion/`, `acciones/`, `estados/`, `servicios/`, `documentacion/`). `iconos-utilizados.md` lista cada uno con su nombre exacto en el código, el archivo, los tamaños y grosores de trazo, y los componentes y pantallas donde aparece.

Los dos gráficos propios —el isotipo de la mano y el diagrama del comprobante— no son íconos de librería: se dibujan en el código. Las copias están en las imágenes, en `branding/` e `ilustraciones/`.

## Origen de las imágenes

```text
imagenes/
├── branding/         logo de MiPRO, logo de Cochez, isotipo de la mano
├── servicios/        las fotos del catálogo y de los fixtures de Mis servicios
├── promociones/      sin archivos propios, ver LEEME.md
├── perfiles/         el avatar de la usuaria de demostración
├── ilustraciones/    el diagrama del comprobante, en sus dos variantes
├── otros/            fotos simuladas de producto y el recuadro de imagen que no carga
└── imagenes-utilizadas.md
```

Hay tres procedencias distintas:

- **Del repositorio.** Los dos logos SVG, `src/imports/logo.svg` y `src/imports/cochez-logo.svg`.
- **Exportadas del código.** El isotipo de la mano y los dos diagramas del comprobante se dibujan en línea en los componentes. Las copias se generaron a partir de esos mismos paths y del DOM de la app publicada, sin rediseñar nada.
- **Remotas.** Las fotos de servicios, las de promociones y el avatar **no están en el repositorio de la app**: se piden a Unsplash cada vez que se abre. Acá están descargadas para que el paquete quede completo.

`imagenes-utilizadas.md` lista cada archivo con su ruta o URL original, la pantalla donde se usa, el formato, las dimensiones y si es local, remota o placeholder.

El carrusel de promociones no tiene fotos propias: reusa las del catálogo. Por eso `promociones/` solo lleva un `LEEME.md` que dice qué foto usa cada promoción.

## Limitaciones conocidas

**Del paquete**

- Una foto no se pudo recuperar: `photo-1523413363574-c3c4447df219` de Unsplash devuelve 404. Es una de las tres fotos simuladas que agrega el botón "Agregar fotos" en Agregar producto. En la app se ve el recuadro de imagen que no carga.
- Las fotos de Unsplash son contenido de demostración, no material de marca licenciado. El catálogo definitivo tiene que salir del PIM.
- El ZIP completo no incluye la carpeta `.git`, así que no lleva el historial del proyecto de origen. Tampoco incluye `node_modules`, `dist` ni `.vercel`; los dos primeros se regeneran con `npm install` y `npm run build`.

**De la app**

- **No hay backend.** Los datos salen de fixtures en `src/app/data/` y el estado de sesión vive en `sessionStorage`. Al recargar la pestaña se pierde todo lo cargado.
- **El mapa del alta de dirección es un dibujo**, no un mapa: los lugares salen de `src/app/data/lugaresSimulados.ts`.
- **La tipografía Helvetica Neue LT Std se carga con `local()`.** Si la máquina no la tiene instalada, cae a Arial. No hay archivos de fuente en el repositorio, así que falta decidir si se licencia y se sirve, o se adopta otra.
- **No hay diseño de tablet ni de escritorio.** A partir de 640 px de ancho y 520 px de alto, la app se muestra dentro de un marco de teléfono de 393 × 852.
- **No hay modo oscuro.**
- **Notificaciones locales**, sin push ni persistencia.
- De 117 componentes y páginas, 74 se alcanzan desde `src/main.tsx`. Los otros 43 son 8 componentes reemplazados y 35 primitivas de shadcn que la app no importa.

El detalle completo, con los 32 pendientes e inconsistencias, está en `docs/mipro-design-handoff.md`, dentro del ZIP del proyecto.
