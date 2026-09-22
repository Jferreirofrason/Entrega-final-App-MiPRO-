# Imágenes utilizadas por la app MiPRO

Todas las imágenes que la app muestra, con su origen y dónde aparecen. Las fotos de servicios, promociones y el avatar **no están en el repositorio**: la app las pide a Unsplash en tiempo de ejecución. Acá están descargadas para que el paquete quede completo.

## Resumen

| | |
|---|---|
| Archivos locales del repositorio | 2 logos SVG |
| Archivos exportados del código | 3 (isotipo, dos diagramas) más el placeholder |
| Fotos remotas descargadas | 27 |
| Fotos remotas que ya no existen | 1 |

## Branding

| Archivo | Ruta original | Dónde se usa | Formato | Origen | Nota |
|---|---|---|---|---|---|
| `isotipo-mano-mipro.svg` | `src/imports/svg-0uyjwt8dfn.ts (paths) + src/app/components/ManoMiPRO.tsx (colores)` | Confirmación de solicitud de servicio, Confirmación de solicitud de garantía, Agregar producto y el flujo anterior de reclamo (components/ManoMiPRO.tsx) | SVG 24.0707×36.6186 | exportada del código | Exportado de los paths de src/imports/svg-0uyjwt8dfn.ts, con los colores que aplica el componente. No es un archivo del repositorio: en la app el SVG se dibuja en línea. |
| `logo-cochez.svg` | `src/imports/cochez-logo.svg` | Encabezado del comprobante simulado del diagrama de ayuda (components/garantia/ReciboAyuda.tsx) | SVG 111×23 | local | Copia exacta de src/imports/cochez-logo.svg |
| `logo-mipro.svg` | `src/imports/logo.svg` | Pantallas de acceso: Welcome, Login, Signup y Recuperar contraseña (importado como logoUrl) | SVG 310.81×93.87 | local | Copia exacta de src/imports/logo.svg |

## Servicios

Fotos de demostración de Unsplash. Alimentan la ficha de cada servicio, las cards destacadas del Home y los fixtures de Mis servicios.

