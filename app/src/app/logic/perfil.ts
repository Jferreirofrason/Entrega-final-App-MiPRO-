// La inicial del avatar (módulo puro, node --test).
//
// Una sola regla, escrita una sola vez, porque el avatar aparece en el
// encabezado del Inicio y en la pantalla de Perfil y tienen que decir lo
// mismo.

/**
 * La inicial que va en el avatar, o null si no hay un nombre con el que
 * armarla.
 *
 * - Se ignoran los espacios del principio: "  maría" da "M".
 * - Se pasa a mayúscula respetando el español: "álvaro" da "Á", "ñusta"
 *   da "Ñ". `toUpperCase` ya lo hace bien con acentos y con la eñe.
 * - El primer carácter tiene que ser una LETRA. Un nombre que empieza con
 *   un número o un signo no da una inicial: da null, y la pantalla muestra
 *   el ícono genérico de perfil. Una "1" o un "#" adentro de un círculo
 *   amarillo no identifican a nadie.
 * - Nunca dos iniciales: el espacio del avatar es para una.
 */
export function inicialDePerfil(nombre: string | undefined | null): string | null {
  const limpio = (nombre ?? "").trim();
  if (limpio === "") return null;
  const primero = [...limpio][0];
  if (!primero || !/\p{L}/u.test(primero)) return null;
  return primero.toUpperCase();
}

/** El rótulo accesible del avatar: "Perfil de María". */
export function etiquetaDePerfil(nombre: string | undefined | null): string {
  const limpio = (nombre ?? "").trim();
  return limpio === "" ? "Mi perfil" : `Perfil de ${limpio}`;
}
