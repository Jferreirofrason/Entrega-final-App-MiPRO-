# Íconos utilizados por la app MiPRO

## Librería

**lucide-react 0.487.0**, declarada en `package.json`. Licencia ISC.

Es la única librería de íconos del proyecto. La app no usa emojis como íconos de interfaz y no hay otra familia de íconos instalada.

## Qué hay en esta carpeta

Los **80 íconos que la app realmente usa**, extraídos uno por uno de la librería y guardados como 78 archivos SVG. No está la librería completa, que trae más de mil.

Cada SVG sale del `__iconNode` del propio paquete, con los atributos por defecto de lucide: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, extremos y uniones redondeados. El color lo hereda del CSS, igual que en la app.

Dos nombres de la librería pueden apuntar al mismo ícono. Los casos acá:

- `search.svg` lo importan como `Search` y `SearchIcon`.
- `x.svg` lo importan como `X` y `XIcon`.

## Tamaños y trazos

El tamaño y el grosor los define cada uso, no el archivo. La tabla de abajo lista los valores que aparecen en el código para cada ícono. Los que no tienen valor usan el de la librería (24 px, trazo 2) o lo reciben del componente que los dibuja, como los íconos de categoría del catálogo y los de `statusConfig.ts`.

Referencia rápida de la app: barra inferior 24 px trazo 2, botón de volver 20 px trazo 2, fila de notificación 20 px trazo 2.5, chevron de fila 16 a 18 px, íconos dentro de card 13 a 16 px.

## Navegación (13)

Barra inferior, botones de volver, chevrones de fila y acceso a la búsqueda.

