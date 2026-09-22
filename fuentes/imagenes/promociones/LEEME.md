# Promociones

El carrusel de promociones del Home **no tiene fotos propias**: reusa las mismas fotos del catálogo de servicios. Por eso esta carpeta no tiene archivos y no se duplicó ninguna imagen.

Las cuatro promociones y la foto que usa cada una:

| Promoción | Archivo, en `servicios/` |
|---|---|
| Pintura interior | `../servicios/pintura-interior.jpg` |
| Remodelación de cocina | `../servicios/remodelacion-de-cocina.jpg` |
| Renovación de baño | `../servicios/renovacion-de-bano.jpg` |
| Revisión eléctrica | `../servicios/revision-electrica.jpg` |

Hay una quinta entrada en `src/app/data/promotions.ts`, `fixture-qa-titulo-largo`, que existe solo para probar títulos largos en QA y también reusa una foto de servicio.

El mapeo definitivo de promoción a servicio está pendiente del Product Owner: lo que hay en el repositorio son valores de prueba.
