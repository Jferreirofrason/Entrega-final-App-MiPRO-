#!/usr/bin/env python3
"""Numera la captura del modal de detalle de la notificación.

    python3 docs/numerar-modal-detalle.py

Las demás capturas del documento se numeran midiendo el DOM de la app
(`capturar-plantilla.mjs`). Esta no: el modal todavía no existe en el
prototipo, así que la referencia es una captura de la versión actual que
pasó negocio. Los puntos están puestos a mano sobre esa imagen, y por eso
la sección 3.6 marca sus medidas como a confirmar.

Entra  capturas-hu-1518-1579/p7-modal-detalle-original.png
Sale   capturas-hu-1518-1579/p7-modal-detalle.png
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

DOCS = Path(__file__).resolve().parent
CAPTURAS = DOCS / "capturas-hu-1518-1579"
ENTRA = CAPTURAS / "p7-modal-detalle-original.png"
SALE = CAPTURAS / "p7-modal-detalle.png"

ANCHO = 390          # el mismo ancho que las otras figuras
MARGEN = 62          # el aire de cada lado, donde van los números
RADIO = 12
SEPARACION = 28

# Cada punto: número, lado y a qué parte de la captura apunta, en las
# coordenadas de la imagen original (325 px de ancho).
PUNTOS = [
    {"n": 1, "lado": "izq", "x": 50, "y": 245},   # campana del tipo
    {"n": 2, "lado": "izq", "x": 88, "y": 239},   # título
    {"n": 3, "lado": "der", "x": 277, "y": 240},  # cerrar
    {"n": 4, "lado": "izq", "x": 45, "y": 290},   # texto completo
    {"n": 5, "lado": "izq", "x": 45, "y": 335},   # fecha y hora
    {"n": 6, "lado": "izq", "x": 45, "y": 388},   # botón Cerrar
]

AMARILLO = (255, 238, 0)
GRIS = (146, 146, 146)
NEGRO = (0, 0, 0)


def tipografia(cuerpo: int) -> ImageFont.ImageFont:
    for ruta in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        if Path(ruta).exists():
            return ImageFont.truetype(ruta, cuerpo)
    return ImageFont.load_default()


def main() -> None:
    original = Image.open(ENTRA).convert("RGB")
    escala = ANCHO / original.width
    foto = original.resize(
        (ANCHO, round(original.height * escala)), Image.LANCZOS
    )

    puntos = sorted(
        ({**p, "ax": p["x"] * escala, "ay": p["y"] * escala} for p in PUNTOS),
        key=lambda p: (round(p["ay"] / 16), p["n"]),
    )

    # Los globos no se pisan: si dos caen muy cerca, el de abajo baja.
    ultimo = {"izq": -999.0, "der": -999.0}
    for p in puntos:
        p["cy"] = max(p["ay"], RADIO + 2, ultimo[p["lado"]] + SEPARACION)
        ultimo[p["lado"]] = p["cy"]

    alto = max(foto.height, round(max(p["cy"] for p in puntos) + RADIO + 4))
    lienzo = Image.new("RGB", (MARGEN * 2 + ANCHO, alto), (255, 255, 255))
    lienzo.paste(foto, (MARGEN, 0))

    dibujo = ImageDraw.Draw(lienzo)
    fuente = tipografia(13)

    for p in puntos:
        izq = p["lado"] == "izq"
        cx = MARGEN / 2 if izq else MARGEN + ANCHO + MARGEN / 2
        ax = MARGEN + p["ax"]
        ay = min(max(p["ay"], 2), foto.height - 2)
        bx = cx + RADIO if izq else cx - RADIO

        dibujo.line([(bx, p["cy"]), (ax, ay)], fill=GRIS, width=1)
        dibujo.ellipse([ax - 2, ay - 2, ax + 2, ay + 2], fill=GRIS)
        dibujo.ellipse(
            [cx - RADIO, p["cy"] - RADIO, cx + RADIO, p["cy"] + RADIO],
            fill=AMARILLO,
        )
        dibujo.text(
            (cx, p["cy"]), str(p["n"]), fill=NEGRO, font=fuente, anchor="mm"
        )

    lienzo.save(SALE)
    print(f"escrito {SALE.relative_to(DOCS.parent)}  {lienzo.width}x{lienzo.height}")


if __name__ == "__main__":
    main()