| Nombre en el código | Archivo | Tamaños | Trazos | Dónde se usa |
|---|---|---|---|---|
| `ArrowLeft` | `arrow-left.svg` | 18, 20, px | 2, 2.1 | `app/components/agendar/EncabezadoFlujo.tsx`, `app/pages/AgregarProducto.tsx`, `app/pages/CatalogoServicios.tsx`, `app/pages/Configuracion.tsx`, `app/pages/DetalleCatalogo.tsx`, `app/pages/DetalleReclamo.tsx`, `app/pages/DetalleServicio.tsx`, `app/pages/ForgotPassword.tsx`, `app/pages/GarantiaAgregarDireccion.tsx`, `app/pages/GarantiaConfirmar.tsx`, `app/pages/GarantiaHub.tsx`, `app/pages/GarantiaProblema.tsx`, `app/pages/GarantiaProducto.tsx`, `app/pages/GarantiaRevisar.tsx`, `app/pages/ListaReclamos.tsx`, `app/pages/Login.tsx`, `app/pages/NotFound.tsx`, `app/pages/Notificaciones.tsx`, `app/pages/Perfil.tsx`, `app/pages/ProductoDetalle.tsx`, `app/pages/Productos.tsx`, `app/pages/ProyectosList.tsx`, `app/pages/RevisarLugar.tsx`, `app/pages/Signup.tsx`, `app/pages/Soporte.tsx`, `app/pages/Sugerencias.tsx` |
| `ChevronDown` | `chevron-down.svg` | 14, 16, px | 2 | `app/components/garantia/SelectorBuscable.tsx`, `app/pages/ForgotPassword.tsx`, `app/pages/Signup.tsx` |
| `ChevronLeft` | `chevron-left.svg` | del componente | de la librería (2) | `app/components/ui/calendar.tsx` |
| `ChevronRight` | `chevron-right.svg` | 14, 15, 16, 18, 20, px | 2, 2.5 | `app/components/home/AvisoProximaVisita.tsx`, `app/components/home/CitaCard.tsx`, `app/components/home/SeccionMisCitas.tsx`, `app/components/home/SeccionPromociones.tsx`, `app/components/home/SeccionServicios.tsx`, `app/components/reclamos/SeccionGarantia.tsx`, `app/components/reclamos/TarjetaReclamo.tsx`, `app/components/reclamos/TarjetaReclamoCompacta.tsx`, `app/components/reclamos/TarjetaReclamoHub.tsx`, `app/components/servicios/TarjetaServicio.tsx`, `app/components/ui/breadcrumb.tsx`, `app/components/ui/calendar.tsx`, `app/pages/AgregarProducto.tsx`, `app/pages/CatalogoServicios.tsx`, `app/pages/Configuracion.tsx`, `app/pages/Notificaciones.tsx`, `app/pages/Perfil.tsx`, `app/pages/ProductoDetalle.tsx`, `app/pages/Productos.tsx`, `app/pages/ReclamoGarantia.tsx`, `app/pages/Soporte.tsx` |
| `ChevronsUpDown` | `chevrons-up-down.svg` | del componente | de la librería (2) | `app/pages/AgregarProducto.tsx` |
| `Compass` | `compass.svg` | 22, px | de la librería (2) | `app/pages/AgregarProducto.tsx` |
| `Home` | `house.svg` | 22, px | de la librería (2) | `app/components/TabBar.tsx`, `app/pages/AgregarProducto.tsx` |
| `Search` | `search.svg` | 16, 18, 40, px | 1.5, 2 | `app/components/agendar/BuscadorDireccionMapa.tsx`, `app/components/home/BuscadorServicios.tsx`, `app/pages/AgregarProducto.tsx`, `app/pages/CatalogoServicios.tsx`, `app/pages/Configuracion.tsx`, `app/pages/Productos.tsx` |
| `SearchIcon` | `search.svg` | del componente | de la librería (2) | `app/components/ui/command.tsx` |
| `SearchX` | `search-x.svg` | 24, px | 2 | `app/pages/CatalogoServicios.tsx` |
| `ShieldCheck` | `shield-check.svg` | 14, 16, 20, 22, px | 2, 2.2, 2.5 | `app/components/TabBar.tsx`, `app/components/reclamos/SeccionGarantia.tsx`, `app/components/reclamos/TarjetaReclamoHub.tsx`, `app/pages/GarantiaHub.tsx`, `app/pages/Notificaciones.tsx`, `app/pages/ProductoDetalle.tsx` |
| `User` | `user.svg` | 13, 14, 16, px | 2 | `app/components/TabBar.tsx`, `app/components/home/AvisoProximaVisita.tsx`, `app/components/reclamos/HistorialCitas.tsx`, `app/components/reclamos/TarjetaReclamo.tsx`, `app/components/servicios/ListaCitasServicio.tsx`, `app/pages/Configuracion.tsx`, `app/pages/Perfil.tsx` |
| `Wrench` | `wrench.svg` | del componente | de la librería (2) | `app/components/TabBar.tsx`, `app/components/servicios/TarjetaServicio.tsx`, `app/data/catalogo.ts` |

## Acciones (31)

Lo que el usuario puede hacer: sumar, quitar, confirmar, editar, enviar, contactar.

