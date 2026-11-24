#!/usr/bin/env python3
"""Convierte docs/mipro-design-handoff.md en un HTML legible e imprimible.

El Markdown es la fuente de verdad: este script NO lo edita, solo lo lee.
No toca la app: todo lo que genera vive en docs/.

    python3 docs/generar.py          # escribe docs/mipro-design-handoff.html
"""

from pathlib import Path
import re
import sys
import markdown

DOCS = Path(__file__).resolve().parent

# El documento a publicar. Sin argumento sigue siendo el handoff general, que
# es lo que esperaba todo lo que ya llamaba a este script; con argumento se
# publica cualquier otro .md de docs/ (por ejemplo el de una HU).
#
#     python3 docs/generar.py
#     python3 docs/generar.py hu-1518-1579-notificaciones-handoff
BASE = sys.argv[1] if len(sys.argv) > 1 else "mipro-design-handoff"
FUENTE = DOCS / f"{BASE}.md"
SALIDA = DOCS / f"{BASE}.html"

PLANTILLA = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
  :root {{
    --amarillo: #FFEE00;
    --negro: #000000;
    --gris-80: #414141;
    --gris-60: #717171;
    --gris-40: #929292;
    --gris-20: #D0D0D0;
    --gris-8: #ECECEC;
    --gris-3: #F6F6F5;
    --rojo: #E05263;
    --azul: #336DD0;
    --oro: #8A7A00;
    --texto: 'Helvetica Neue LT Std', Helvetica, Arial, sans-serif;
    --titulo: 'Bebas Neue', Arial, sans-serif;
  }}
  * {{ box-sizing: border-box; }}
  html {{ scroll-behavior: smooth; }}
  body {{
    margin: 0;
    background: var(--gris-3);
    color: var(--negro);
    font-family: var(--texto);
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }}
  .hoja {{
    max-width: 920px;
    margin: 0 auto;
    background: #fff;
    padding: 56px 64px 96px;
  }}

  h1, h2, h3 {{ font-family: var(--titulo); text-transform: uppercase; letter-spacing: 1px; font-weight: 400; }}
  h1 {{ font-size: 46px; line-height: 1.05; margin: 0 0 8px; }}
  h1 + p, h1 + table {{ margin-top: 24px; }}
  h2 {{
    font-size: 30px;
    margin: 64px 0 20px;
    padding-bottom: 10px;
    border-bottom: 3px solid var(--amarillo);
  }}
  h3 {{ font-size: 21px; margin: 40px 0 12px; }}
  h4 {{ font-family: var(--texto); font-size: 15px; font-weight: 600; margin: 24px 0 8px; }}

  p {{ margin: 0 0 14px; }}
  a {{ color: var(--azul); text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}
  strong {{ font-weight: 600; }}

  hr {{ border: 0; border-top: 1px solid var(--gris-8); margin: 48px 0; }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 24px;
    font-size: 13.5px;
    page-break-inside: auto;
  }}
  th, td {{
    text-align: left;
    vertical-align: top;
    padding: 9px 12px;
    border-bottom: 1px solid var(--gris-8);
  }}
  th {{
    background: var(--gris-3);
    font-weight: 600;
    font-size: 12.5px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--gris-80);
    border-bottom: 1px solid var(--gris-20);
  }}
  tr:last-child td {{ border-bottom: 1px solid var(--gris-20); }}
  td code, th code, li code, p code {{
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.88em;
    background: var(--gris-3);
    border: 1px solid var(--gris-8);
    border-radius: 4px;
    padding: 1px 5px;
  }}
  pre {{
    background: var(--negro);
    color: #fff;
    border-radius: 8px;
    padding: 16px 18px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
  }}
  pre code {{ background: none; border: 0; padding: 0; color: inherit; }}

  ul, ol {{ margin: 0 0 16px; padding-left: 22px; }}
  li {{ margin: 4px 0; }}
  li input[type=checkbox] {{ margin-right: 6px; }}

  blockquote {{
    margin: 16px 0;
    padding: 12px 18px;
    background: var(--gris-3);
    border-left: 4px solid var(--gris-20);
    border-radius: 0 8px 8px 0;
    color: var(--gris-80);
  }}

  img {{
    display: block;
    width: 320px;
    max-width: 100%;
    border: 1px solid var(--gris-20);
    border-radius: 12px;
    margin: 8px 0 8px;
  }}

  /* Capturas con los números al margen: necesitan más ancho para que el
     número se lea. Se marcan en el Markdown con {{: .numerada }}. */
  img.numerada {{
    width: 460px;
    border: 0;
    border-radius: 0;
  }}
  /* Recortes anchos y bajos (un encabezado, una fila): ocupan todo el
     ancho, que es lo único que los deja leer. */
  img.detalle {{
    width: 100%;
    border: 0;
    border-radius: 0;
  }}
  /* El ícono dibujado adentro de una celda de tabla. */
  img.ico {{
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 0;
    border-radius: 0;
    margin: 0;
    vertical-align: middle;
  }}
  /* La muestra real de un chip de estado, adentro de una celda. */
  img.chip {{
    display: inline-block;
    width: auto;
    height: 28px;
    border: 0;
    border-radius: 0;
    margin: 0;
    vertical-align: middle;
  }}
  /* Láminas (la hoja de íconos): ocupan el ancho de la caja de texto. */
  img.lamina {{
    width: 100%;
    border: 1px solid var(--gris-8);
    border-radius: 12px;
  }}

  /* Los avisos "Pendiente de definición" e "Inconsistencia detectada" se
     marcan solos: el Markdown ya los escribe con un signo al inicio. */
  .aviso {{
    background: rgba(255, 238, 0, 0.12);
    border-left: 4px solid var(--amarillo);
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    margin: 16px 0;
  }}
  .aviso p {{ margin: 0; }}

  @media print {{
    body {{ background: #fff; }}
    .hoja {{ max-width: none; padding: 0; }}
    /* Nada se empuja de página: las tablas cortan entre filas y solo las
       imágenes y los avisos se mantienen enteros. Con break-inside: avoid en
       las tablas quedaban páginas casi vacías. */
    table, pre, thead, tbody, img {{ break-inside: auto; page-break-inside: auto; }}
    tr, .aviso {{ break-inside: avoid; page-break-inside: avoid; }}
    thead {{ display: table-row-group; }}
    p, li {{ orphans: 2; widows: 2; }}
    h1, h2, h3, h4 {{ break-after: auto; page-break-after: auto; }}
    h2 {{ margin-top: 32px; }}
    h3 {{ margin-top: 24px; }}
    hr {{ margin: 24px 0; }}
    /* Las capturas pueden cortarse en el corte de página y seguir en la
       siguiente. Es lo que evita las páginas medio vacías. Sin radio, para
       que el corte no parezca un error de render. */
    img {{ width: 220px; border-radius: 0; }}
    img.numerada {{ width: 360px; }}
    img.detalle {{ width: 100%; }}
    img.lamina {{ width: 100%; }}
    img.ico {{ width: 18px; height: 18px; }}
    img.chip {{ width: auto; height: 26px; }}
    a {{ color: var(--negro); }}
  }}
  @page {{ margin: 16mm 14mm; size: A4; }}

  @media (max-width: 720px) {{
    .hoja {{ padding: 32px 20px 64px; }}
    h1 {{ font-size: 34px; }}
    h2 {{ font-size: 24px; }}
    table {{ font-size: 12.5px; }}
    th, td {{ padding: 7px 8px; }}
  }}
</style>
</head>
<body>
<main class="hoja">
{cuerpo}
</main>
</body>
</html>
"""


def quitar_encabezados_vacios(html: str) -> str:
    """Las tablas de ficha (`| | |`) no tienen encabezado: se saca la banda."""
    return re.sub(
        r"<thead>\s*<tr>(?:\s*<th[^>]*>\s*</th>)+\s*</tr>\s*</thead>",
        "",
        html,
    )


def envolver_avisos(html: str) -> str:
    """Envuelve en .aviso los párrafos que empiezan con el signo de aviso."""
    return re.sub(
        r"<p>(⚠️.*?)</p>",
        r'<div class="aviso"><p>\1</p></div>',
        html,
        flags=re.S,
    )


def main() -> None:
    texto = FUENTE.read_text(encoding="utf-8")

    cuerpo = markdown.markdown(
        texto,
        extensions=["tables", "fenced_code", "attr_list", "sane_lists"],
    )
    cuerpo = quitar_encabezados_vacios(cuerpo)
    cuerpo = envolver_avisos(cuerpo)

    # El título de la pestaña sale del primer encabezado del propio
    # documento: así un .md nuevo no hereda el nombre de otro.
    primero = re.search(r"^#\s+(.+)$", texto, flags=re.M)
    titulo = primero.group(1).strip() if primero else BASE

    SALIDA.write_text(
        PLANTILLA.format(cuerpo=cuerpo, titulo=titulo), encoding="utf-8"
    )
    print(f"escrito {SALIDA.relative_to(SALIDA.parents[1])}")


if __name__ == "__main__":
    main()
