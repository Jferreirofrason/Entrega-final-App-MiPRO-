// Financiación con Crédito CMF: tarjetas y planes de cuotas.
//
// Módulo puro (node --test). Sin DOM, sin storage y sin red.
//
// ⚠️ NO HAY INTEGRACIÓN con CMF. Acá solo están las cuentas de un plan y
// los estados de la consulta. Qué tarjetas tiene cada persona, qué planes
// habilita cada tarjeta para cada compra, y qué intereses o cargos aplican,
// lo informa la integración. Los planes de la demostración viven en
// data/cmf.ts y están marcados como tales.
//   ENDPOINT: GET /api/checkout/cmf/tarjetas
//   ENDPOINT: GET /api/checkout/cmf/planes?tarjeta={id}&monto={monto}

/**
 * Qué arte tiene la tarjeta, para dibujarla reconocible.
 *
 * Es un dato de la tarjeta, no algo que se adivine del nombre: si llega uno
 * que no conocemos, la pantalla cae en el logo y no inventa una cara.
 */
export type ArteCmf = "clasica" | "black";

/** Una tarjeta CMF de la persona. */
export interface TarjetaCmf {
  id: string;
  nombre: string;
  /** Solo los cuatro últimos dígitos. Nunca el número completo. */
  ultimos: string;
  /** Crédito disponible, cuando la integración lo informa. */
  disponible?: number;
  /** El diseño de la tarjeta, cuando lo sabemos. */
  arte?: ArteCmf;
}

/**
 * La definición de un plan, como la informaría la integración.
 *
 * `recargo` es la proporción que se suma sobre el importe de la compra:
 * 0 es sin intereses ni cargos. NO se inventa: viene en la respuesta.
 */
export interface PlanDefinicion {
  id: string;
  cuotas: number;
  recargo: number;
  /** Texto de los cargos, tal como lo informa la integración. */
  cargos?: string;
  /**
   * true SOLO cuando la integración confirma que el plan no suma intereses.
   *
   * No se deduce de `recargo: 0`: un recargo en cero puede ser un recargo
   * que no vino informado, y decir "sin intereses" sin el dato es prometer
   * algo que no sabemos. Sin la bandera, la pantalla no dice nada.
   */
  sinIntereses?: boolean;
}

/** Un plan ya calculado contra el importe de la compra. */
export interface PlanCalculado extends PlanDefinicion {
  /** Lo que se paga por cuota. */
  montoCuota: number;
  /** Lo que se termina pagando por el plan. */
  total: number;
  /** true si el plan suma intereses o cargos sobre la compra. */
  conCargos: boolean;
}

/**
 * Si la persona puede pagar con Crédito CMF. LO INFORMA EL BACKEND.
 *
 * No es una preferencia ni algo que se deduzca en la app: la elegibilidad
 * depende de si tiene el crédito habilitado, y eso solo lo sabe CMF.
 */
export type ElegibilidadCmf =
  /** Todavía no llegó la respuesta, o falló la consulta. */
  | "sin-respuesta"
  /** Backend confirmó que lo tiene habilitado. */
  | "habilitado"
  /** Backend confirmó que no lo tiene. */
  | "no-habilitado";

/**
 * Si Crédito CMF se ofrece como medio de pago.
 *
 * SOLO con un sí explícito. Sin respuesta NO es un sí: ante la duda el
 * medio se esconde, porque ofrecer una financiación que después no está
 * es peor que no ofrecerla.
 *
 * Y cuando no está habilitado tampoco va un banner para solicitarlo: el
 * checkout no es el lugar para vender una tarjeta de crédito. Por eso esta
 * función es la única puerta, y no hay una segunda para el banner.
 */
export function seOfreceCmf(elegibilidad: ElegibilidadCmf): boolean {
  return elegibilidad === "habilitado";
}

export type EstadoConsultaCmf =
  | "cargando"
  | "ok"
  | "error"
  | "sin-tarjetas"
  | "sin-planes"
  | "credito-insuficiente";

const redondear = (n: number) => Math.round(n * 100) / 100;

/**
 * Las cuentas de un plan para un importe.
 *
 * El total sale del importe más su recargo, y la cuota sale del total. Se
 * calcula siempre desde el importe de la compra: si la compra cambia (por
 * un cupón, por ejemplo), el plan se vuelve a calcular y nunca queda un
 * número viejo colgado.
 */
export function calcularPlan(monto: number, def: PlanDefinicion): PlanCalculado {
  const total = redondear(monto * (1 + def.recargo));
  return {
    ...def,
    total,
    montoCuota: redondear(total / def.cuotas),
    conCargos: def.recargo > 0,
  };
}

/** Los planes de una tarjeta para una compra, ya calculados. */
export function planesDeLaCompra(
  defs: readonly PlanDefinicion[],
  monto: number,
): PlanCalculado[] {
  return defs.map((d) => calcularPlan(monto, d));
}

/**
 * Si se puede AFIRMAR que el plan no tiene intereses.
 *
 * Pide las dos cosas: que la integración lo confirme y que el plan no traiga
 * cargos informados, para que la pantalla no se contradiga sola.
 */
export function afirmaSinIntereses(plan: PlanCalculado): boolean {
  return plan.sinIntereses === true && !plan.conCargos;
}

/** Si el crédito disponible cubre el total del plan. */
export function alcanzaCredito(total: number, disponible?: number): boolean {
  if (disponible === undefined) return true;
  return disponible >= total;
}

/**
 * En qué estado queda la consulta de planes de una tarjeta.
 *
 * Sin planes informados, "sin-planes". Con planes pero ninguno que entre en
 * el crédito disponible, "credito-insuficiente". No se elige uno por la
 * persona ni se asume que siempre hay financiación.
 */
export function estadoDePlanes(
  planes: readonly PlanCalculado[],
  disponible?: number,
): EstadoConsultaCmf {
  if (planes.length === 0) return "sin-planes";
  if (!planes.some((p) => alcanzaCredito(p.total, disponible))) return "credito-insuficiente";
  return "ok";
}

/**
 * Lo que falta definir del lado de CMF.
 */
export const PENDIENTE_DE_CMF = [
  "Integración con CMF: consulta de tarjetas de la persona y de planes por compra",
  "Qué cantidades de cuotas habilita cada tarjeta, y para qué importes",
  "Intereses, cargos y cómo se informan",
  "Crédito disponible y qué hacer cuando no alcanza",
  "Si la aprobación del pago llega en línea o queda pendiente de validación",
] as const;