| Archivo | URL original | Dónde se usa | Formato | Origen | Nota |
|---|---|---|---|---|---|
| `armado-de-muebles.jpg` | `https://images.unsplash.com/photo-1538688525198-9b88f6f53126?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Armado de muebles" (Mobiliario) | JPEG 1080×810 | remota (Unsplash) |  |
| `fumigacion-del-hogar.jpg` | `https://images.unsplash.com/photo-1593999094742-4f5280054b23?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Fumigación del hogar" (Fumigación) | JPEG 1080×1620 | remota (Unsplash) |  |
| `instalacion-de-calentador-electrico-de-paso.jpg` | `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de calentador eléctrico de paso" (Instalación) | JPEG 1080×720 | remota (Unsplash) |  |
| `instalacion-de-estufa-a-gas.jpg` | `https://images.unsplash.com/photo-1607324772107-8ad6740ca195?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de estufa a gas" (Instalación) · Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de estufa empotrable a gas" (Instalación) | JPEG 1080×720 | remota (Unsplash) |  |
| `instalacion-de-estufa-electrica.jpg` | `https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=tiny…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de estufa eléctrica" (Instalación) | JPEG 1080×647 | remota (Unsplash) |  |
| `instalacion-de-horno-empotrable-a-gas.jpg` | `https://images.unsplash.com/photo-1639405069836-f82aa6dcb900?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de horno empotrable a gas" (Instalación) | JPEG 1080×720 | remota (Unsplash) |  |
| `instalacion-de-lavadora.jpg` | `https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de lavadora" (Instalación) | JPEG 1080×720 | remota (Unsplash) |  |
| `instalacion-de-lavavajillas.jpg` | `https://images.unsplash.com/photo-1620568400263-6f1cf95b9e30?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de lavavajillas" (Instalación) | JPEG 1080×720 | remota (Unsplash) |  |
| `instalacion-de-refrigeradora-french-door.jpg` | `https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de refrigeradora French Door" (Instalación) | JPEG 1080×1620 | remota (Unsplash) |  |
| `instalacion-de-secadora-a-gas.jpg` | `https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de secadora a gas" (Instalación) | JPEG 1080×720 | remota (Unsplash) |  |
| `instalacion-de-secadora-electrica.jpg` | `https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de secadora eléctrica" (Instalación) | JPEG 1080×747 | remota (Unsplash) |  |
| `instalacion-de-vinera.jpg` | `https://images.unsplash.com/photo-1728177196098-ef48bfb63832?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de vinera" (Instalación) | JPEG 1080×1620 | remota (Unsplash) |  |
| `limpieza-de-ductos.jpg` | `https://images.unsplash.com/photo-1615309662243-70f6df917b59?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Limpieza de ductos" (Limpieza) | JPEG 1080×803 | remota (Unsplash) |  |
| `limpieza-profunda-del-hogar.jpg` | `https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Limpieza profunda del hogar" (Limpieza) | JPEG 1080×720 | remota (Unsplash) |  |
| `mantenimiento-de-aire-acondicionado.jpg` | `https://images.unsplash.com/photo-1718203862467-c33159fdc504?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Mantenimiento de aire acondicionado" (Mantenimiento) · Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de aire acondicionado" (Instalación) | JPEG 1080×720 | remota (Unsplash) |  |
| `mantenimiento-de-calentador.jpg` | `https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Mantenimiento de calentador" (Mantenimiento) · Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación de calentador a gas de paso" (Instalación) | JPEG 1080×810 | remota (Unsplash) |  |
| `mantenimiento-de-jardin.jpg` | `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Mantenimiento de jardín" (Jardinería) | JPEG 1080×720 | remota (Unsplash) |  |
| `mudanza-dentro-de-la-ciudad.jpg` | `https://images.unsplash.com/photo-1600518464441-9154a4dea21b?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Mudanza dentro de la ciudad" (Mudanza) | JPEG 1080×456 | remota (Unsplash) |  |
| `pintura-interior-proyecto.jpg` | `https://images.unsplash.com/photo-1643804475756-ca849847c78a?crop=entropy&cs=t…` | Fixture de Mis servicios · "Pintura interior" | JPEG 1080×1440 | remota (Unsplash) |  |
| `pintura-interior.jpg` | `https://images.unsplash.com/photo-1562259949-e8e7689d7828?crop=entropy&cs=tiny…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Pintura interior" (Pintura) · Carrusel de promociones del Home · "Pintura interior" | JPEG 1080×754 | remota (Unsplash) |  |
| `remodelacion-de-cocina.jpg` | `https://images.unsplash.com/photo-1708915965975-2a950db0e215?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Remodelación de cocina" (Instalación) · Carrusel de promociones del Home · "Remodelación de cocina" · Carrusel de promociones del Home · "Mantenimiento preventivo de aire acondicionado" | JPEG 1080×771 | remota (Unsplash) |  |
| `remodelacion-de-cocina.jpg` | `https://images.unsplash.com/photo-1708915965975-2a950db0e215?crop=entropy&cs=t…` | Fixture de Mis servicios · "Remodelación de cocina" | JPEG 1080×771 | remota (Unsplash) | Otra URL del mismo archivo; se conserva una sola copia |
| `renovacion-de-bano.jpg` | `https://images.unsplash.com/photo-1758448018619-4cbe2250b9ad?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Renovación de baño" (Instalación) · Carrusel de promociones del Home · "Renovación de baño" | JPEG 1080×1440 | remota (Unsplash) |  |
| `renovacion-de-bano.jpg` | `https://images.unsplash.com/photo-1758448018619-4cbe2250b9ad?crop=entropy&cs=t…` | Fixture de Mis servicios · "Instalación de aire acondicionado" | JPEG 1080×1440 | remota (Unsplash) | Otra URL del mismo archivo; se conserva una sola copia |
| `revision-de-plomeria.jpg` | `https://images.unsplash.com/photo-1585704032915-c3400ca199e7?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Revisión de plomería" (Reparación) | JPEG 1080×720 | remota (Unsplash) |  |
| `revision-electrica.jpg` | `https://images.unsplash.com/photo-1767514536570-83d70c024247?crop=entropy&cs=t…` | Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Revisión eléctrica" (Reparación) · Catálogo de servicios: ficha /catalogo/:id, destacados del Home · "Instalación eléctrica" (Instalación) · Carrusel de promociones del Home · "Revisión eléctrica" | JPEG 1080×720 | remota (Unsplash) |  |
| `revision-electrica.jpg` | `https://images.unsplash.com/photo-1767514536570-83d70c024247?crop=entropy&cs=t…` | Fixture de Mis servicios · "Instalación eléctrica" | JPEG 1080×720 | remota (Unsplash) | Otra URL del mismo archivo; se conserva una sola copia |