| Nombre en el código | Archivo | Tamaños | Trazos | Dónde se usa |
|---|---|---|---|---|
| `Bell` | `bell.svg` | 22, px | 2 | `app/pages/Home.tsx` |
| `BellRing` | `bell-ring.svg` | del componente | de la librería (2) | `app/pages/Notificaciones.tsx` |
| `Building` | `building.svg` | del componente | de la librería (2) | `app/pages/AgregarProducto.tsx` |
| `Camera` | `camera.svg` | 18, 20, px | 1.5, 2 | `app/pages/AgregarProducto.tsx`, `app/pages/ConfigurarServicio.tsx` |
| `Check` | `check.svg` | 14, 16, 18, 24, 32, px | 2.5, 3 | `app/components/agendar/BuscadorDireccionMapa.tsx`, `app/components/garantia/SelectorBuscable.tsx`, `app/components/servicios/CalificacionServicio.tsx`, `app/pages/AgregarProducto.tsx`, `app/pages/Configuracion.tsx`, `app/pages/DireccionServicio.tsx`, `app/pages/GarantiaProblema.tsx`, `app/pages/GarantiaRevisar.tsx`, `app/pages/Productos.tsx`, `app/pages/RevisarLugar.tsx`, `app/pages/Sugerencias.tsx` |
| `Copy` | `copy.svg` | 14, px | 2.5 | `app/pages/GarantiaEnviada.tsx` |
| `CreditCard` | `credit-card.svg` | del componente | de la librería (2) | `app/pages/Configuracion.tsx` |
| `Edit` | `square-pen.svg` | 14, px | de la librería (2) | `app/pages/Configuracion.tsx` |
| `Edit2` | `pen.svg` | 14, px | de la librería (2) | `app/pages/AgregarProducto.tsx` |
| `Eye` | `eye.svg` | 16, 18, px | 2 | `app/pages/Configuracion.tsx`, `app/pages/ForgotPassword.tsx`, `app/pages/Login.tsx`, `app/pages/Signup.tsx` |
| `EyeOff` | `eye-off.svg` | 16, 18, px | 2 | `app/pages/Configuracion.tsx`, `app/pages/ForgotPassword.tsx`, `app/pages/Login.tsx`, `app/pages/Signup.tsx` |
| `Headphones` | `headphones.svg` | del componente | de la librería (2) | `app/pages/Perfil.tsx` |
| `HelpCircle` | `circle-help.svg` | 14, px | de la librería (2) | `app/pages/AgregarProducto.tsx` |
| `IdCard` | `id-card.svg` | 16, px | 2 | `app/pages/Configuracion.tsx` |
| `ImagePlus` | `image-plus.svg` | 18, px | 2 | `app/pages/GarantiaProblema.tsx` |
| `Lock` | `lock.svg` | 10, px | de la librería (2) | `app/pages/AgregarProducto.tsx`, `app/pages/Configuracion.tsx` |
| `LogOut` | `log-out.svg` | 16, 18, 24, px | 2 | `app/pages/Perfil.tsx` |
| `Mail` | `mail.svg` | 20, px | 2 | `app/pages/Configuracion.tsx`, `app/pages/ForgotPassword.tsx`, `app/pages/Perfil.tsx`, `app/pages/Soporte.tsx` |
| `MapPin` | `map-pin.svg` | 16, 17, 18, 32, px | 2, 2.2 | `app/components/agendar/BuscadorDireccionMapa.tsx`, `app/pages/AgregarProducto.tsx`, `app/pages/Configuracion.tsx`, `app/pages/DireccionServicio.tsx` |
| `MessageCircle` | `message-circle.svg` | 18, px | 2 | `app/components/servicios/ContactarMiPRO.tsx`, `app/pages/Soporte.tsx` |
| `MessageSquare` | `message-square.svg` | del componente | de la librería (2) | `app/pages/Perfil.tsx` |
| `Minus` | `minus.svg` | 20, px | 2.5 | `app/pages/ConfigurarServicio.tsx` |
| `PenTool` | `pen-tool.svg` | del componente | de la librería (2) | `app/pages/ProductoDetalle.tsx` |
| `Phone` | `phone.svg` | 16, 18, 20, px | 2 | `app/components/servicios/ContactarMiPRO.tsx`, `app/pages/Configuracion.tsx`, `app/pages/ForgotPassword.tsx`, `app/pages/Perfil.tsx`, `app/pages/Soporte.tsx` |
| `Plus` | `plus.svg` | 14, 18, 20, px | 2, 2.5 | `app/pages/Configuracion.tsx`, `app/pages/ConfigurarServicio.tsx`, `app/pages/DireccionServicio.tsx`, `app/pages/GarantiaRevisar.tsx`, `app/pages/ProductoDetalle.tsx`, `app/pages/Productos.tsx` |
| `Save` | `save.svg` | del componente | de la librería (2) | `app/pages/AgregarProducto.tsx` |
| `Send` | `send.svg` | 18, px | 2 | `app/pages/Sugerencias.tsx` |
| `Settings` | `settings.svg` | del componente | de la librería (2) | `app/data/catalogo.ts`, `app/pages/Perfil.tsx` |
| `Star` | `star.svg` | 16, 24, 32, px | 2 | `app/components/servicios/CalificacionServicio.tsx`, `app/pages/AgregarProducto.tsx`, `app/pages/GarantiaEnviada.tsx`, `app/pages/Notificaciones.tsx`, `app/pages/Sugerencias.tsx` |
| `X` | `x.svg` | 12, 14, 15, 16, 18, 20, px | 2, 2.5, 3 | `app/components/LegalSheet.tsx`, `app/components/garantia/AyudaSheet.tsx`, `app/pages/AgregarProducto.tsx`, `app/pages/CatalogoServicios.tsx`, `app/pages/Configuracion.tsx`, `app/pages/ConfigurarServicio.tsx`, `app/pages/GarantiaProblema.tsx`, `app/pages/Perfil.tsx`, `app/pages/Productos.tsx` |
| `XIcon` | `x.svg` | del componente | de la librería (2) | `app/components/ui/dialog.tsx` |

