# docs

Documentación de diseño de la app MiPRO. **No afecta a la app**: acá no se importa nada del código de `src/` y nada de `src/` importa esto.

| Archivo | Qué es |
|---|---|
| `mipro-design-handoff.md` | **La fuente de verdad.** El documento de handoff de diseño para desarrollo |
| `mipro-design-handoff.html` | La misma cosa, legible en el navegador. Se genera, no se edita a mano |
| `mipro-design-handoff.pdf` | La versión imprimible. Se genera, no se edita a mano |
| `capturas/` | Las capturas de pantalla que usa el documento |
| `capturar.mjs` | Vuelve a tomar las 21 capturas de la app desplegada |
| `generar.py` | Markdown → HTML |
| `pdf.sh` | Markdown → HTML → PDF |

## Regenerar el HTML y el PDF

```bash
sh docs/pdf.sh
```

Necesita `python3` con el paquete `markdown` y Google Chrome instalado. Si solo hace falta el HTML:

```bash
python3 docs/generar.py
```

## Volver a tomar las capturas

```bash
node docs/capturar.mjs
```

Toma las 21 pantallas de la app desplegada, a 375 px de ancho y factor de escala 2, y sobrescribe los PNG de `capturas/`. Necesita Google Chrome y Node 20 o más.

Dos cosas que el script resuelve y que a mano se rompen:

- **El alto es el real de cada pantalla**, medido en la propia página: 812 px (el viewport del teléfono) más lo que falte de scroll. Con un alto fijo mayor, la app se estira y queda una franja blanca entre el contenido y la barra inferior.
- **Espera a que carguen todas las imágenes** antes de fotografiar. Con `--screenshot` y `--virtual-time-budget` la foto sale antes de que terminen las imágenes remotas y los servicios aparecen como recuadros grises.

Por eso usa el protocolo de DevTools en lugar del `--screenshot` de la línea de comandos.
