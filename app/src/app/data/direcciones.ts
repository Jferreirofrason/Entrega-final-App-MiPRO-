// Direcciones guardadas del cliente (mock).
//
// GAP DOCUMENTADO: hoy existen dos copias distintas de direcciones en la app
// (AgregarProducto y Configuración, con datos diferentes). Este módulo es la
// fuente única para el flujo de garantía; unificar las otras pantallas queda
// como deuda señalada.

import { DireccionSolicitud } from "../logic/solicitudGarantia";
import {
  DireccionNueva,
  concatenarDireccion,
} from "../logic/solicitudServicio";

export const DIRECCIONES_GUARDADAS: DireccionSolicitud[] = [
  {
    id: "casa",
    etiqueta: "Casa",
    direccion: "Calle 50, Edificio Global Bank, Piso 12, Ciudad de Panamá",
  },
  {
    id: "oficina",
    etiqueta: "Oficina",
    direccion: "Costa del Este, Business Park, Torre Norte, Oficina 5A",
  },
];

// ── Direcciones agregadas por el usuario en esta sesión ──
//
// El alta de dirección del flujo de agendamiento guarda acá; el selector
// las muestra junto a las fijas y deja seleccionada la recién creada.

const CLAVE_SESION = "mipro-direcciones-sesion";

export function direccionesDeLaSesion(): DireccionSolicitud[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE_SESION);
    return crudo ? (JSON.parse(crudo) as DireccionSolicitud[]) : [];
  } catch {
    return [];
  }
}

export function todasLasDirecciones(): DireccionSolicitud[] {
  return [...DIRECCIONES_GUARDADAS, ...direccionesDeLaSesion()];
}

export function guardarDireccionDeSesion(
  nueva: DireccionNueva,
): DireccionSolicitud {
  const direccion: DireccionSolicitud = {
    id: `direccion-${Date.now()}`,
    etiqueta: nueva.alias,
    direccion: concatenarDireccion(nueva),
    referencia: nueva.detalles || undefined,
  };
  try {
    sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify([...direccionesDeLaSesion(), direccion]),
    );
  } catch {
    // Sin storage, la dirección vive solo en el borrador.
  }
  return direccion;
}

export function buscarDireccion(id: string): DireccionSolicitud | null {
  return todasLasDirecciones().find((d) => d.id === id) ?? null;
}
