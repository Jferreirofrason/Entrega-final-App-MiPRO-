// Filtro previo de diagnóstico (paso 2 de garantía).
//
// Antes del campo abierto "Cuéntanos un poco más", el flujo pregunta qué
// está pasando con el producto y ofrece una recomendación simple y segura.
// Objetivo: resolver problemas triviales (control sin baterías, equipo
// desconectado) y reducir casos innecesarios; si el problema persiste, el
// cliente sigue con la creación normal del reclamo.
//
// PROPUESTA pendiente de validación con operaciones (igual que
// CATEGORIAS_PROBLEMA en logic/solicitudGarantia.ts): la taxonomía y las
// recomendaciones son un mecanismo de demostración, no el mapa final.

import { CATEGORIAS_PROBLEMA, type CategoriaProblema } from "../logic/solicitudGarantia";

/** Subconjunto de categorías aplicables por tipo de producto. Un tipo sin
 * entrada acá usa la lista completa (fallback genérico). */
const CATEGORIAS_POR_TIPO: Record<string, string[]> = {
  Abanico: ["no-enciende", "no-funciona-bien", "ruido-extrano", "esta-danado", "otro"],
  Calentador: ["no-enciende", "no-funciona-bien", "pierde-agua", "esta-danado", "otro"],
  Lavavajillas: ["no-enciende", "no-funciona-bien", "pierde-agua", "muestra-error", "esta-danado", "otro"],
};

export function categoriasParaTipo(tipo?: string): CategoriaProblema[] {
  const permitidas = tipo ? CATEGORIAS_POR_TIPO[tipo] : undefined;
  if (!permitidas) return CATEGORIAS_PROBLEMA;
  return CATEGORIAS_PROBLEMA.filter((c) => permitidas.includes(c.id));
}

/** Recomendación simple y segura antes de crear el caso. Genérica por
 * categoría; nunca reemplaza el aviso de seguridad cuando existe. */
const RECOMENDACIONES: Record<string, string> = {
  "no-enciende":
    "Revisa que el equipo esté bien conectado y que el tomacorriente tenga corriente. Si usa control remoto, verifica las baterías.",
  "no-funciona-bien":
    "Prueba reiniciar el equipo: desconéctalo unos minutos y vuelve a conectarlo.",
  "ruido-extrano":
    "Verifica que el equipo esté bien nivelado y que no haya objetos sueltos cerca.",
  "pierde-agua": "Evita usar el producto hasta que un técnico lo revise.",
  "muestra-error":
    "Anota el código o mensaje exacto que muestra: nos ayuda a resolver más rápido.",
  "esta-danado": "Si puedes, toma una foto del daño para adjuntarla en el siguiente paso.",
};

const RECOMENDACION_GENERICA =
  "Cuéntanos con el mayor detalle posible en el siguiente paso.";

export function recomendacionParaCategoria(categoriaId: string): string {
  return RECOMENDACIONES[categoriaId] ?? RECOMENDACION_GENERICA;
}
