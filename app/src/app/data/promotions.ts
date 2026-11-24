// Configuración de las promociones del Home.
//
// Tipada y separada del componente visual (el carrusel no conoce IDs de
// servicios: recibe esta configuración y delega la navegación en
// lib/navegacion.ts).
//
// FIXTURES: el mapeo definitivo promoción a servicio está PENDIENTE de
// confirmación del Product Owner (MIPRO-1472). Estas entradas son valores de
// prueba: usan las categorías de servicio que ya existen en la app y las
// mismas imágenes de demostración del mock de proyectos. Ningún dato de acá
// es productivo. `servicioDestino` apunta a ids del catálogo de demostración
// (data/catalogo.ts); el mapeo definitivo sigue PENDIENTE del PO.
//
// ESCENARIOS DE DEMO (vía query del hash):
//   #/?promos=error | cargando | sin | una | larga

import { PromocionConfig, ordenarPromociones } from "../logic/promociones";

export type EscenarioPromos = "ok" | "error" | "cargando" | "sin" | "una" | "larga";

const LATENCIA_MS = 350;

export const PROMOCIONES_FIXTURE: PromocionConfig[] = [
  {
    id: "fixture-pintura-interior",
    imagen:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    descripcion: "Rodillo aplicando pintura clara sobre una pared interior",
    titulo: "Pintura interior",
    beneficio: "Renueva tus espacios",
    detalle: "Renueva tus espacios con profesionales.",
    servicioDestino: "pintura-interior",
    orden: 1,
  },
  {
    id: "fixture-revision-electrica",
    imagen:
      "https://images.unsplash.com/photo-1767514536570-83d70c024247?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    descripcion: "Electricista revisando el cableado de una instalación doméstica",
    titulo: "Revisión eléctrica",
    beneficio: "Diagnóstico completo",
    detalle: "Diagnóstico completo de tu instalación.",
    servicioDestino: "revision-electrica",
    orden: 2,
  },
  {
    id: "fixture-renovacion-bano",
    imagen:
      "https://images.unsplash.com/photo-1758448018619-4cbe2250b9ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    descripcion: "Baño moderno renovado con griferías y muebles nuevos",
    titulo: "Renovación de baño",
    beneficio: "Plomería y acabados",
    detalle: "Plomería y acabados en un solo servicio.",
    servicioDestino: "renovacion-bano",
    orden: 3,
  },
  {
    id: "fixture-remodelacion-cocina",
    imagen:
      "https://images.unsplash.com/photo-1708915965975-2a950db0e215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    descripcion: "Cocina en remodelación con gabinetes y cubierta de granito",
    titulo: "Remodelación de cocina",
    beneficio: "Cotiza tu remodelación",
    detalle: "Cotiza el cambio de gabinetes y superficies.",
    servicioDestino: "remodelacion-cocina",
    orden: 4,
  },
];

// FIXTURE de QA: título y descripción largos, para validar que la card no
// trunca ni desborda. Solo aparece con el escenario "larga".
const PROMO_LARGA_FIXTURE: PromocionConfig = {
  id: "fixture-qa-titulo-largo",
  imagen:
    "https://images.unsplash.com/photo-1708915965975-2a950db0e215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  descripcion: "Cocina en remodelación con gabinetes y cubierta de granito",
  titulo: "Mantenimiento preventivo de aire acondicionado",
  beneficio: "Para que enfríe como el primer día",
  detalle: "Limpieza completa del equipo para que enfríe como el primer día.",
  servicioDestino: null,
  orden: 1,
};

export function leerEscenarioPromos(search: string): EscenarioPromos {
  const crudo = new URLSearchParams(search).get("promos");
  return crudo === "error" || crudo === "cargando" || crudo === "sin" || crudo === "una" || crudo === "larga"
    ? crudo
    : "ok";
}

export function cargarPromociones(
  escenario: EscenarioPromos,
): Promise<PromocionConfig[]> {
  return new Promise((resolve, reject) => {
    if (escenario === "cargando") return; // nunca resuelve: para revisar skeletons

    setTimeout(() => {
      if (escenario === "error") reject(new Error("No se pudieron cargar las promociones"));
      else if (escenario === "sin") resolve([]);
      else if (escenario === "una") resolve(ordenarPromociones(PROMOCIONES_FIXTURE).slice(0, 1));
      else if (escenario === "larga") resolve([PROMO_LARGA_FIXTURE]);
      else resolve(ordenarPromociones(PROMOCIONES_FIXTURE));
    }, LATENCIA_MS);
  });
}
