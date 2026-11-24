// Solicitudes de servicio creadas por el usuario en esta sesión.
//
// El prototipo no tiene backend: las solicitudes se guardan en
// sessionStorage para que el flujo quede conectado de punta a punta
// (catálogo, solicitar, y verla en "Mis Citas" como "Solicitud recibida").
// La costura con el servicio real es este módulo.

import type { PagoConfirmado } from "../logic/pago";

export interface SolicitudServicio {
  id: string;
  nombreServicio: string;
  creadaEl: string; // ISO
  /** Número de reserva visible para el cliente (MPR-XXXX-X). */
  numeroReserva: string;
  /** Resultado del paso "Revisar el lugar", cuando el servicio lo tiene. */
  condiciones?: "estandar" | "inspeccion";
  incluyeDesinstalacion?: boolean;
  // Elegido en el flujo de agendamiento.
  cantidad?: number;
  totalEstimado?: number;
  direccionEtiqueta?: string;
  direccionTexto?: string;
  fechaPreferida?: string;
  bloque?: "manana" | "tarde";
  contactoNombre?: string;
  contactoTelefono?: string;
  notas?: string;
  cantidadFotos?: number;
  /**
   * Comprobante del pago de la reserva, cuando el servicio tenía importe
   * final. SIMULADO: ver logic/pago.ts. Ausente = la solicitud siguió el
   * flujo de siempre y el pago lo coordina un agente.
   */
  pago?: PagoConfirmado;
}

function generarNumeroReserva(semilla: number): string {
  const bloque = String((Math.abs(semilla) % 9000) + 1000);
  const digito = Math.abs(semilla) % 9;
  return `MPR-${bloque}-${digito}`;
}

const CLAVE = "mipro-solicitudes";

function leerTodas(): SolicitudServicio[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as SolicitudServicio[]) : [];
  } catch {
    return [];
  }
}

export function solicitudesDeLaSesion(): SolicitudServicio[] {
  return leerTodas();
}

export function crearSolicitud(
  nombreServicio: string,
  extras?: Omit<SolicitudServicio, "id" | "nombreServicio" | "creadaEl" | "numeroReserva">,
): SolicitudServicio {
  const ahora = Date.now();
  const solicitud: SolicitudServicio = {
    id: `solicitud-${ahora}`,
    nombreServicio,
    creadaEl: new Date().toISOString(),
    numeroReserva: generarNumeroReserva(ahora),
    ...extras,
  };
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify([solicitud, ...leerTodas()]));
  } catch {
    // Sin storage disponible, la solicitud vive solo en la pantalla de éxito.
  }
  return solicitud;
}

// ── La animación de éxito, una vez por operación ──
//
// Volver al comprobante no tiene que repetirla. Se anota el id de la
// solicitud que ya la mostró; vive en la sesión, como el resto.
const CLAVE_EXITO = "mipro-exito-visto";

function vistos(): string[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE_EXITO);
    return crudo ? (JSON.parse(crudo) as string[]) : [];
  } catch {
    return [];
  }
}

export function exitoYaVisto(id: string): boolean {
  return vistos().includes(id);
}

export function marcarExitoVisto(id: string): void {
  try {
    sessionStorage.setItem(CLAVE_EXITO, JSON.stringify([...vistos(), id]));
  } catch {
    // Sin storage, la animación se vuelve a ver: no rompe nada.
  }
}
