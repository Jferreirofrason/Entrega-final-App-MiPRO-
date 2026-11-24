// Sección activa del tab bar (módulo puro, node --test).
//
// La sección se calcula por PANTALLA, no solo por la ruta del tab: el
// detalle de un servicio o visita enciende Servicios, un reclamo enciende
// Garantía y las pantallas de cuenta encienden Perfil. Notificaciones es
// una pantalla global (sin tab bar): devuelve null, nunca hay dos activos.

export type SeccionTab = "inicio" | "servicios" | "productos" | "garantia" | "perfil";

/**
 * Las entradas de la barra inferior, en orden.
 *
 * ⚠️ PERFIL NO ESTÁ ACÁ. Se entra por la foto del Inicio, no por la barra
 * (decisión de producto, nov 2026). `seccionActiva` sigue devolviendo
 * "perfil" porque esa SÍ es la sección en la que estás; lo que pasa es que
 * ninguna entrada de la barra la reclama, así que no se enciende ninguna.
 * Es a propósito: la barra sigue visible para poder salir.
 */
export const TABS: readonly { path: string; seccion: SeccionTab; label: string }[] = [
  { path: "/", seccion: "inicio", label: "Inicio" },
  { path: "/catalogo", seccion: "servicios", label: "Servicios" },
  // El label dice "Productos" y no "Mis productos": el título completo no
  // se lee en una barra a 390 px. El encabezado de la pantalla sí lo dice.
  { path: "/mis-productos", seccion: "productos", label: "Productos" },
  { path: "/garantia", seccion: "garantia", label: "Garantía" },
];

export function seccionActiva(pathname: string, search = ""): SeccionTab | null {
  if (pathname === "/") return "inicio";
  // El historial vive adentro de Perfil (ver la nota de arquitectura en
  // pages/Historial.tsx), pero se entra desde tres lugares. El tab sigue a
  // la puerta: entrar desde Garantía y ver "Perfil" encendido se lee como
  // si la app te hubiera cambiado de sección sin avisar.
  if (/^\/(historial|mis-solicitudes)/.test(pathname)) {
    const tipo = new URLSearchParams(search).get("tipo");
    if (tipo === "servicios" || tipo === "servicio") return "servicios";
    if (tipo === "garantias" || tipo === "garantia") return "garantia";
    return "perfil";
  }
  if (/^\/(catalogo|servicios|proyectos|solicitud-enviada)/.test(pathname)) {
    return "servicios";
  }
  // Mis Productos es su propio tab, y ahí vive TODO lo de productos: la
  // lista, el detalle, el alta y la edición. /productos son las rutas
  // viejas, que solo redirigen acá: encienden el mismo tab para que el
  // salto no se vea como un cambio de sección.
  if (/^\/(mis-productos|productos)/.test(pathname)) return "productos";
  if (/^\/(garantia|reclamos)/.test(pathname)) return "garantia";
  if (/^\/(perfil|configuracion|soporte|sugerencias)/.test(pathname)) {
    return "perfil";
  }
  return null;
}