## Perfiles

Avatar de la usuaria de demostración.

| Archivo | Ruta u URL original | Dónde se usa | Formato | Origen | Nota |
|---|---|---|---|---|---|
| `avatar-maria-gonzalez.jpg` | `https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=faces&fit=cr…` | Avatar de la usuaria de demostración: saludo del Home y Mi perfil · "sin-nombre" | JPEG 160×160 | remota (Unsplash) |  |

## Otros

Fotos simuladas de producto y el recuadro que se muestra cuando una imagen no carga.

| Archivo | Ruta u URL original | Dónde se usa | Formato | Origen | Nota |
|---|---|---|---|---|---|
| `foto-simulada-producto-2.jpg` | `https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=200&auto=f…` | Fotos simuladas que agrega el botón "Agregar fotos" en Agregar producto (mockPhotos en AgregarProducto.tsx) | JPEG 200×300 | remota (Unsplash) |  |
| `foto-simulada-producto-3.jpg` | `https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=200&auto=f…` | Fotos simuladas que agrega el botón "Agregar fotos" en Agregar producto (mockPhotos en AgregarProducto.tsx) | JPEG 200×133 | remota (Unsplash) |  |
| `placeholder-imagen-no-carga.svg` | `src/app/components/figma/ImageWithFallback.tsx (data URI)` | Se muestra en lugar de cualquier imagen que falle al cargar (components/figma/ImageWithFallback.tsx) | SVG 88×88 | placeholder, local | Estaba embebido como data URI en el componente; acá va extraído a un archivo. |

## Ilustraciones

El diagrama del comprobante que abre la ayuda del paso 1 de garantía. Lo dibuja `src/app/components/garantia/ReciboAyuda.tsx` en línea, con dos variantes según qué dato resalta. Estas dos copias se exportaron del DOM de la app publicada, con el logo de Cochez embebido para que los archivos se abran solos.

| Archivo | Qué resalta | Dónde se usa |
|---|---|---|
| `diagrama-comprobante-factura.svg` | El número de factura, debajo del código de barras | Ayuda "¿Dónde encuentro la factura?" |
| `diagrama-comprobante-codigo.svg` | El código de producto, junto al nombre del producto | Ayuda "¿Dónde encuentro el código de producto?" |

## Promociones

Sin archivos propios: el carrusel reusa las fotos del catálogo. El detalle está en `promociones/LEEME.md`.

## Lo que no se pudo recuperar

| Recurso | Dónde se usa | Qué pasó |
|---|---|---|
| `https://images.unsplash.com/photo-1523413363574-c3c4447df219?q=80&w=200&auto=for` | Fotos simuladas que agrega el botón "Agregar fotos" en Agregar producto (mockPhotos en AgregarProducto.tsx) | La URL devuelve **404**: la foto ya no existe en Unsplash. En la app se ve el recuadro de imagen que no carga |

## Archivos de imagen del repositorio que la app no usa

Están en el código pero ningún componente alcanzable los importa, así que no se incluyeron en el ZIP.

| Archivo | Por qué no se usa |
|---|---|
| `src/assets/32d8caa0beed8d5a79da0d0bd886bc58875e9286.png` | Logo de banco. Solo lo importa `src/imports/MetodosDePago*.tsx`, que no se monta en ninguna ruta |
| `src/assets/895cf661405c840396c3950c5965bf6b4bd8faa6.png` | Ídem |
| `src/imports/logo-1.svg` | Variante del logo que ningún archivo importa |

## Licencias

Las fotos son de Unsplash y están en la app como contenido de demostración, no como material de marca licenciado. El catálogo de fotos definitivo tiene que salir del PIM. Los logos de MiPRO y de Cochez son de la marca.
