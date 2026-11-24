// Presentación de fecha y hora de una cita en formato fácil de reconocer.
//
// Preferido: "Jueves 12 de marzo, 2:30 p. m." (día de la semana y mes con
// nombre, hora en el formato que ya usa la app). Se formatea desde la fecha
// ISO de la visita; si no está disponible o es inválida, se conservan los
// textos del modelo tal cual. Sin lenguaje relativo ("hoy", "mañana") porque
// puede quedar desactualizado sin recalcularse. Módulo puro (node --test).

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatearFechaHora(
  visitAtIso: string | undefined,
  fallbackFecha: string,
  fallbackHora: string,
): string {
  if (visitAtIso) {
    const fecha = new Date(visitAtIso);
    if (!Number.isNaN(fecha.getTime())) {
      // Se quita la coma que ICU agrega tras el día de la semana, para la
      // forma preferida: "Martes 10 de septiembre".
      const parteFecha = new Intl.DateTimeFormat("es", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
        .format(fecha)
        .replace(/^([^\s,]+),/, "$1");
      const parteHora = new Intl.DateTimeFormat("es", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(fecha);
      return `${capitalizar(parteFecha)}, ${parteHora}`;
    }
  }
  return `${fallbackFecha}, ${fallbackHora}`;
}

/** Solo la fecha, sin hora: "18 de marzo" (para cierres y visitas pasadas). */
export function formatearFecha(iso: string | undefined): string | null {
  if (!iso) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "long" }).format(fecha);
}

/**
 * Fecha con rango horario: "Miércoles 12 de marzo, 2:00 p. m. a 4:00 p. m.".
 * Si falta el fin, cae en formatearFechaHora.
 */
export function formatearFechaRango(
  inicioIso: string | undefined,
  finIso: string | undefined,
): string | null {
  if (!inicioIso) return null;
  const inicio = new Date(inicioIso);
  if (Number.isNaN(inicio.getTime())) return null;
  const base = formatearFechaHora(inicioIso, "", "");
  if (!finIso) return base;
  const fin = new Date(finIso);
  if (Number.isNaN(fin.getTime())) return base;
  const horaFin = new Intl.DateTimeFormat("es", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(fin);
  return `${base} a ${horaFin}`;
}

/**
 * Rango compacto y escaneable: "Miércoles 12 de marzo · 2:00–4:00 p. m.".
 * Cuando inicio y fin comparten meridiano, este se dice una sola vez; si lo
 * cruzan, cada hora lleva el suyo ("11:00 a. m.–1:00 p. m."). Sin fin cae en
 * "Miércoles 12 de marzo · 2:30 p. m.".
 */
export function formatearFechaRangoCompacto(
  inicioIso: string | undefined,
  finIso: string | undefined,
): string | null {
  if (!inicioIso) return null;
  const inicio = new Date(inicioIso);
  if (Number.isNaN(inicio.getTime())) return null;

  const parteFecha = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(inicio)
    .replace(/^([^\s,]+),/, "$1");
  const hora = (d: Date) =>
    new Intl.DateTimeFormat("es", { hour: "numeric", minute: "2-digit", hour12: true }).format(d);

  const horaInicio = hora(inicio);
  const fin = finIso ? new Date(finIso) : null;
  if (!fin || Number.isNaN(fin.getTime())) {
    return `${capitalizar(parteFecha)} · ${horaInicio}`;
  }
  const horaFin = hora(fin);
  const meridiano = (h: string) => (h.includes("a.") ? "am" : h.includes("p.") ? "pm" : "");
  const soloHora = (h: string) => h.replace(/\s*[ap]\.\s*m\.\s*$/i, "").trim();
  const rango =
    meridiano(horaInicio) === meridiano(horaFin) && meridiano(horaInicio) !== ""
      ? `${soloHora(horaInicio)}\u2013${horaFin}`
      : `${horaInicio}\u2013${horaFin}`;
  // El bloque horario viaja entero: si no entra en la línea, baja completo
  // (nunca queda un "p. m." suelto ni se parte en el guion).
  const rangoIndivisible = rango.replace(/ /g, "\u00A0").replace(/\u2013/g, "\u2013\u2060");
  return `${capitalizar(parteFecha)} · ${rangoIndivisible}`;
}

/** Solo la hora: "2:30 p. m." (para visitas que suceden hoy). */
/** Fecha corta para listados compactos: "1 sept". */
export function formatearFechaCorta(iso: string | undefined): string | null {
  if (!iso) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(fecha);
}

export function formatearHora(iso: string | undefined): string | null {
  if (!iso) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Intl.DateTimeFormat("es", { hour: "numeric", minute: "2-digit", hour12: true }).format(fecha);
}

/**
 * La cita en una línea de listado: "15 oct. · 8:00 a. m. a 12:00 p. m.".
 *
 * Es un formato propio y no el compacto de las tarjetas: acá la fecha va
 * corta (el listado ya tiene mucho texto) y el rango se dice con "a" y no
 * con un guion, que es como se lee un horario en voz alta y es el formato
 * que pide la especificación.
 *
 * Cuando no hay hora de fin (una garantía manda el rango como texto), se
 * devuelve solo la fecha y el llamador le pega su propio rango.
 */
export function formatearCitaDeListado(
  inicioIso: string | undefined,
  finIso?: string,
): string | null {
  if (!inicioIso) return null;
  // Una fecha sin hora ("2026-10-15") la parsea como UTC y en esta zona
  // horaria termina siendo el día anterior a las 9 p. m. Se le pone el
  // mediodía local para que el día que se muestra sea el que dice el dato.
  const soloDia = /^\d{4}-\d{2}-\d{2}$/.test(inicioIso);
  const inicio = new Date(soloDia ? `${inicioIso}T12:00:00` : inicioIso);
  if (Number.isNaN(inicio.getTime())) return null;

  const fecha = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" })
    .format(inicio)
    .replace(/\.$/, "");
  const hora = (d: Date) =>
    new Intl.DateTimeFormat("es", { hour: "numeric", minute: "2-digit", hour12: true })
      .format(d)
      .replace(/\u202f/g, " ");

  // Sin hora no se inventa una: solo el día.
  if (soloDia || (inicio.getHours() === 0 && inicio.getMinutes() === 0)) {
    return `${fecha}.`;
  }

  const fin = finIso ? new Date(finIso) : null;
  if (!fin || Number.isNaN(fin.getTime())) return `${fecha}. · ${hora(inicio)}`;
  return `${fecha}. · ${hora(inicio)} a ${hora(fin)}`;
}

const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/**
 * Día, mes y año: "12 oct. 2026".
 *
 * Se arma a mano y no con Intl: el formato corto de Intl cambia de un motor
 * a otro (con punto, sin punto, con el mes en mayúscula) y acá el formato
 * es parte de la especificación. Lo usan la fecha de compra de un producto
 * y la fecha de solicitud del historial, que tienen que verse iguales.
 */
export function formatearFechaDiaMesAnio(iso: string | undefined): string | null {
  if (!iso) return null;
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!partes) return null;
  const mes = Number(partes[2]);
  if (mes < 1 || mes > 12) return null;
  const dia = Number(partes[3]);
  if (dia < 1 || dia > 31) return null;
  return `${dia} ${MESES_CORTOS[mes - 1]}. ${partes[1]}`;
}
