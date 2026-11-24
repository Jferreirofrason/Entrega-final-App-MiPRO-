// Fuente de datos de garantías y reclamos.
//
// El modelo real del prototipo es CLAIMS_DB (data/products.ts): número, fecha
// visible, producto y estado "En proceso". Este módulo lo adapta a la entidad
// completa del dominio y agrega FIXTURES claramente marcados para los casos
// que el modelo actual no tiene. Ningún dato de acá es productivo.
//
// El estado del CASO nunca se hardcodea acá: cada fixture define sus
// `citas[]` (o `cancelado`/`resolucion`) y estadoGeneralReclamo() lo deriva.
//
// ESCENARIOS DE DEMO (vía query del hash en el Home):
//   #/?reclamos=sin | accion | visita | finalizados | largo | error | cargando

import { CLAIMS_DB } from "./products";
import { ReclamoGarantiaCliente } from "../logic/reclamos";

// ── Reclamos creados por el usuario en esta sesión ──
// El flujo "Solicitar ayuda por garantía" guarda acá la solicitud enviada
// (sessionStorage: el prototipo no tiene backend) para que aparezca en
// "Garantía y reclamos" como "Solicitud recibida".

const CLAVE_SESION = "mipro-reclamos-sesion";

export function reclamosDeLaSesion(): ReclamoGarantiaCliente[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE_SESION);
    return crudo ? (JSON.parse(crudo) as ReclamoGarantiaCliente[]) : [];
  } catch {
    return [];
  }
}

export function guardarReclamoDeSesion(reclamo: ReclamoGarantiaCliente): void {
  try {
    sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify([reclamo, ...reclamosDeLaSesion()]),
    );
  } catch {
    // Sin storage, el reclamo vive solo en la pantalla de confirmación.
  }
}

export type EscenarioReclamos =
  | "sinconexion"
  | "ok"
  | "sin"
  | "accion"
  | "visita"
  | "finalizados"
  | "largo"
  | "error"
  | "cargando";

const LATENCIA_MS = 350;

// Reclamo real del mock (REC-2024-0892, sin cita coordinada todavía: el
// caso deriva "En revisión").
const RECLAMO_EXISTENTE: ReclamoGarantiaCliente = {
  id: "reclamo-1",
  numero: CLAIMS_DB["1"].claimNumber,
  producto: CLAIMS_DB["1"].productName,
  iniciadoEl: "2024-05-10T10:00:00",
  actualizadoEl: "2024-05-16T09:00:00",
  citas: [],
};

// FIXTURES de demo (no productivos). Los datos del producto (marca,
// categoría, subcategoría y vigencia) salen de la matriz de garantía y de
// la información de Nisato; el nombre visible es el alias que registró el
// cliente y se muestra TAL CUAL. La modalidad de atención la define
// operación (nunca el cliente).

const FIXTURE_REQUIERE_ACCION: ReclamoGarantiaCliente = {
  id: "fixture-reclamo-accion",
  numero: "REC-2024-0911",
  producto: "Lavadora",
  marca: "Nisato",
  categoriaProducto: "Lavadoras",
  subcategoriaProducto: "Lavadoras automáticas",
  vigencia: "1 año de garantía.",
  iniciadoEl: "2024-05-20T09:00:00",
  requiereAccionCliente: "Envíanos una foto de la placa del equipo para continuar.",
  citas: [],
};

// Modalidad 1: el taller visita al cliente (Nisato brinda servicio a
// domicilio sin cargo en ciudad de Panamá). Cita ya confirmada.
const FIXTURE_TALLER_VISITA: ReclamoGarantiaCliente = {
  id: "fixture-reclamo-visita",
  numero: "REC-2024-0920",
  producto: "Aire acondicionado del cuarto",
  marca: "Nisato",
  categoriaProducto: "Aires acondicionados",
  subcategoriaProducto: "Aires de tecnología Inverter",
  vigencia: "1 año de garantía. 8 años de garantía en compresor inverter.",
  iniciadoEl: "2024-05-25T09:00:00",
  citas: [
    {
      id: 1,
      tipo: "Inspección",
      estado: "Cita confirmada",
      fecha: "2024-06-03T00:00:00",
      horario: "8:00 a. m. a 12:00 p. m.",
      modalidad: {
        tipo: "taller-visita",
        direccion: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
      },
      historial: [
        { estado: "Por coordinar", fecha: "2024-05-25T09:00:00" },
        { estado: "Cita confirmada", fecha: "2024-05-28T14:30:00" },
      ],
    },
  ],
};

