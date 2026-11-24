// Fuente de datos de "Mis Citas" agrupada por SERVICIO.
//
// El modelo real del prototipo (data/projects.ts) es plano: cada proyecto es
// una cita única. Este módulo lo adapta a la entidad padre (un servicio con
// sus visitas) y agrega FIXTURES claramente marcados para los casos que el
// modelo actual no puede expresar: un servicio con varias visitas, uno
// completado y uno cancelado. Ningún dato de acá es productivo.
//
// El proyecto 1 ("Instalación de aire acondicionado") se presenta como el
// servicio multi-visita del ejemplo del requerimiento; los proyectos 2 a 4 se
// adaptan uno a uno (una visita por servicio, el estado actual del modelo).
//
// ESCENARIOS DE DEMO (vía query del hash):
//   #/proyectos?servicios=error | cargando | vacio

import { projects, Project } from "./projects";
import { ServicioCliente } from "../logic/servicios";
import { solicitudesDeLaSesion } from "./solicitudes";

export type EscenarioServicios =
  | "ok"
  | "error"
  | "sinconexion"
  | "cargando"
  | "vacio"
  | "encamino"
  | "proxima"
  | "porasignar";

const LATENCIA_MS = 350;

// Título de la visita según la NOMENCLATURA CONTROLADA de backoffice
// (TIPOS_VISITA en logic/servicios): nunca texto libre del operador.
const PROPOSITOS_MOCK: Record<number, string> = {
  2: "Instalación",
  3: "Inspección",
  4: "Instalación",
};

function adaptarProyecto(p: Project): ServicioCliente {
  return {
    id: `proyecto-${p.id}`,
    nombre: p.title,
    numeroReserva: `MPR-30${40 + p.id}-${p.id}`,
    direccionTexto: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
    visitas: [
      {
        id: p.id,
        proposito: PROPOSITOS_MOCK[p.id],
        estado: p.status,
        visitAt: p.visitAt,
        tecnico: p.handyman,
      },
    ],
    // El modelo actual no confirma el plan de visitas.
    totalVisitasConfirmado: false,
  };
}

// FIXTURE: servicio con varias visitas (el caso central del requerimiento).
// Plan confirmado desde el inicio: el progreso puede prometer el total.
const FIXTURE_AIRE_MULTIVISITA: ServicioCliente = {
  id: "fixture-aire-multivisita",
  nombre: "Instalación de aire acondicionado",
  numeroReserva: "MPR-2214-7",
  direccionTexto: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
  totalEstimado: 175,
  totalVisitasConfirmado: true,
  visitas: [
    {
      id: "aire-1",
      proposito: "Inspección",
      estado: "Completada",
      visitAt: "2025-03-03T10:00:00",
      tecnico: "Juan Pérez",
    },
    {
      id: "aire-2",
      proposito: "Instalación",
      estado: "Completada",
      visitAt: "2025-03-07T09:00:00",
      tecnico: "Juan Pérez",
    },
    {
      id: "aire-3",
      proposito: "Instalación",
      estado: "Cita confirmada",
      visitAt: "2025-03-12T14:00:00",
      visitaFinAt: "2025-03-12T16:00:00",
      tecnico: "Carlos Rodríguez",
    },
    {
      id: "aire-4",
      proposito: "Control final",
      estado: "Por coordinar",
    },
  ],
};

// FIXTURE: servicio completado (todas las visitas realizadas).
const FIXTURE_PLOMERIA_COMPLETADA: ServicioCliente = {
  id: "fixture-plomeria-completada",
  nombre: "Revisión de plomería",
  numeroReserva: "MPR-1830-2",
  direccionTexto: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
  totalEstimado: 45,
  totalVisitasConfirmado: true,
  finalizadoEl: "2025-02-18T16:00:00",
  visitas: [
    {
      id: "plomeria-1",
      proposito: "Inspección",
      estado: "Completada",
      visitAt: "2025-02-10T09:00:00",
      tecnico: "Luis Herrera",
    },
    {
      id: "plomeria-2",
      proposito: "Reparación",
      estado: "Completada",
      visitAt: "2025-02-14T10:00:00",
      tecnico: "Luis Herrera",
    },
    {
      id: "plomeria-3",
      proposito: "Control final",
      estado: "Completada",
      visitAt: "2025-02-18T15:00:00",
      tecnico: "Miguel Ángel Torres",
    },
  ],
};

