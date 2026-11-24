// Carga progresiva de listados largos (ej. reclamos finalizados). Módulo
// puro: dado el listado completo y cuántos ítems se muestran hoy, dice qué
// mostrar y si falta más por cargar. Nunca recorta los casos activos, solo
// se usa sobre listados que ya vienen ordenados.

export interface Paginado<T> {
  visibles: T[];
  hayMas: boolean;
}

export function paginar<T>(items: readonly T[], cantidadVisible: number): Paginado<T> {
  return {
    visibles: items.slice(0, cantidadVisible),
    hayMas: items.length > cantidadVisible,
  };
}