// Modalidad 2: el cliente lleva el producto al taller autorizado (Nisato:
// Taller principal Panamá; la dirección puntual la comunica operación).
// La reparación ya está en curso.
const FIXTURE_CLIENTE_LLEVA: ReclamoGarantiaCliente = {
  id: "fixture-reclamo-taller",
  numero: "REC-2024-0927",
  producto: "Refrigeradora de la cocina",
  marca: "Nisato",
  categoriaProducto: "Refrigeradores",
  subcategoriaProducto: "Refrigeradores French door",
  vigencia: "1 año de garantía. 10 años de garantía en compresor inverter.",
  iniciadoEl: "2024-05-18T09:00:00",
  citas: [
    {
      id: 1,
      tipo: "Reparación",
      estado: "En curso",
      fecha: "2024-05-27T11:00:00",
      horario: "Lunes a viernes, 8:00 a. m. a 4:00 p. m.",
      modalidad: { tipo: "cliente-lleva", taller: "Taller principal Panamá" },
      historial: [
        { estado: "Por coordinar", fecha: "2024-05-18T09:00:00" },
        { estado: "Cita confirmada", fecha: "2024-05-22T10:15:00" },
        { estado: "En curso", fecha: "2024-05-27T11:00:00" },
      ],
    },
  ],
};

// Modalidad 3: el cliente dejó el producto en una tienda y desde ahí lo
// mueve operación. Datos simulados coherentes: la tienda, la fecha en que
// quedó recibido y las indicaciones que dio el local.
const FIXTURE_DEJA_TIENDA: ReclamoGarantiaCliente = {
  id: "fixture-reclamo-tienda",
  numero: "REC-2024-0936",
  producto: "Microondas de la cocina",
  marca: "Nisato",
  categoriaProducto: "Microondas",
  subcategoriaProducto: "Microondas de mesa",
  vigencia: "1 año de garantía.",
  iniciadoEl: "2024-05-20T09:00:00",
  citas: [
    {
      id: 1,
      tipo: "Reparación",
      estado: "Cita confirmada",
      fecha: "2024-05-24T10:00:00",
      horario: "Lunes a sábado, 9:00 a. m. a 6:00 p. m.",
      modalidad: {
        tipo: "deja-en-tienda",
        tienda: "Cochez Costa del Este",
        instrucciones: "Conserva el comprobante de recepción que te dieron en la tienda.",
      },
      historial: [
        { estado: "Por coordinar", fecha: "2024-05-20T09:00:00" },
        { estado: "Cita confirmada", fecha: "2024-05-22T11:30:00" },
      ],
    },
  ],
};

// Caso recién creado: todavía sin cita coordinada por operación.
const FIXTURE_POR_COORDINAR: ReclamoGarantiaCliente = {
  id: "fixture-reclamo-coordinar",
  numero: "REC-2024-0931",
  producto: "Congelador",
  marca: "Nisato",
  categoriaProducto: "Refrigeradores",
  subcategoriaProducto: "Congeladores",
  vigencia: "1 año de garantía. 3 años de garantía en compresor inverter.",
  iniciadoEl: "2024-05-29T09:00:00",
  citas: [
    {
      id: 1,
      tipo: "Inspección",
      estado: "Por coordinar",
      historial: [{ estado: "Por coordinar", fecha: "2024-05-29T09:00:00" }],
    },
  ],
};

const FIXTURE_RESUELTO: ReclamoGarantiaCliente = {
  id: "fixture-reclamo-resuelto",
  numero: "REC-2024-0850",
  producto: "Estufa de gas",
  marca: "Nisato",
  categoriaProducto: "Estufas regulares",
  subcategoriaProducto: "Estufas regulares a gas",
  vigencia: "1 año de garantía.",
  iniciadoEl: "2024-04-02T09:00:00",
  resueltoEl: "2024-04-18T15:00:00",
  resolucion: "Se reemplazó el equipo por uno nuevo, cubierto por la garantía.",
  citas: [
    {
      id: 1,
      tipo: "Inspección",
      estado: "Completada",
      fecha: "2024-04-09T10:00:00",
      modalidad: { tipo: "taller-visita", direccion: "Domicilio del cliente" },
      historial: [
        { estado: "Por coordinar", fecha: "2024-04-02T09:00:00" },
        { estado: "Cita confirmada", fecha: "2024-04-05T12:00:00" },
        { estado: "En curso", fecha: "2024-04-09T10:00:00" },
        { estado: "Completada", fecha: "2024-04-09T12:30:00" },
      ],
    },
    {
      id: 2,
      tipo: "Control final",
      estado: "Completada",
      fecha: "2024-04-18T15:00:00",
      modalidad: { tipo: "taller-visita", direccion: "Domicilio del cliente" },
      historial: [
        { estado: "Por coordinar", fecha: "2024-04-10T09:00:00" },
        { estado: "Cita confirmada", fecha: "2024-04-15T11:00:00" },
        { estado: "En curso", fecha: "2024-04-18T15:00:00" },
        { estado: "Completada", fecha: "2024-04-18T16:45:00" },
      ],
    },
  ],
};

