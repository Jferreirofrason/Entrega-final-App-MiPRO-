// Costuras de navegación del Home.
//
// Centralizan los destinos para que los componentes visuales no conozcan
// rutas ni IDs. Devuelven `true` si navegaron y `false` si el destino todavía
// no existe (el llamador muestra el aviso correspondiente).
//
// RUTAS CONECTADAS:
// - MIPRO-1471: catálogo de servicios en /catalogo (la búsqueda viaja como ?q=).
// - MIPRO-1472: detalle de servicio del catálogo en /catalogo/:id.
// - Listado completo de solicitudes: /historial, recortado a Servicios.
//   (La pantalla "Mis Citas" se retiró: era una segunda lista de lo mismo.)

import type { NavigateFunction } from "react-router";
import { normalizarTermino, esTerminoBuscable } from "../logic/busqueda";
import type { PromocionConfig } from "../logic/promociones";

export const RUTAS = {
  listadoCitas: "/historial?tipo=servicios",
  catalogoServicios: "/catalogo" as string | null, // MIPRO-1471
  detalleServicio: ((servicioDestino: string) =>
    `/catalogo/${servicioDestino}`) as ((servicioDestino: string) => string) | null, // MIPRO-1472
};

export function irAlListadoDeCitas(navigate: NavigateFunction): boolean {
  navigate(RUTAS.listadoCitas);
  return true;
}

/**
 * Búsqueda del Home: navega al catálogo con el término aplicado (MIPRO-1471).
 * Contrato previsto: `${RUTAS.catalogoServicios}?q=<término normalizado>`.
 */
export function buscarServicios(
  navigate: NavigateFunction,
  termino: string,
): boolean {
  if (!esTerminoBuscable(termino)) return false;
  if (!RUTAS.catalogoServicios) return false;
  const q = encodeURIComponent(normalizarTermino(termino));
  navigate(`${RUTAS.catalogoServicios}?q=${q}`);
  return true;
}

/** "Agendar servicio" del estado vacío: mismo destino que la búsqueda. */
export function irAlCatalogo(navigate: NavigateFunction): boolean {
  if (!RUTAS.catalogoServicios) return false;
  navigate(RUTAS.catalogoServicios);
  return true;
}

/** Tap en una promoción: detalle del servicio asociado (MIPRO-1472). */
export function abrirPromocion(
  navigate: NavigateFunction,
  promo: PromocionConfig,
): boolean {
  if (!promo.servicioDestino || !RUTAS.detalleServicio) return false;
  navigate(RUTAS.detalleServicio(promo.servicioDestino));
  return true;
}
