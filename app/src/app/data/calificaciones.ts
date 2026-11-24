// Calificaciones de servicios finalizados.
//
// Una por servicio: si ya se envió, el detalle muestra la confirmación en
// lugar de pedirla de nuevo. Feedback/NPS independiente del reclamo de
// garantía: no simula guardarse en Jira. Hoy persiste en sessionStorage
// (demo); `leerCalificacion`/`guardarCalificacion` son el único punto de
// contacto con el resto de la app, así que reemplazar el storage por una
// llamada real a base de datos/Oracle (para reporte posterior) es un cambio
// acotado a este archivo.

export interface CalificacionGuardada {
  servicio: number;
  /** Una valoración por técnico que participó, atribuida por nombre. */
  tecnicos?: { nombre: string; valor: number }[];
  /** Comentario opcional del cliente. */
  comentario?: string;
}

const CLAVE = "mipro-calificacion";

export function leerCalificacion(servicioId: string): CalificacionGuardada | null {
  try {
    const crudo = sessionStorage.getItem(`${CLAVE}-${servicioId}`);
    if (crudo) return JSON.parse(crudo) as CalificacionGuardada;
  } catch {
    // Sin storage: la calificación no sobrevive recargas, nada más.
  }
  return null;
}

export function guardarCalificacion(
  servicioId: string,
  calificacion: CalificacionGuardada,
): void {
  try {
    sessionStorage.setItem(`${CLAVE}-${servicioId}`, JSON.stringify(calificacion));
  } catch {
    // Sin storage: se pierde al recargar, el envío igual se confirma.
  }
}