## Estados (17)

Estado de una cita, de un caso de garantía o de una carga.

| Nombre en el código | Archivo | Tamaños | Trazos | Dónde se usa |
|---|---|---|---|---|
| `AlertCircle` | `circle-alert.svg` | 22, px | 2 | `app/components/home/BloqueError.tsx`, `app/utils/statusConfig.ts` |
| `AlertTriangle` | `triangle-alert.svg` | 16, px | 2.5 | `app/pages/GarantiaProblema.tsx` |
| `Calendar` | `calendar.svg` | del componente | de la librería (2) | `app/pages/AgregarProducto.tsx`, `app/pages/ProductoDetalle.tsx`, `app/utils/statusConfig.ts` |
| `CalendarCheck` | `calendar-check.svg` | del componente | de la librería (2) | `app/pages/Notificaciones.tsx` |
| `CalendarDays` | `calendar-days.svg` | 14, 16, 24, px | 2 | `app/components/home/AvisoProximaVisita.tsx`, `app/components/reclamos/TarjetaReclamo.tsx`, `app/components/servicios/TarjetaServicio.tsx`, `app/pages/AgregarProducto.tsx`, `app/pages/DetalleReclamo.tsx`, `app/pages/GarantiaEnviada.tsx`, `app/pages/ProyectosList.tsx` |
| `CheckCircle` | `circle-check-big.svg` | del componente | de la librería (2) | `app/utils/statusConfig.ts` |
| `CheckCircle2` | `circle-check.svg` | 13, 16, 32, 40, px | 2, 2.5 | `app/pages/DetalleReclamo.tsx`, `app/pages/ForgotPassword.tsx`, `app/pages/RevisarLugar.tsx`, `app/pages/Signup.tsx` |
| `Clock` | `clock.svg` | del componente | de la librería (2) | `app/pages/ProductoDetalle.tsx`, `app/utils/statusConfig.ts` |
| `Inbox` | `inbox.svg` | del componente | de la librería (2) | `app/pages/Notificaciones.tsx`, `app/utils/statusConfig.ts` |
| `Loader2` | `loader-circle.svg` | 16, 18, 20, px | 2.5 | `app/pages/AgregarProducto.tsx`, `app/pages/GarantiaConfirmar.tsx`, `app/pages/GarantiaProblema.tsx` |
| `Package` | `package.svg` | del componente | de la librería (2) | `app/pages/Productos.tsx` |
| `PauseCircle` | `circle-pause.svg` | del componente | de la librería (2) | `app/utils/statusConfig.ts` |
| `PlayCircle` | `circle-play.svg` | del componente | de la librería (2) | `app/utils/statusConfig.ts` |
| `RefreshCw` | `refresh-cw.svg` | del componente | de la librería (2) | `app/pages/Notificaciones.tsx`, `app/utils/statusConfig.ts` |
| `ShieldOff` | `shield-off.svg` | 16, px | 2.5 | `app/pages/ProductoDetalle.tsx` |
| `UserRound` | `user-round.svg` | del componente | de la librería (2) | `app/pages/Notificaciones.tsx` |
| `XCircle` | `circle-x.svg` | del componente | de la librería (2) | `app/utils/statusConfig.ts` |