// FIXTURE: servicio cancelado por el cliente con una visita ya realizada.
const FIXTURE_CALENTADOR_CANCELADO: ServicioCliente = {
  id: "fixture-calentador-cancelado",
  nombre: "Mantenimiento de calentador",
  numeroReserva: "MPR-1544-9",
  direccionTexto: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
  totalEstimado: 45,
  cancelado: true,
  canceladoEl: "2025-02-12T12:00:00",
  visitas: [
    {
      id: "calentador-1",
      proposito: "Inspección",
      estado: "Completada",
      visitAt: "2025-02-05T11:00:00",
      tecnico: "Carlos Rodríguez",
    },
    {
      id: "calentador-2",
      proposito: "Reparación",
      estado: "Cancelada",
    },
  ],
};

// FIXTURE: seguimiento de estados para "Inspección de aire acondicionado"
// (spec de negocio, sep 2026). Una sola visita que recorre el vocabulario
// EXACTO Por coordinar → Cita confirmada → En curso → Completada, con
// Cancelada como rama opcional; el técnico (Juan Pérez) aparece recién
// desde "Cita confirmada" y se mantiene en las siguientes SOLO si ya se
// había asignado antes de llegar a ese estado (regla de logic/citas.ts).
// Estado ajustable vía query del hash, para revisar cada uno:
//   #/servicios/fixture-inspeccion-aire?inspeccion=coordinar|confirmada|curso|completada|cancelada
export type EstadoInspeccionAire =
  | "coordinar"
  | "confirmada"
  | "curso"
  | "completada"
  | "cancelada";

const TECNICO_INSPECCION_AIRE = "Juan Pérez";
export const ID_INSPECCION_AIRE = "fixture-inspeccion-aire";

function construirInspeccionAire(escenario: EstadoInspeccionAire): ServicioCliente {
  const base = {
    id: ID_INSPECCION_AIRE,
    nombre: "Inspección de aire acondicionado",
    numeroReserva: "MPR-3902-4",
    direccionTexto: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
    totalEstimado: 20,
    totalVisitasConfirmado: true,
  };
  switch (escenario) {
    case "coordinar":
      // Todavía no hay técnico: el estado no lo pide ni lo insinúa.
      return { ...base, visitas: [{ id: "inspeccion-aire-1", proposito: "Inspección", estado: "Por coordinar" }] };
    case "curso":
      return {
        ...base,
        visitas: [{
          id: "inspeccion-aire-1", proposito: "Inspección", estado: "En curso",
          visitAt: "2026-09-11T10:00:00", tecnico: TECNICO_INSPECCION_AIRE,
        }],
      };
    case "completada":
      return {
        ...base,
        finalizadoEl: "2026-09-05T12:00:00",
        visitas: [{
          id: "inspeccion-aire-1", proposito: "Inspección", estado: "Completada",
          visitAt: "2026-09-05T10:00:00", tecnico: TECNICO_INSPECCION_AIRE,
        }],
      };
    case "cancelada":
      // Ya tenía técnico asignado (venía de "Cita confirmada") antes de
      // cancelarse: por eso sigue visible acá.
      return {
        ...base,
        cancelado: true,
        canceladoEl: "2026-09-09T12:00:00",
        visitas: [{
          id: "inspeccion-aire-1", proposito: "Inspección", estado: "Cancelada",
          visitAt: "2026-09-08T10:00:00", tecnico: TECNICO_INSPECCION_AIRE,
        }],
      };
    case "confirmada":
    default:
      return {
        ...base,
        visitas: [{
          id: "inspeccion-aire-1", proposito: "Inspección", estado: "Cita confirmada",
          visitAt: "2026-09-18T10:00:00", tecnico: TECNICO_INSPECCION_AIRE,
        }],
      };
  }
}

export function leerEstadoInspeccionAire(search: string): EstadoInspeccionAire {
  const crudo = new URLSearchParams(search).get("inspeccion");
  const validos: EstadoInspeccionAire[] = ["coordinar", "confirmada", "curso", "completada", "cancelada"];
  return (validos as string[]).includes(crudo ?? "") ? (crudo as EstadoInspeccionAire) : "confirmada";
}

