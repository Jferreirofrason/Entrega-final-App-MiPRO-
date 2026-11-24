// Aviso contextual de citas en el Home.
//
// La POSICIÓN comunica la prioridad: una visita en curso o un técnico en
// camino se muestran arriba de todo (debajo del saludo); una próxima visita
// o una solicitud en proceso van después de los servicios, con jerarquía
// menor. Módulo puro (node --test).
//
// Prioridad (documentada, pendiente de validación de producto):
//   1. Visita en curso ahora ("en progreso")        → máxima, arriba.
//   2. Técnico en camino ("en camino")              → alta, arriba.
//   3. Próxima visita agendada más cercana          → media, abajo.
//   4. Solicitud sincronizándose                    → informativa, abajo.
// Una solicitud recibida sin fecha NO aparece en el Home.
//
// Si hay varias visitas activas a la vez, se muestra la que comenzó antes
// (menor visitAt) y la card ofrece "Ver todas las visitas en curso".

import type { ServicioCliente, VisitaServicio } from "./servicios.ts";
import { clasificarServicio, proximaVisita } from "./servicios.ts";

export type TipoAviso =
  | "visita-en-curso"
  | "tecnico-en-camino"
  | "proxima-visita"
  | "enviando-solicitud";

/** Los dos primeros van arriba del Home; los otros, después de servicios. */
export type PrioridadAviso = "alta" | "media";

export interface AvisoCita {
  tipo: TipoAviso;
  servicio: ServicioCliente;
  visita: VisitaServicio | null;
  /** Otras visitas activas además de la mostrada (para "Ver todas"). */
  otrasEnCurso: number;
}

function norm(estado: string): string {
  return estado.trim().toLowerCase();
}

/** "En progreso" (vocabulario del modelo existente) y "En curso" (vocabulario
 * exacto del seguimiento por estados) significan lo mismo: la visita está
 * sucediendo ahora mismo. */
const ESTADOS_VISITA_ACTIVA = new Set(["en progreso", "en curso"]);

export function prioridadDeAviso(tipo: TipoAviso): PrioridadAviso {
  return tipo === "visita-en-curso" || tipo === "tecnico-en-camino" ? "alta" : "media";
}

export function situacionRelevante(
  servicios: readonly ServicioCliente[],
): AvisoCita | null {
  const enCurso = servicios.filter((s) => clasificarServicio(s) === "en-curso");

  // Visitas activas ahora, ordenadas por inicio (la más temprana primero).
  const activas = enCurso
    .flatMap((s) =>
      s.visitas
        .filter((v) => ESTADOS_VISITA_ACTIVA.has(norm(v.estado)) || norm(v.estado) === "en camino")
        .map((v) => ({ servicio: s, visita: v })),
    )
    .sort((a, b) => (a.visita.visitAt ?? "").localeCompare(b.visita.visitAt ?? ""));

  const enProgreso = activas.filter((a) => ESTADOS_VISITA_ACTIVA.has(norm(a.visita.estado)));
  if (enProgreso.length > 0) {
    return {
      tipo: "visita-en-curso",
      ...enProgreso[0],
      otrasEnCurso: activas.length - 1,
    };
  }
  if (activas.length > 0) {
    return {
      tipo: "tecnico-en-camino",
      ...activas[0],
      otrasEnCurso: activas.length - 1,
    };
  }

  const conProxima = enCurso
    .map((s) => ({ servicio: s, visita: proximaVisita(s) }))
    .filter((x): x is { servicio: ServicioCliente; visita: VisitaServicio } => Boolean(x.visita))
    .sort((a, b) => (a.visita.visitAt ?? "").localeCompare(b.visita.visitAt ?? ""));
  if (conProxima.length > 0) {
    return { tipo: "proxima-visita", ...conProxima[0], otrasEnCurso: 0 };
  }

  const sincronizando = enCurso.find((s) =>
    s.visitas.some((v) => norm(v.estado) === "pendiente sincronizar"),
  );
  if (sincronizando) {
    return { tipo: "enviando-solicitud", servicio: sincronizando, visita: null, otrasEnCurso: 0 };
  }

  return null;
}
