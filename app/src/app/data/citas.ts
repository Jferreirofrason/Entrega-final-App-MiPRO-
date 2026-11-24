// Fuente de datos de "Mis Citas" para el Home.
//
// La fuente real del prototipo es data/projects.ts (los proyectos son las
// citas: el listado completo en /proyectos ya se titula "Mis Citas"). Este
// módulo adapta ese modelo al view model del Home y simula la latencia de un
// servicio para que los estados de carga y error sean reales en la interfaz.
//
// ESCENARIOS DE DEMO (solo para revisión y QA, vía query del hash):
//   #/?citas=sin | una | varias | error | cargando
//   #/?estado=pendiente-sincronizar | solicitud-recibida | visita-coordinada |
//             en-progreso | completado | cancelado-con-tecnico |
//             cancelado-sin-tecnico
// Sin parámetros se usan los datos del mock tal cual.

import { projects, Project } from "./projects";
import { CitaHome } from "../logic/citas";

export type EscenarioCitas = "varias" | "una" | "sin" | "error" | "cargando";

const LATENCIA_MS = 350;

function adaptarProyecto(p: Project): CitaHome {
  return {
    id: p.id,
    titulo: p.title,
    estado: p.status,
    fecha: p.date,
    hora: p.time,
    tecnico: p.handyman,
    visitAt: p.visitAt,
    tuvoTecnicoAsignado: p.tuvoTecnicoAsignado,
  };
}

// FIXTURES de estados: una cita por estado del requerimiento, para poder
// revisar y probar los seis estados sin depender de los datos del mock.
// No son datos productivos.
const FIXTURES_ESTADO: Record<string, CitaHome> = {
  "pendiente-sincronizar": {
    id: 901,
    titulo: "Mantenimiento de aire acondicionado",
    estado: "Pendiente sincronizar",
    fecha: "Vie 14 Mar",
    hora: "9:00 a. m.",
    visitAt: "2025-03-14T09:00:00",
  },
  "solicitud-recibida": {
    id: 902,
    titulo: "Revisión de plomería",
    estado: "Solicitud recibida",
    fecha: "Sáb 15 Mar",
    hora: "11:00 a. m.",
    visitAt: "2025-03-15T11:00:00",
  },
  "visita-coordinada": {
    id: 903,
    titulo: "Instalación de calentador",
    estado: "Visita coordinada",
    fecha: "Lun 17 Mar",
    hora: "10:30 a. m.",
    tecnico: "Luis Herrera",
    visitAt: "2025-03-17T10:30:00",
  },
  "en-progreso": {
    id: 904,
    titulo: "Pintura interior",
    estado: "En progreso",
    fecha: "Hoy",
    hora: "2:00 p. m.",
    tecnico: "Miguel Ángel Torres",
    visitAt: "2025-03-09T14:00:00",
  },
  completado: {
    id: 905,
    titulo: "Instalación eléctrica",
    estado: "Completado",
    fecha: "Mar 4 Mar",
    hora: "3:00 p. m.",
    tecnico: "Carlos Rodríguez",
    visitAt: "2025-03-04T15:00:00",
  },
  "cancelado-con-tecnico": {
    id: 906,
    titulo: "Remodelación de cocina",
    estado: "Cancelado",
    fecha: "Jue 6 Mar",
    hora: "8:00 a. m.",
    tecnico: "Juan Pérez",
    tuvoTecnicoAsignado: true,
    visitAt: "2025-03-06T08:00:00",
  },
  "cancelado-sin-tecnico": {
    id: 907,
    titulo: "Limpieza de ductos",
    estado: "Cancelado",
    fecha: "Mié 5 Mar",
    hora: "4:00 p. m.",
    tuvoTecnicoAsignado: false,
    visitAt: "2025-03-05T16:00:00",
  },
};

export function leerEscenario(search: string): {
  escenario: EscenarioCitas;
  estadoDemo: string | null;
} {
  const params = new URLSearchParams(search);
  const estadoDemo = params.get("estado");
  const crudo = params.get("citas");
  const escenario: EscenarioCitas =
    crudo === "sin" || crudo === "una" || crudo === "error" || crudo === "cargando"
      ? crudo
      : "varias";
  return { escenario, estadoDemo };
}

export function cargarCitasHome(
  escenario: EscenarioCitas,
  estadoDemo: string | null,
): Promise<CitaHome[]> {
  return new Promise((resolve, reject) => {
    if (escenario === "cargando") return; // nunca resuelve: para revisar skeletons

    setTimeout(() => {
      if (escenario === "error") {
        reject(new Error("No se pudieron cargar las citas"));
        return;
      }
      if (estadoDemo && FIXTURES_ESTADO[estadoDemo]) {
        resolve([FIXTURES_ESTADO[estadoDemo]]);
        return;
      }
      const todas = projects.map(adaptarProyecto);
      if (escenario === "sin") resolve([]);
      else if (escenario === "una") resolve(todas.slice(0, 1));
      else resolve(todas);
    }, LATENCIA_MS);
  });
}
