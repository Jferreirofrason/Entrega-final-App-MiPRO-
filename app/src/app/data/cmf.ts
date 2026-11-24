// Tarjetas y planes de Crédito CMF, de demostración.
//
// ⚠️ INVENTADOS PARA LA DEMO. No son las tarjetas de nadie ni los planes de
// CMF: son dos tarjetas y tres planes elegidos para poder mostrar la
// pantalla y sus estados. Las cantidades de cuotas NO son las de la
// referencia a propósito, para que nadie las lea como confirmadas, y el
// recargo del plan de seis es un número de demostración, no una tasa.
//
// Cuando haya integración, esto se reemplaza por sus endpoints:
//   ENDPOINT: GET /api/checkout/cmf/tarjetas
//   ENDPOINT: GET /api/checkout/cmf/planes?tarjeta={id}&monto={monto}

import type { ElegibilidadCmf, PlanDefinicion, TarjetaCmf } from "../logic/cmf";

// Las dos tarjetas tienen crédito de sobra: el recorrido normal muestra las
// cuotas, no un error.
//
// El estado de crédito insuficiente SIGUE existiendo (estadoDePlanes lo
// devuelve y la pantalla lo trata aparte, nunca mezclado con el listado).
// Para verlo en la demo, basta con bajarle el `disponible` a una tarjeta por
// debajo del importe de la compra.
export const TARJETAS_CMF_DEMO: readonly TarjetaCmf[] = [
  { id: "cmf-clasica", nombre: "CMF Clásica", ultimos: "7788", disponible: 500, arte: "clasica" },
  {
    id: "cmf-adicional",
    nombre: "CMF Black",
    ultimos: "2143",
    disponible: 1500,
    arte: "black",
  },
];

export const PLANES_DEMO: readonly PlanDefinicion[] = [
  // `sinIntereses` va puesto a mano porque en la demo lo decidimos nosotros.
  // Con integración lo informa CMF plan por plan, y el que no lo traiga no
  // muestra la etiqueta.
  { id: "cmf-1", cuotas: 1, recargo: 0, sinIntereses: true },
  { id: "cmf-3", cuotas: 3, recargo: 0, sinIntereses: true },
  {
    id: "cmf-6",
    cuotas: 6,
    recargo: 0.08,
    cargos: "Incluye cargos de financiación",
  },
];

/** Demora simulada de la consulta, en milisegundos. */
export const DEMORA_CMF_MS = 800;

// ⚠️ SIMULADO: la elegibilidad la informa el backend junto con los datos de
// la persona. Acá va en "habilitado" para que la demo pueda mostrar el
// flujo completo; poniéndola en "no-habilitado" o "sin-respuesta" se ve que
// el medio desaparece del selector, sin banner ni enlace de reemplazo.
//   ENDPOINT: GET /api/checkout/cmf/elegibilidad
export const ELEGIBILIDAD_CMF_DEMO: ElegibilidadCmf = "habilitado";

/** La consulta de elegibilidad, con su demora. */
export function consultarElegibilidadCmf(): Promise<ElegibilidadCmf> {
  return new Promise((resolver) => {
    window.setTimeout(() => resolver(ELEGIBILIDAD_CMF_DEMO), DEMORA_CMF_MS);
  });
}