// Ejemplo de cita hija Cancelada: la primera visita se cancela y se
// coordina una nueva. El caso queda en "Cita programada" (hay una cita
// confirmada), pero el historial conserva la cita cancelada en su lugar
// cronológico, con su técnico y fecha (ya estaba confirmada al cancelarse).
const FIXTURE_CITA_REPROGRAMADA: ReclamoGarantiaCliente = {
  id: "fixture-reclamo-reprogramado",
  numero: "REC-2024-0945",
  producto: "Lavavajillas",
  marca: "Nisato",
  categoriaProducto: "Lavavajillas",
  subcategoriaProducto: "Lavavajillas empotrables",
  vigencia: "1 año de garantía.",
  iniciadoEl: "2024-06-01T09:00:00",
  citas: [
    {
      id: 1,
      tipo: "Inspección",
      estado: "Cancelada",
      fecha: "2024-06-05T09:00:00",
      horario: "8:00 a. m. a 12:00 p. m.",
      tecnico: "Ana Gómez",
      modalidad: { tipo: "taller-visita", direccion: "Domicilio del cliente" },
      historial: [
        { estado: "Por coordinar", fecha: "2024-06-01T09:00:00" },
        { estado: "Cita confirmada", fecha: "2024-06-02T16:00:00" },
        { estado: "Cancelada", fecha: "2024-06-04T18:20:00" },
      ],
    },
    {
      id: 2,
      tipo: "Inspección",
      estado: "Cita confirmada",
      fecha: "2024-06-10T09:00:00",
      horario: "8:00 a. m. a 12:00 p. m.",
      modalidad: { tipo: "taller-visita", direccion: "Domicilio del cliente" },
      historial: [
        { estado: "Por coordinar", fecha: "2024-06-04T18:25:00" },
        { estado: "Cita confirmada", fecha: "2024-06-06T09:40:00" },
      ],
    },
  ],
};

const FIXTURE_CANCELADO: ReclamoGarantiaCliente = {
  id: "fixture-reclamo-cancelado",
  numero: "REC-2024-0801",
  producto: "Ventilador de techo",
  iniciadoEl: "2024-03-15T09:00:00",
  cancelado: true,
  citas: [],
};

// FIXTURE de QA: nombre de producto largo (validar que no se trunque).
const FIXTURE_NOMBRE_LARGO: ReclamoGarantiaCliente = {
  id: "fixture-reclamo-largo",
  numero: "REC-2024-0930",
  producto: "Refrigeradora de dos puertas con dispensador de agua y hielo",
  iniciadoEl: "2024-05-27T09:00:00",
  citas: [],
};

function porEscenario(escenario: EscenarioReclamos): ReclamoGarantiaCliente[] {
  switch (escenario) {
    case "sin":
      return [];
    case "accion":
      return [FIXTURE_REQUIERE_ACCION, RECLAMO_EXISTENTE, FIXTURE_RESUELTO];
    case "visita":
      return [FIXTURE_TALLER_VISITA, FIXTURE_CLIENTE_LLEVA, FIXTURE_DEJA_TIENDA, FIXTURE_RESUELTO];
    case "finalizados":
      return [FIXTURE_RESUELTO, FIXTURE_CANCELADO];
    case "largo":
      return [FIXTURE_NOMBRE_LARGO];
    default:
      return [
        ...reclamosDeLaSesion(),
        RECLAMO_EXISTENTE,
        FIXTURE_TALLER_VISITA,
        FIXTURE_CLIENTE_LLEVA,
        FIXTURE_POR_COORDINAR,
        FIXTURE_CITA_REPROGRAMADA,
        FIXTURE_RESUELTO,
        FIXTURE_CANCELADO,
      ];
  }
}

export function leerEscenarioReclamos(search: string): EscenarioReclamos {
  const crudo = new URLSearchParams(search).get("reclamos");
  const validos: EscenarioReclamos[] = ["sinconexion", "sin", "accion", "visita", "finalizados", "largo", "error", "cargando"];
  return (validos as string[]).includes(crudo ?? "") ? (crudo as EscenarioReclamos) : "ok";
}

export function cargarReclamos(
  escenario: EscenarioReclamos,
): Promise<ReclamoGarantiaCliente[]> {
  return new Promise((resolve, reject) => {
    if (escenario === "cargando") return; // nunca resuelve: para revisar skeletons

    setTimeout(() => {
      if (escenario === "error") reject(new Error("No se pudieron cargar los reclamos"));
      else if (escenario === "sinconexion") reject(new Error("sin-conexion"));
      else resolve(porEscenario(escenario));
    }, LATENCIA_MS);
  });
}

export function buscarReclamoPorId(id: string): ReclamoGarantiaCliente | null {
  const todos = [
    ...reclamosDeLaSesion(),
    RECLAMO_EXISTENTE,
    FIXTURE_REQUIERE_ACCION,
    FIXTURE_TALLER_VISITA,
    FIXTURE_CLIENTE_LLEVA,
    FIXTURE_DEJA_TIENDA,
    FIXTURE_POR_COORDINAR,
    FIXTURE_CITA_REPROGRAMADA,
    FIXTURE_RESUELTO,
    FIXTURE_CANCELADO,
    FIXTURE_NOMBRE_LARGO,
  ];
  return todos.find((r) => r.id === id) ?? null;
}
