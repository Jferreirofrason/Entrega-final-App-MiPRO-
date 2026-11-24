// Los pagos del historial: los de la demostración y los de la sesión.
//
// ⚠️ LOS TRES PRIMEROS SON INVENTADOS PARA LA DEMO. Son servicios que MiPRO
// ofrece y montos plausibles, puestos para que la pantalla tenga meses
// distintos y más de un estado. No son pagos de nadie.
//
// A esos se suman los pagos hechos en la sesión, que salen de las
// solicitudes guardadas (data/solicitudes.ts): así, si alguien paga un
// servicio y después entra al historial, lo encuentra ahí arriba.
//   ENDPOINT: GET /api/perfil/pagos

import { desdeElComprobante, type PagoDelHistorial } from "../logic/historialPagos";
import { solicitudesDeLaSesion } from "./solicitudes";

/**
 * Los meses de la demo se calculan contra la fecha de hoy, no van fijos:
 * con fechas duras el historial se vuelve viejo solo y la agrupación por
 * mes deja de mostrar dos meses.
 */
function haceDias(dias: number): string {
  const f = new Date();
  f.setDate(f.getDate() - dias);
  return f.toISOString();
}

export const PAGOS_DEMO: readonly PagoDelHistorial[] = [
  {
    id: "pago-demo-gypsum",
    servicio: "Pared de gypsum",
    pagadoEl: haceDias(6),
    numeroReserva: "MPR-4821-3",
    monto: 31.5,
    estado: "aprobado",
    medio: "Visa •••• 4242",
    autorizacion: "AUT-7K2M4P",
    direccion: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
  },
  {
    id: "pago-demo-aire",
    servicio: "Instalación de aire acondicionado",
    pagadoEl: haceDias(38),
    numeroReserva: "MPR-3157-8",
    monto: 175,
    estado: "aprobado",
    medio: "Mastercard •••• 5312",
    autorizacion: "AUT-R9X1B4",
    direccion: "Costa del Este, Business Park, Torre Norte, Oficina 5A",
  },
  {
    // Con un pago pendiente la lista muestra el segundo estado. Qué lo deja
    // pendiente y quién lo resuelve es de la integración, así que acá no se
    // cuenta más que eso.
    id: "pago-demo-cocina",
    servicio: "Remodelación de cocina",
    pagadoEl: haceDias(45),
    numeroReserva: "MPR-2904-1",
    monto: 250,
    estado: "pendiente",
    medio: "Crédito CMF",
    detalleMedio: "CMF Clásica •••• 7788 · 6 cuotas de $44.17",
    direccion: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
  },
];

/**
 * El historial completo: lo pagado en esta sesión primero y después la
 * demostración. El orden final lo pone `agruparPorMes`.
 */
export function pagosDelHistorial(): PagoDelHistorial[] {
  const deLaSesion = solicitudesDeLaSesion()
    .filter((s) => s.pago)
    .map((s) =>
      desdeElComprobante(s.pago!, {
        id: s.id,
        servicio: s.nombreServicio,
        numeroReserva: s.numeroReserva,
        direccion: s.direccionTexto,
      }),
    );
  return [...deLaSesion, ...PAGOS_DEMO];
}

/** Un pago del historial por su id, para la pantalla de detalle. */
export function pagoDelHistorial(id: string): PagoDelHistorial | null {
  return pagosDelHistorial().find((p) => p.id === id) ?? null;
}

/** Demora simulada de la consulta, en milisegundos. */
export const DEMORA_HISTORIAL_MS = 600;
