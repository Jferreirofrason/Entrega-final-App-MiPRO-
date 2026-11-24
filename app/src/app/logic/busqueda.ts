// Reglas del buscador de servicios del Home (MIPRO-1471).
//
// Módulo puro para poder probarlo con node --test. La navegación real vive en
// lib/navegacion.ts; acá solo se define qué término viaja al catálogo.

/** Normaliza el término antes de enviarlo al catálogo. */
export function normalizarTermino(termino: string): string {
  return termino.trim().replace(/\s+/g, " ");
}

/** Solo se navega con un término no vacío. */
export function esTerminoBuscable(termino: string): boolean {
  return normalizarTermino(termino).length > 0;
}