// FIXTURE: solicitud recién enviada, sin visitas todavía. Estado general
// "solicitud-recibida" siempre disponible como ejemplo (no depende de que el
// usuario haya creado una solicitud en esta sesión).
const FIXTURE_LAVADORA_SOLICITUD_RECIBIDA: ServicioCliente = {
  id: "fixture-lavadora-solicitud-recibida",
  nombre: "Instalación de lavadora",
  numeroReserva: "MPR-3061-1",
  direccionTexto: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
  totalEstimado: 45,
  creadaEl: "2025-03-20T09:00:00",
  visitas: [],
};

// FIXTURE: en revisión/coordinando: ya hay una visita generada pero todavía
// sin fecha confirmada por operaciones (estado general "coordinando").
const FIXTURE_PINTURA_COORDINANDO: ServicioCliente = {
  id: "fixture-pintura-coordinando",
  nombre: "Pintura interior",
  numeroReserva: "MPR-3058-2",
  direccionTexto: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
  totalEstimado: 120,
  totalVisitasConfirmado: false,
  creadaEl: "2025-03-15T09:00:00",
  visitas: [
    {
      id: "pintura-1",
      estado: "Por coordinar",
    },
  ],
};

function construirServicios(): ServicioCliente[] {
  const adaptados = projects
    .filter((p) => p.id !== 1) // el proyecto 1 se presenta como multi-visita
    .map(adaptarProyecto);
  // Solicitudes creadas por el usuario en esta sesión (sin visitas todavía:
  // aparecen "En curso" como "Solicitud recibida").
  const solicitudes: ServicioCliente[] = solicitudesDeLaSesion().map((s) => ({
    id: s.id,
    nombre: s.nombreServicio,
    visitas: [],
    numeroReserva: s.numeroReserva,
    creadaEl: s.creadaEl,
    direccionTexto: s.direccionTexto,
    totalEstimado: s.totalEstimado,
    notas: s.notas,
    contactoNombre: s.contactoNombre,
  }));
  return [
    ...solicitudes,
    FIXTURE_LAVADORA_SOLICITUD_RECIBIDA,
    FIXTURE_PINTURA_COORDINANDO,
    FIXTURE_AIRE_MULTIVISITA,
    construirInspeccionAire("confirmada"),
    ...adaptados,
    FIXTURE_PLOMERIA_COMPLETADA,
    FIXTURE_CALENTADOR_CANCELADO,
  ];
}

export function leerEscenarioServicios(search: string): EscenarioServicios {
  const crudo = new URLSearchParams(search).get("servicios");
  const validos: EscenarioServicios[] = ["error", "sinconexion", "cargando", "vacio", "encamino", "proxima", "porasignar"];
  return (validos as string[]).includes(crudo ?? "") ? (crudo as EscenarioServicios) : "ok";
}

export function cargarServicios(
  escenario: EscenarioServicios,
): Promise<ServicioCliente[]> {
  return new Promise((resolve, reject) => {
    if (escenario === "cargando") return; // nunca resuelve: para revisar skeletons

    setTimeout(() => {
      if (escenario === "error") reject(new Error("No se pudieron cargar los servicios"));
      else if (escenario === "sinconexion") reject(new Error("sin-conexion"));
      else if (escenario === "vacio") resolve([]);
      // QA de las variantes del aviso del Home:
      else if (escenario === "encamino") resolve(projects.filter((p) => p.id === 2).map(adaptarProyecto));
      else if (escenario === "proxima") resolve(projects.filter((p) => p.id === 3).map(adaptarProyecto));
      // Visita coordinada pero aún sin profesional: el Home debe decirlo.
      else if (escenario === "porasignar")
        resolve(
          projects
            .filter((p) => p.id === 3)
            .map(adaptarProyecto)
            .map((s) => ({
              ...s,
              visitas: s.visitas.map((v) => ({ ...v, tecnico: undefined })),
            })),
        );
      else resolve(construirServicios());
    }, LATENCIA_MS);
  });
}

/**
 * `search` es opcional y solo afecta a "Inspección de aire acondicionado":
 * permite abrir cualquiera de sus 5 estados vía query del hash (ver el
 * fixture arriba). El resto de los servicios ignora el parámetro.
 */
export function buscarServicioPorId(id: string, search = ""): ServicioCliente | null {
  if (id === ID_INSPECCION_AIRE) {
    return construirInspeccionAire(leerEstadoInspeccionAire(search));
  }
  return construirServicios().find((s) => s.id === id) ?? null;
}
