# Dónde vive el Historial de solicitudes

Nota corta de arquitectura de información. Noviembre de 2026.

## La decisión

El historial **no es un sexto tab**. Es una pantalla única, `#/historial`,
que vive adentro de Perfil y tiene accesos directos desde los dos módulos
donde la persona consulta el seguimiento más seguido.

## Por qué no un tab

La barra ya tiene cinco entradas: Inicio, Servicios, Productos, Garantía y
Perfil. Medido a 390 px, cada una ocupa 78 px de ancho y la etiqueta más
larga ("Productos") mide 53. Un sexto ítem las baja a 65 px: las etiquetas
dejan de entrar y los targets se acercan al mínimo táctil de 44. El costo
se paga en los cinco módulos que ya están, para una pantalla de consulta.

## Las tres puertas

| Desde | Ruta | Entra con |
|---|---|---|
| Perfil → Historial de solicitudes | `#/historial` | sin filtros |
| Inicio → Mis servicios, "Ver todos" | `#/historial?tipo=servicios` | Servicios |
| Garantía → "Ver todos" | `#/historial?tipo=garantias` | Garantías |

También acepta `?estado=activos` y `?estado=finalizados`.

**El tab encendido sigue a la puerta** (`logic/tabs.ts`): entrar desde
Garantía y ver "Perfil" marcado se lee como si la app te hubiera cambiado
de sección sin avisar. Desde Perfil, o con la ruta pelada, enciende Perfil.

## Qué NO hace

No duplica datos ni detalle. Lee los servicios y los casos de garantía que
la app ya tiene (`logic/servicios.ts`, `logic/reclamos.ts`), los normaliza a
una fila común (`logic/misSolicitudes.ts`) y cada fila abre el detalle que
ya existe: `/servicios/:id` o `/reclamos/:id`. Es una **puerta**, no un
modelo: si un estado cambia, cambia en su módulo.

## Vocabulario de estados

Uno solo para los dos tipos, el que ya definía el módulo de garantías:

```
Solicitud recibida · En revisión · Cita programada · Completada · Cancelada
```

Regla que lo sostiene: **el estado de UNA visita no clasifica a la
solicitud entera**. Un servicio con una visita "En curso" es, para el caso,
una "Cita programada"; que esté sucediendo ahora lo dice el detalle de esa
visita. Los estados de visita son otros cinco y viven en
`logic/estadosCita.ts`.

## Rutas anteriores

`#/mis-solicitudes` redirige a `#/historial`. Era la misma pantalla; cambió
de nombre al pasar a ser el historial completo.
