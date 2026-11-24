// Las fotos del catálogo, entregadas por el cliente.
//
// Vienen por SUBCATEGORÍA, que es el nivel en el que el negocio las define:
// todos los artículos de "Instalación de línea blanca" comparten la foto de
// esa subcategoría. No son provisionales ni prestadas de otra categoría,
// son las fotos de ese servicio.
//
// Cada subcategoría trae dos, y cada una tiene su lugar:
//
//   cuadrada.jpg  la miniatura de 64 px del listado (y de la búsqueda)
//   ancha.jpg     la cabecera del detalle y la tarjeta del Home (2.2:1)
//
// Los archivos viven en src/assets/servicios/<id-de-subcategoría>/ y se
// resuelven con el glob de Vite: así entran al build con su hash y nadie
// tiene que escribir una ruta a mano. Agregar una subcategoría es crear su
// carpeta con las dos fotos; este archivo no se toca.

export interface FotoDeSubcategoria {
  cuadrada: string;
  ancha: string;
}

/**
 * El glob es de Vite y no existe en node. Las pruebas de dominio corren con
 * `tsx` y pasan por acá al importar el catálogo: sin el try, reventarían
 * por una foto, que es justo lo que no tienen que mirar.
 */
function cargarArchivos(): Record<string, string> {
  try {
    return import.meta.glob("../../assets/servicios/*/*.jpg", {
      eager: true,
      query: "?url",
      import: "default",
    }) as Record<string, string>;
  } catch {
    return {};
  }
}

const FOTOS: Record<string, FotoDeSubcategoria> = (() => {
  const mapa: Record<string, FotoDeSubcategoria> = {};
  for (const [ruta, url] of Object.entries(cargarArchivos())) {
    // .../assets/servicios/<id>/<cuadrada|ancha>.jpg
    const partes = ruta.split("/");
    const archivo = partes[partes.length - 1];
    const id = partes[partes.length - 2];
    if (!id || !archivo) continue;
    const actual = mapa[id] ?? { cuadrada: "", ancha: "" };
    if (archivo.startsWith("cuadrada")) actual.cuadrada = url;
    if (archivo.startsWith("ancha")) actual.ancha = url;
    mapa[id] = actual;
  }
  // Una subcategoría a medias (le falta una de las dos) usa la que tiene:
  // antes una foto que no es exactamente del formato que una sin foto.
  for (const foto of Object.values(mapa)) {
    if (!foto.ancha) foto.ancha = foto.cuadrada;
    if (!foto.cuadrada) foto.cuadrada = foto.ancha;
  }
  return mapa;
})();

export function fotoDeSubcategoria(id: string | undefined): FotoDeSubcategoria | null {
  if (!id) return null;
  const foto = FOTOS[id];
  return foto && foto.ancha ? foto : null;
}

/** Cuántas subcategorías tienen foto cargada. Lo usa la suite de pruebas. */
export function cuantasSubcategoriasConFoto(): number {
  return Object.keys(FOTOS).length;
}
