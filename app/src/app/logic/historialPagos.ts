// El historial de pagos del perfil: qué se pagó, cuándo y cómo salió.
//
// Módulo puro (node --test). Sin DOM, sin storage y sin red.
//
// ⚠️ NO HAY INTEGRACIÓN. Acá están el estado de un pago y cómo se agrupa la
// lista; de dónde salen los pagos lo resuelve data/historialPagos.ts, que
// mezcla los de la demostración con los que se hicieron en la sesión.
//   ENDPOINT: GET /api/perfil/pagos
//   ENDPOINT: GET /api/perfil/pagos/{id}

import type { PagoConfirmado, ResultadoPago } from "./pago";

/**
 * El estado de un pago en el historial.
 *
 * NO es lo mismo que el resultado del cobro (`ResultadoPago`): un cobro
 * aprobado puede terminar reembolsado o cancelado más adelante. Por eso son
 * dos cosas distintas y una se deriva de la otra, no al revés.
 */
export type EstadoPagoHistorial = "aprobado" | "pendiente" | "reembolsado" | "cancelado";

/** Una línea del historial. */
export interface PagoDelHistorial {
  id: string;
  /** El servicio que se pagó. */
  servicio: string;
  /** Cuándo se pagó, en ISO. */
  pagadoEl: string;
  /** Número de reserva visible (MPR-XXXX-X). */
  numeroReserva: string;
  monto: number;
  estado: EstadoPagoHistorial;
  /** El medio, enmascarado: "Visa •••• 4242", "Yappy". Nunca completo. */
  medio: string;
  /** Lo que hace falta para entender el medio, como las cuotas de CMF. */
  detalleMedio?: string;
  /** Número de autorización, cuando el pago llegó a tenerlo. */
  autorizacion?: string;
  /** La dirección del servicio, cuando la solicitud la tiene. */
  direccion?: string;
}

/**
 * De qué estado del historial parte un cobro recién hecho.
 *
 * Solo el cobro aprobado queda "aprobado"; lo que no se aprobó queda
 * "pendiente" y no se inventa un rechazo ni una cancelación, que son
 * decisiones que toma la pasarela o soporte, no esta pantalla.
 */
export function estadoDesdeElCobro(resultado: ResultadoPago): EstadoPagoHistorial {
  return resultado === "aprobado" ? "aprobado" : "pendiente";
}

/** Arma la línea del historial a partir de un comprobante de la sesión. */
export function desdeElComprobante(
  pago: PagoConfirmado,
  datos: { id: string; servicio: string; numeroReserva: string; direccion?: string },
): PagoDelHistorial {
  return {
    id: datos.id,
    servicio: datos.servicio,
    pagadoEl: pago.confirmadoEl,
    numeroReserva: datos.numeroReserva,
    monto: pago.monto,
    estado: estadoDesdeElCobro(pago.resultado),
    medio: pago.medio,
    detalleMedio: pago.detalleMedio,
    autorizacion: pago.autorizacion,
    direccion: datos.direccion,
  };
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/**
 * La clave del mes de un pago, para agrupar: "2026-10".
 *
 * Se arma con los números de la fecha y no con el nombre, así ordenar la
 * lista no depende del idioma.
 */
export function claveDelMes(iso: string): string {
  const f = new Date(iso);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}`;
}

/** "Octubre 2026", con la primera en mayúscula. */
export function nombreDelMes(clave: string): string {
  const [anio, mes] = clave.split("-");
  const nombre = MESES[Number(mes) - 1] ?? "";
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${anio}`;
}

export interface GrupoDePagos {
  /** "2026-10" */
  clave: string;
  /** "Octubre 2026" */
  titulo: string;
  pagos: PagoDelHistorial[];
}

/**
 * Los pagos agrupados por mes, del más nuevo al más viejo, y adentro de
 * cada mes también del más nuevo al más viejo.
 */
export function agruparPorMes(pagos: readonly PagoDelHistorial[]): GrupoDePagos[] {
  const porMes = new Map<string, PagoDelHistorial[]>();
  for (const pago of pagos) {
    const clave = claveDelMes(pago.pagadoEl);
    const grupo = porMes.get(clave);
    if (grupo) grupo.push(pago);
    else porMes.set(clave, [pago]);
  }
  return [...porMes.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([clave, delMes]) => ({
      clave,
      titulo: nombreDelMes(clave),
      pagos: [...delMes].sort((a, b) => b.pagadoEl.localeCompare(a.pagadoEl)),
    }));
}

/**
 * Lo que falta definir para que el historial sea el de verdad.
 */
export const PENDIENTE_DEL_HISTORIAL = [
  "El endpoint del historial y hasta cuándo hacia atrás trae pagos",
  "Quién cambia un pago a reembolsado o cancelado, y con qué aviso",
  "Si el comprobante se puede descargar y qué documento es (voucher o factura)",
  "Si los pagos de una cuenta cerrada se siguen pudiendo consultar",
] as const;
