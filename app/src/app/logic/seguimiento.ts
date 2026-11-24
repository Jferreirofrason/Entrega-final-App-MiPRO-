// La línea de tiempo de una solicitud (módulo puro, node --test).
//
// REGLA ÚNICA DE ESTE ARCHIVO: solo se devuelve lo que YA PASÓ. Una etapa
// futura no aparece, ni apagada ni "pendiente": una línea de tiempo que
// dibuja el camino completo con la mitad en gris promete un recorrido que
// nadie confirmó, y a la segunda vez que no se cumple deja de creerse.
//
// Tampoco se inventan eventos. "Técnico en camino" no existe en el modelo:
// no hay de dónde sacarlo, así que no está. Lo mismo con las fechas: una
// etapa alcanzada sin fecha conocida se muestra sin fecha, no con una
// aproximada.
//
// Las etapas salen de los datos que ya tienen el servicio y el caso de
// garantía. Si mañana el backend manda eventos propios, se reemplaza este
// módulo y las pantallas no se enteran.

import {
  esVisitaCancelada,
  esVisitaCompletada,
  type ServicioCliente,
} from "./servicios.ts";
import { normalizarEstadoCita } from "./estadosCita.ts";
import type { ReclamoGarantiaCliente } from "./reclamos.ts";

export interface EtapaAlcanzada {
  /** Lo que pasó, con el vocabulario de la app. */
  titulo: string;
  /** Cuándo, en ISO. Ausente cuando el dato no existe: no se estima. */
  fecha?: string;
  /** La última alcanzada se dibuja distinto: es donde está el caso hoy. */
  ultima?: boolean;
  /** Una cancelación cierra la línea y se marca aparte. */
  cancelada?: boolean;
}

function cerrar(etapas: EtapaAlcanzada[]): EtapaAlcanzada[] {
  if (etapas.length > 0) etapas[etapas.length - 1].ultima = true;
  return etapas;
}

/**
 * El seguimiento de un servicio.
 *
 * "En revisión" se alcanza cuando ya hay una visita creada, aunque todavía
 * no tenga fecha: significa que operación tomó el caso. No tiene fecha
 * propia en el modelo y por eso va sin fecha.
 */
export function seguimientoDelServicio(s: ServicioCliente): EtapaAlcanzada[] {
  const etapas: EtapaAlcanzada[] = [
    { titulo: "Solicitud recibida", fecha: s.creadaEl },
  ];

  if (s.visitas.length > 0) etapas.push({ titulo: "En revisión" });

  // Primera visita que llegó a estar confirmada, por fecha.
  const confirmadas = s.visitas
    .filter((v) => {
      const estado = normalizarEstadoCita(v.estado ?? "");
      return estado === "Cita confirmada" || estado === "En curso" || esVisitaCompletada(v);
    })
    .filter((v) => Boolean(v.visitAt))
    .sort((a, b) => (a.visitAt as string).localeCompare(b.visitAt as string));
  if (confirmadas.length > 0) {
    etapas.push({ titulo: "Cita programada", fecha: confirmadas[0].visitAt });
  }

  const realizadas = s.visitas
    .filter(esVisitaCompletada)
    .filter((v) => Boolean(v.visitAt))
    .sort((a, b) => (a.visitAt as string).localeCompare(b.visitAt as string));
  if (realizadas.length > 0) {
    etapas.push({ titulo: "Visita realizada", fecha: realizadas[0].visitAt });
  }

  if (s.cancelado) {
    etapas.push({ titulo: "Solicitud cancelada", fecha: s.canceladoEl, cancelada: true });
    return cerrar(etapas);
  }

  // Completado: todas las visitas cerradas y al menos una realizada.
  const pendientes = s.visitas.filter(
    (v) => !esVisitaCompletada(v) && !esVisitaCancelada(v),
  );
  if (s.visitas.length > 0 && pendientes.length === 0 && realizadas.length > 0) {
    etapas.push({ titulo: "Servicio completado", fecha: s.finalizadoEl });
  }

  return cerrar(etapas);
}

/**
 * El seguimiento de un caso de garantía.
 *
 * La fecha de cada etapa sale del historial de la cita cuando existe (es el
 * registro de cuándo cambió de estado) y, si no, de la fecha de la cita.
 */
export function seguimientoDeLaGarantia(r: ReclamoGarantiaCliente): EtapaAlcanzada[] {
  const etapas: EtapaAlcanzada[] = [
    { titulo: "Solicitud recibida", fecha: r.iniciadoEl },
  ];

  if (r.citas.length > 0) etapas.push({ titulo: "En revisión" });

  const cuandoLlegoA = (estado: string): string | undefined => {
    const fechas = r.citas
      .map((c) => c.historial?.find((h) => h.estado === estado)?.fecha ?? undefined)
      .filter((f): f is string => Boolean(f))
      .sort();
    return fechas[0];
  };

  const coordinada = r.citas.some(
    (c) =>
      c.estado === "Cita confirmada" ||
      c.estado === "En curso" ||
      c.estado === "Completada" ||
      c.historial?.some((h) => h.estado === "Cita confirmada"),
  );
  if (coordinada) {
    const fechaCita = r.citas
      .filter((c) => Boolean(c.fecha))
      .map((c) => c.fecha as string)
      .sort()[0];
    etapas.push({
      titulo: "Atención coordinada",
      fecha: cuandoLlegoA("Cita confirmada") ?? fechaCita,
    });
  }

  const resuelta = r.citas.some((c) => c.estado === "Completada");
  if (resuelta) {
    etapas.push({
      titulo: "Resolución registrada",
      fecha: cuandoLlegoA("Completada"),
    });
  }

  if (r.cancelado) {
    etapas.push({ titulo: "Solicitud cancelada", cancelada: true });
    return cerrar(etapas);
  }

  if (resuelta && r.resueltoEl) {
    etapas.push({ titulo: "Solicitud completada", fecha: r.resueltoEl });
  }

  return cerrar(etapas);
}

/**
 * Si se puede ofrecer reagendar.
 *
 * Hace falta que el caso siga abierto Y que exista una cita con fecha: sin
 * cita no hay nada que mover. No alcanza con que esté activo.
 *
 * ⚠️ NO HAY AGENDA CONTRA LA QUE ESCRIBIR. La acción abre el contacto con
 * MiPRO, que es como se reprograma hoy de verdad. No se simula un cambio
 * de fecha que después no existe en ningún lado.
 */
export function sePuedeReagendar(opciones: {
  activa: boolean;
  tieneCitaConFecha: boolean;
}): boolean {
  return opciones.activa && opciones.tieneCitaConFecha;
}