## Servicios (15)

Un ícono por categoría de servicio y por tipo de producto registrado.

| Nombre en el código | Archivo | Tamaños | Trazos | Dónde se usa |
|---|---|---|---|---|
| `Armchair` | `armchair.svg` | del componente | de la librería (2) | `app/data/catalogo.ts` |
| `BedDouble` | `bed-double.svg` | del componente | de la librería (2) | `app/data/products.ts`, `app/pages/Productos.tsx` |
| `Bug` | `bug.svg` | del componente | de la librería (2) | `app/data/catalogo.ts` |
| `Droplets` | `droplets.svg` | del componente | de la librería (2) | `app/data/catalogo.ts` |
| `Fan` | `fan.svg` | del componente | de la librería (2) | `app/data/catalogo.ts`, `app/data/products.ts`, `app/pages/Productos.tsx` |
| `Flame` | `flame.svg` | del componente | de la librería (2) | `app/data/catalogo.ts`, `app/data/products.ts`, `app/pages/Productos.tsx` |
| `Hammer` | `hammer.svg` | del componente | de la librería (2) | `app/data/catalogo.ts` |
| `Leaf` | `leaf.svg` | del componente | de la librería (2) | `app/data/catalogo.ts` |
| `Paintbrush` | `paintbrush.svg` | del componente | de la librería (2) | `app/data/catalogo.ts` |
| `Refrigerator` | `refrigerator.svg` | del componente | de la librería (2) | `app/data/products.ts`, `app/pages/Productos.tsx` |
| `Sparkles` | `sparkles.svg` | del componente | de la librería (2) | `app/data/catalogo.ts` |
| `Truck` | `truck.svg` | del componente | de la librería (2) | `app/data/catalogo.ts` |
| `WashingMachine` | `washing-machine.svg` | del componente | de la librería (2) | `app/data/products.ts`, `app/pages/Productos.tsx` |
| `Wind` | `wind.svg` | del componente | de la librería (2) | `app/data/catalogo.ts`, `app/data/products.ts`, `app/pages/Productos.tsx` |
| `Zap` | `zap.svg` | del componente | de la librería (2) | `app/data/catalogo.ts` |

## Documentación (4)

Avisos, ayudas y las franjas horarias del agendamiento.

| Nombre en el código | Archivo | Tamaños | Trazos | Dónde se usa |
|---|---|---|---|---|
| `ClipboardList` | `clipboard-list.svg` | 30, px | 2.5 | `app/pages/RevisarLugar.tsx` |
| `Info` | `info.svg` | 14, 16, px | 2 | `app/components/home/SeccionPromociones.tsx`, `app/pages/AgregarProducto.tsx`, `app/pages/DetalleCatalogo.tsx`, `app/pages/DetalleServicio.tsx`, `app/pages/FechaServicio.tsx`, `app/pages/GarantiaRevisar.tsx`, `app/pages/ProyectosList.tsx`, `app/pages/ResumenServicio.tsx`, `app/pages/RevisarLugar.tsx` |
| `Moon` | `moon.svg` | del componente | de la librería (2) | `app/pages/FechaServicio.tsx` |
| `Sun` | `sun.svg` | del componente | de la librería (2) | `app/pages/FechaServicio.tsx` |

## Íconos propios, que no son de la librería

| Qué | Dónde vive | Nota |
|---|---|---|
| Isotipo de MiPRO, la mano | `src/imports/svg-0uyjwt8dfn.ts` más `src/app/components/ManoMiPRO.tsx` | Se dibuja en línea. La copia exportada está en `imagenes/branding/isotipo-mano-mipro.svg` |
| Diagrama del comprobante | `src/app/components/garantia/ReciboAyuda.tsx` | SVG dibujado en el componente, con dos variantes. Las copias están en `imagenes/ilustraciones/` |

## Lo que no se incluyó

- La librería completa de lucide. Solo los íconos usados.
- Los íconos de las primitivas de `src/app/components/ui/` que la app no importa.
