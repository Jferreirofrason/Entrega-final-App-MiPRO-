// La lista de Mis solicitudes: servicios y garantías, juntos.
//
// ⚠️ NO HAY DATOS PROPIOS. Esto llama a las mismas dos consultas que ya
// usan "Mis Citas" (/proyectos) y Garantía (/garantia, /reclamos), y
// normaliza sus resultados. Si mañana hay un endpoint único, se reemplaza
// esta función y las pantallas no se enteran.
//   ENDPOINT: GET /api/solicitudes  (o las dos de hoy, unidas acá)

import { cargarServicios, type EscenarioServicios } from "./servicios";
import { CATALOGO_SERVICIOS } from "./catalogo";
import { cargarReclamos, type EscenarioReclamos } from "./reclamos";
import {
  desdeElServicio,
  desdeLaGarantia,
  type SolicitudUnificada,
} from "../logic/misSolicitudes";

/**
 * Trae todo y lo normaliza.
 *
 * Las dos consultas salen en paralelo: son independientes y esperar una
 * detrás de la otra duplicaría la espera. Si cualquiera falla, falla la
 * pantalla entera, porque una lista a medias que dice "todas tus
 * solicitudes" miente.
 */
export async function cargarMisSolicitudes(
  escenarioServicios: EscenarioServicios,
  escenarioReclamos: EscenarioReclamos,
): Promise<SolicitudUnificada[]> {
  const [servicios, reclamos] = await Promise.all([
    cargarServicios(escenarioServicios),
    cargarReclamos(escenarioReclamos),
  ]);
  return [
    ...servicios.map((s) => desdeElServicio(s, fotoDelServicio(s.nombre))),
    ...reclamos.map(desdeLaGarantia),
  ];
}

/**
 * La foto del servicio contratado, buscada por nombre.
 *
 * Un servicio ya creado guarda el NOMBRE, no el id del catálogo: es lo
 * único con lo que se puede recuperar su foto hoy. Si no hay coincidencia,
 * la fila usa su respaldo; nunca se le pone la de otro servicio.
 *
 * PENDIENTE: que la solicitud guarde el id del servicio del catálogo.
 */
function fotoDelServicio(nombre: string): string | undefined {
  const limpio = nombre.trim().toLowerCase();
  return CATALOGO_SERVICIOS.find((s) => s.nombre.trim().toLowerCase() === limpio)
    ?.imagenCuadrada;
}
