// Catálogo de servicios del hogar (MIPRO-1471).
//
// FIXTURES de demostración: servicios construidos con el vocabulario que ya
// existe en la app (categorías de productos y proyectos). Los PRECIOS y las
// marcas de inspección son valores de prueba para cumplir la estructura de
// HU-01 (precio "Desde", inspección): la definición productiva es del
// negocio (PIM). Las palabras clave permiten búsquedas cotidianas
// ("el aire no enfría", "tengo una fuga").

import { Wind, Zap, Droplets, Hammer, Flame, Fan, Paintbrush, Bug, Sparkles, Armchair, Leaf, Truck, Wrench, Settings, LucideIcon } from "lucide-react";
import { PRECIO_BASE_REFERENCIAL_USD, ServicioCatalogo } from "../logic/catalogo";
import { DEPARTAMENTO_MIPRO } from "./catalogoMipro";
import { idDeArticulo, subcategoriasVisibles } from "../logic/catalogoMipro";
import { fotoDeSubcategoria } from "./fotosServicios";

export interface ServicioCatalogoUI extends ServicioCatalogo {
  icono: LucideIcon;
  /** true cuando el contenido de "Qué incluye" está confirmado (PDF). */
  incluyeConfirmado?: boolean;
  /** Fotografía apaisada: cabecera del detalle y tarjeta del Home (2.2:1). */
  imagen?: string;
  /**
   * Fotografía cuadrada, para la miniatura de 64 px del listado.
   *
   * Es un archivo distinto y no la misma foto recortada: a 64 px, recortar
   * una apaisada al cuadrado se come los costados, que es justo donde está
   * lo que se reconoce.
   */
  imagenCuadrada?: string;
  imagenAlt?: string;
  /** true cuando la foto NO es de este servicio sino de su categoría: se usa
   * como referencia mientras el PIM no cargue la propia, y la pantalla lo
   * dice. Nunca se presenta una foto prestada como si fuera del servicio. */
  imagenProvisional?: boolean;
  /** true cuando la descripción es un texto armado por la app a falta del
   * definitivo. La pantalla lo identifica como provisional. */
  descripcionProvisional?: boolean;
}

export const CATALOGO_SERVICIOS: ServicioCatalogoUI[] = [
  {
    id: "mantenimiento-aire",
    imagen: "https://images.unsplash.com/photo-1718203862467-c33159fdc504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Unidad exterior de aire acondicionado instalada en una pared",
    nombre: "Mantenimiento de aire acondicionado",
    categoria: "Mantenimiento",
    descripcion: "Limpieza y revisión preventiva para que tu equipo enfríe como el primer día.",
    incluye: ["Limpieza de filtros y serpentines", "Revisión de gas refrigerante", "Prueba de funcionamiento"],
    palabrasClave: ["enfria", "frio", "gotea", "clima", "split", "aire"],
    precioDesde: 45,
    icono: Wind,
  },
  {
    id: "instalacion-aire",
    imagen: "https://images.unsplash.com/photo-1718203862467-c33159fdc504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Unidad exterior de aire acondicionado instalada en una pared",
    nombre: "Instalación de aire acondicionado",
    categoria: "Instalación",
    descripcion: "Instalación completa del equipo, con revisión inicial y prueba final.",
    incluye: ["Inspección del espacio", "Montaje e instalación", "Prueba de funcionamiento"],
    palabrasClave: ["clima", "split", "aire"],
    precioDesde: 175,
    requiereInspeccion: true,
    icono: Wind,
  },
  {
    id: "limpieza-ductos",
    imagen: "https://images.unsplash.com/photo-1615309662243-70f6df917b59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Ductos y tuberías de ventilación de un hogar",
    nombre: "Limpieza de ductos",
    categoria: "Limpieza",
    descripcion: "Limpieza profunda de los ductos de ventilación de tu hogar.",
    incluye: ["Inspección de ductos", "Limpieza y desinfección", "Informe del estado"],
    palabrasClave: ["polvo", "olor", "ventilacion", "limpieza"],
    precioDesde: 120,
    icono: Fan,
  },
  {
    id: "pintura-interior",
    imagen: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Rodillo aplicando pintura clara sobre una pared interior",
    nombre: "Pintura interior",
    categoria: "Pintura",
    descripcion: "Renueva tus espacios con profesionales certificados.",
    incluye: ["Preparación de superficies", "Dos capas de pintura", "Limpieza final del área"],
    palabrasClave: ["pintar", "pared", "paredes", "color", "mancha", "humedad"],
    precioDesde: 90,
    icono: Paintbrush,
  },
  {
    id: "revision-electrica",
    imagen: "https://images.unsplash.com/photo-1767514536570-83d70c024247?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Electricista revisando el cableado de una instalación",
    nombre: "Revisión eléctrica",
    categoria: "Reparación",
    descripcion: "Diagnóstico completo de la instalación eléctrica de tu hogar.",
    incluye: ["Revisión del tablero", "Prueba de tomas y circuitos", "Informe con recomendaciones"],
    palabrasClave: ["luz", "corriente", "breaker", "apagones", "electricidad", "chispas"],
    precioDesde: 60,
    icono: Zap,
  },
  {
    id: "instalacion-electrica",
    imagen: "https://images.unsplash.com/photo-1767514536570-83d70c024247?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Electricista trabajando sobre una instalación doméstica",
    nombre: "Instalación eléctrica",
    categoria: "Instalación",
    descripcion: "Instalación de cableado, tomas y puntos de luz nuevos.",
    incluye: ["Visita de diagnóstico", "Instalación del cableado", "Prueba de funcionamiento"],
    palabrasClave: ["tomas", "enchufes", "cableado", "lampara", "electricidad", "luz"],
    requiereInspeccion: true,
    icono: Zap,
  },
  {
    id: "renovacion-bano",
    inspeccionObligatoria: true,
    imagen: "https://images.unsplash.com/photo-1758448018619-4cbe2250b9ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Baño moderno renovado con griferías nuevas",
    nombre: "Renovación de baño",
    categoria: "Instalación",
    descripcion: "Plomería y acabados en un solo servicio.",
    incluye: ["Revisión de tuberías", "Instalación de muebles y griferías", "Acabados finales"],
    palabrasClave: ["bano", "ducha", "inodoro", "griferia"],
    requiereInspeccion: true,
    icono: Droplets,
  },
  {
    id: "revision-plomeria",
    imagen: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Grifería de bañera con conexiones de plomería",
    nombre: "Revisión de plomería",
    categoria: "Reparación",
    descripcion: "Diagnóstico y reparación de fugas, tuberías y desagües.",
    incluye: ["Inspección general", "Detección de fugas", "Informe con recomendaciones"],
    palabrasClave: ["fuga", "gotea", "tuberia", "agua", "desague", "filtracion", "plomero"],
    icono: Droplets,
  },
  {
    id: "remodelacion-cocina",
    inspeccionObligatoria: true,
    imagen: "https://images.unsplash.com/photo-1708915965975-2a950db0e215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Cocina en remodelación con gabinetes y granito",
    nombre: "Remodelación de cocina",
    categoria: "Instalación",
    descripcion: "Cotiza el cambio de gabinetes y superficies.",
    incluye: ["Visita de medición", "Propuesta de trabajo", "Instalación completa"],
    palabrasClave: ["gabinetes", "granito", "cocina", "mueble"],
    requiereInspeccion: true,
    icono: Hammer,
  },
  {
    id: "mantenimiento-calentador",
    imagen: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Conexiones y tuberías de gas de un calentador",
    nombre: "Mantenimiento de calentador",
    categoria: "Mantenimiento",
    descripcion: "Revisión y limpieza para un funcionamiento seguro.",
    incluye: ["Revisión de conexiones", "Limpieza del equipo", "Prueba de funcionamiento"],
    palabrasClave: ["caliente", "gas", "calentador", "agua"],
    icono: Flame,
  },
  // ── Instalaciones de línea blanca (fuente: PDF "Información de servicios
  // de MiPRO", hoja Línea Blanca; precios del documento). Estos servicios
  // tienen cuestionario en el paso "Revisar el lugar". ──
  {
    id: "instalacion-secadora-gas",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Secadoras de ropa alineadas en un cuarto de lavado",
    nombre: "Instalación de secadora a gas",
    categoria: "Instalación",
    descripcion: "Incluye el ducto de desfogue, la manguera de gas y los acoples.",
    incluye: ["Ducto de desfogue", "Manguera de gas y acoples", "Prueba de funcionamiento"],
    palabrasClave: ["secadora", "gas", "ropa", "secar"],
    precioDesde: 110,
    requiereInspeccion: true,
    icono: Fan,
  },
  {
    id: "instalacion-secadora-electrica",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Tambor de una secadora de ropa con prendas",
    nombre: "Instalación de secadora eléctrica",
    categoria: "Instalación",
    descripcion: "Incluye el cable para conectar la secadora al enchufe.",
    incluye: ["Cable de conexión", "Instalación de la secadora", "Prueba de funcionamiento"],
    palabrasClave: ["secadora", "ropa", "secar"],
    precioDesde: 140,
    requiereInspeccion: true,
    icono: Fan,
  },
  {
    id: "instalacion-lavadora",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Lavadora blanca instalada en un cuarto de lavandería",
    nombre: "Instalación de lavadora",
    categoria: "Instalación",
    descripcion: "Conexión de la lavadora al agua y al desagüe.",
    incluye: ["Conexión al agua", "Conexión al desagüe", "Prueba de funcionamiento"],
    palabrasClave: ["lavadora", "ropa", "lavar", "agua"],
    precioDesde: 45,
    requiereInspeccion: true,
    icono: Droplets,
  },
  {
    id: "instalacion-estufa-gas",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1607324772107-8ad6740ca195?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Hornilla de estufa a gas encendida con llama azul",
    nombre: "Instalación de estufa a gas",
    categoria: "Instalación",
    descripcion: "Incluye la manguera y el acople de gas.",
    incluye: ["Manguera y acople", "Instalación de la estufa", "Prueba de funcionamiento"],
    palabrasClave: ["estufa", "gas", "cocina", "cocinar"],
    precioDesde: 90,
    requiereInspeccion: true,
    icono: Flame,
  },
  {
    id: "instalacion-estufa-electrica",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Cocina blanca con estufa y horno instalados",
    nombre: "Instalación de estufa eléctrica",
    categoria: "Instalación",
    descripcion: "Instalación y conexión de la estufa eléctrica.",
    incluye: ["Conexión eléctrica", "Instalación de la estufa", "Prueba de funcionamiento"],
    palabrasClave: ["estufa", "cocina", "cocinar"],
    precioDesde: 95,
    requiereInspeccion: true,
    icono: Flame,
  },
  {
    id: "instalacion-estufa-empotrable-gas",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1607324772107-8ad6740ca195?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Hornilla de estufa a gas encendida con llama azul",
    nombre: "Instalación de estufa empotrable a gas",
    categoria: "Instalación",
    descripcion: "Instalación de la estufa encajada en el tope, con manguera y acople.",
    incluye: ["Manguera y acople", "Instalación en el tope", "Prueba de funcionamiento"],
    palabrasClave: ["estufa", "empotrable", "tope", "cocina"],
    precioDesde: 95,
    requiereInspeccion: true,
    icono: Flame,
  },
  {
    id: "instalacion-horno-empotrable",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1639405069836-f82aa6dcb900?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Cocina moderna con horno doble empotrado",
    nombre: "Instalación de horno empotrable a gas",
    categoria: "Instalación",
    descripcion: "Instalación del horno en el mueble de cocina.",
    incluye: ["Instalación en el mueble", "Conexión de gas", "Prueba de funcionamiento"],
    palabrasClave: ["horno", "empotrable", "cocina", "hornear"],
    precioDesde: 95,
    requiereInspeccion: true,
    icono: Flame,
  },
  {
    id: "instalacion-lavavajillas",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1620568400263-6f1cf95b9e30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Lavavajillas abierto con vajilla en la bandeja",
    nombre: "Instalación de lavavajillas",
    categoria: "Instalación",
    descripcion: "Incluye la trampa y la manguera de conexión.",
    incluye: ["Trampa y manguera", "Conexión al fregador", "Prueba de funcionamiento"],
    palabrasClave: ["lavavajillas", "platos", "fregador", "cocina"],
    precioDesde: 140,
    requiereInspeccion: true,
    icono: Droplets,
  },
  {
    id: "instalacion-refrigeradora-french",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Refrigeradora instalada en la cocina de un hogar",
    nombre: "Instalación de refrigeradora French Door",
    categoria: "Instalación",
    descripcion: "Incluye tablillas, bandejas, ice maker y la tubería de agua.",
    incluye: ["Tablillas y bandejas", "Conexión del ice maker al agua", "Prueba de funcionamiento"],
    palabrasClave: ["refrigeradora", "nevera", "french", "hielo"],
    precioDesde: 200,
    requiereInspeccion: true,
    icono: Wind,
  },
  {
    id: "instalacion-vinera",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1728177196098-ef48bfb63832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Vinera con botellas refrigeradas",
    nombre: "Instalación de vinera",
    categoria: "Instalación",
    descripcion: "Instalación completa de la vinera.",
    incluye: ["Ubicación y nivelación", "Conexión eléctrica", "Prueba de funcionamiento"],
    palabrasClave: ["vinera", "vino", "nevera"],
    precioDesde: 25,
    requiereInspeccion: true,
    icono: Wind,
  },
  {
    id: "instalacion-calentador-electrico",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Baño con ducha de agua caliente",
    nombre: "Instalación de calentador eléctrico de paso",
    categoria: "Instalación",
    descripcion: "Incluye ducto de desfogue, mangueras de agua y acoples.",
    incluye: ["Ducto de desfogue", "Mangueras de agua fría y caliente", "Prueba de funcionamiento"],
    palabrasClave: ["calentador", "agua", "caliente", "ducha"],
    precioDesde: 156,
    requiereInspeccion: true,
    icono: Flame,
  },
  {
    id: "instalacion-calentador-gas",
    incluyeConfirmado: true,
    imagen: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Conexiones y tuberías de gas de un calentador",
    nombre: "Instalación de calentador a gas de paso",
    categoria: "Instalación",
    descripcion: "Incluye ducto de desfogue, mangueras de agua, manguera de gas y acoples.",
    incluye: ["Ducto de desfogue", "Manguera especial de gas", "Mangueras de agua fría y caliente"],
    palabrasClave: ["calentador", "gas", "agua", "caliente", "ducha"],
    precioDesde: 156,
    requiereInspeccion: true,
    icono: Flame,
  },
  {
    id: "fumigacion-hogar",
    nombre: "Fumigación del hogar",
    categoria: "Fumigación",
    descripcion: "Tratamiento contra insectos y plagas en toda la casa.",
    incluye: [],
    palabrasClave: ["cucarachas", "hormigas", "plagas", "insectos", "fumigar", "bichos"],
    precioDesde: 60,
    imagen: "https://images.unsplash.com/photo-1593999094742-4f5280054b23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Técnico aplicando tratamiento de fumigación con equipo de aspersión",
    icono: Bug,
  },
  {
    id: "limpieza-profunda",
    nombre: "Limpieza profunda del hogar",
    categoria: "Limpieza",
    descripcion: "Limpieza completa de la casa, habitación por habitación.",
    incluye: [],
    palabrasClave: ["limpiar", "limpieza", "aseo", "profunda"],
    precioDesde: 85,
    imagen: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Persona limpiando una ventana con guantes",
    icono: Sparkles,
  },
  {
    id: "armado-muebles",
    nombre: "Armado de muebles",
    categoria: "Mobiliario",
    descripcion: "Armamos tus muebles nuevos y los dejamos firmes y listos.",
    incluye: [],
    palabrasClave: ["mueble", "armar", "ropero", "estante", "escritorio"],
    precioDesde: 45,
    imagen: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Sala con muebles armados",
    icono: Armchair,
  },
  {
    id: "mantenimiento-jardin",
    nombre: "Mantenimiento de jardín",
    categoria: "Jardinería",
    descripcion: "Corte de césped, poda y limpieza del jardín.",
    incluye: [],
    palabrasClave: ["jardin", "cesped", "pasto", "poda", "plantas"],
    precioDesde: 50,
    imagen: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Herramientas de jardinería con tierra y plantas",
    icono: Leaf,
  },
  {
    id: "mudanza-local",
    nombre: "Mudanza dentro de la ciudad",
    categoria: "Mudanza",
    descripcion: "Trasladamos tus cosas con cuidado, de puerta a puerta.",
    incluye: [],
    palabrasClave: ["mudanza", "mudarme", "traslado", "cajas", "flete"],
    precioDesde: 120,
    precioCotizable: true,
    imagen: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imagenAlt: "Camión de mudanza siendo cargado con cajas",
    icono: Truck,
  },
];

// Destacados del Home: CONFIGURACIÓN LOCAL DEL MVP, centralizada y tipada.
// Cómo se eligen (más contratados, negocio, estacionales) está PENDIENTE de
// producto; esta selección demo cubre categorías distintas.
export const DESTACADOS_HOME: string[] = [
  "instalacion-aire",
  "instalacion-electrica",
  "pintura-interior",
  "limpieza-ductos",
];

export function serviciosDestacados(): ServicioCatalogoUI[] {
  return DESTACADOS_HOME
    .map((id) => CATALOGO_SERVICIOS.find((s) => s.id === id))
    .filter(Boolean) as ServicioCatalogoUI[];
}

// ── Las fotos del cliente en los servicios enriquecidos ────────────────
//
// Los servicios de arriba son fixtures anteriores a la entrega de fotos y
// traían imágenes de stock. Donde la correspondencia con una subcategoría
// real es inequívoca, se reemplazan por la foto del cliente: así el Home,
// los destacados y los servicios ya creados muestran lo mismo que el
// catálogo.
//
// Los que NO están acá se quedan con su imagen de stock a propósito: no
// tienen una subcategoría que les corresponda (limpieza de ductos,
// renovación de baño, remodelación de cocina, limpieza profunda y
// mantenimiento de jardín) y ponerles la foto de otra sería mentir sobre
// qué servicio es.
const SUBCATEGORIA_DEL_FIXTURE: Record<string, string> = {
  // Todos estos son artículos de "Instalación de línea blanca".
  "instalacion-aire": "instalacion-de-linea-blanca",
  "instalacion-secadora-gas": "instalacion-de-linea-blanca",
  "instalacion-secadora-electrica": "instalacion-de-linea-blanca",
  "instalacion-lavadora": "instalacion-de-linea-blanca",
  "instalacion-estufa-gas": "instalacion-de-linea-blanca",
  "instalacion-estufa-electrica": "instalacion-de-linea-blanca",
  "instalacion-estufa-empotrable-gas": "instalacion-de-linea-blanca",
  "instalacion-horno-empotrable": "instalacion-de-linea-blanca",
  "instalacion-lavavajillas": "instalacion-de-linea-blanca",
  "instalacion-refrigeradora-french": "instalacion-de-linea-blanca",
  "instalacion-vinera": "instalacion-de-linea-blanca",
  "instalacion-calentador-electrico": "instalacion-de-linea-blanca",
  "instalacion-calentador-gas": "instalacion-de-linea-blanca",
  "mantenimiento-aire": "mantenimiento-de-aire-acondicionado",
  "mantenimiento-calentador": "mantenimiento-de-electrodomesticos",
  "instalacion-electrica": "instalacion-electrica",
  "revision-electrica": "instalacion-electrica",
  "revision-plomeria": "reparacion-de-plomeria-y-filtraciones",
  "fumigacion-hogar": "fumigacion-residencial",
  "pintura-interior": "pintura-de-paredes-residenciales",
  "mudanza-local": "mudanza-local",
  // Genérico de Mobiliario: es también el respaldo de toda la categoría.
  "armado-muebles": "armado-de-mesas-y-muebles-auxiliares",
};

for (const servicio of CATALOGO_SERVICIOS) {
  const foto = fotoDeSubcategoria(SUBCATEGORIA_DEL_FIXTURE[servicio.id]);
  if (!foto) continue;
  servicio.imagen = foto.ancha;
  servicio.imagenCuadrada = foto.cuadrada;
  servicio.imagenAlt = `${servicio.nombre}, servicio de ${servicio.categoria.toLowerCase()}`;
  servicio.imagenProvisional = undefined;
}

// ── Contenido de respaldo de las fichas ────────────────────────────────
//
// El PIM todavía no tiene foto ni descripción propia para la mayoría de los
// SKUs. En vez de dejar fichas a medias (unas con imagen y texto, otras con
// un ícono suelto y nada más), toda ficha se completa: la foto sale de un
// servicio YA CARGADO de la misma categoría y la descripción se arma con el
// nombre del servicio y su subcategoría.
//
// Las dos cosas viajan marcadas como provisionales y la pantalla lo dice.
// Es contenido de relleno identificado, no contenido inventado que se haga
// pasar por definitivo.

/** Primera foto disponible de cada categoría, tomada de los servicios que
 * sí la tienen cargada. Se calcula una vez al levantar el módulo. */
const RESPALDO_POR_CATEGORIA: Record<string, { imagen: string; imagenAlt: string }> = (() => {
  const mapa: Record<string, { imagen: string; imagenAlt: string }> = {};
  for (const s of CATALOGO_SERVICIOS) {
    if (s.imagen && !mapa[s.categoria]) {
      mapa[s.categoria] = { imagen: s.imagen, imagenAlt: s.imagenAlt ?? "" };
    }
  }
  return mapa;
})();

/**
 * Descripción provisional: dice QUÉ es el servicio, con el nombre real y su
 * lugar en el catálogo, y nada más. No promete alcance, ni tiempos, ni qué
 * incluye: eso es del negocio y todavía no está definido.
 */
export function descripcionProvisional(
  nombre: string,
  categoria: string,
  subcategoria?: string,
): string {
  const donde = subcategoria ? subcategoria.toLowerCase() : categoria.toLowerCase();
  return `Servicio de ${nombre.toLowerCase()}, dentro de ${donde}. Un técnico de MiPRO lo realiza en tu hogar.`;
}

/** Icono representativo de cada categoría de la taxonomía. */
export const ICONO_CATEGORIA: Record<string, LucideIcon> = {
  "Instalación": Wrench,
  "Mantenimiento": Settings,
  "Reparación": Hammer,
  "Fumigación": Bug,
  "Limpieza": Sparkles,
  "Pintura": Paintbrush,
  "Mobiliario": Armchair,
  "Jardinería": Leaf,
  "Mudanza": Truck,
};

// ── Servicios derivados de la jerarquía real (Departamento → Categoría →
// Subcategoría → Artículo/SKU de los documentos del negocio) ──
//
// Cada artículo se presenta como un servicio de la app. Cuando el artículo
// está vinculado a un servicio enriquecido de arriba (servicioId), hereda su
// foto, su "qué incluye" confirmado y sus palabras clave; el nombre, el
// precio y la matriz de evaluación SIEMPRE vienen del documento.

function construirServiciosMipro(): ServicioCatalogoUI[] {
  const servicios: ServicioCatalogoUI[] = [];
  for (const categoria of DEPARTAMENTO_MIPRO.categorias) {
    const iconoCategoria = ICONO_CATEGORIA[categoria.nombre] ?? Wrench;
    for (const sub of subcategoriasVisibles(categoria)) {
      const foto = fotoDeSubcategoria(sub.id);
      for (const articulo of sub.articulos) {
        const base = articulo.servicioId
          ? CATALOGO_SERVICIOS.find((s) => s.id === articulo.servicioId)
          : undefined;
        const precioPim = articulo.precio ?? base?.precioDesde;
        servicios.push({
          id: idDeArticulo(articulo),
          nombre: articulo.nombre,
          categoria: categoria.nombre,
          subcategoria: sub.nombre,
          sku: articulo.sku,
          descripcion:
            base?.descripcion ??
            descripcionProvisional(articulo.nombre, categoria.nombre, sub.nombre),
          descripcionProvisional: base?.descripcion === undefined,
          incluye: base?.incluye ?? [],
          incluyeConfirmado: base?.incluyeConfirmado,
          palabrasClave: base?.palabrasClave,
          // Todos los SKUs muestran precio (criterio de negocio): sin monto
          // confirmado del PIM, cae al precio base referencial.
          precioDesde: precioPim ?? PRECIO_BASE_REFERENCIAL_USD,
          precioConfirmado: precioPim !== undefined,
          unidad: articulo.unidad,
          requiereInspeccion: articulo.evaluacion !== "nunca",
          inspeccionObligatoria: articulo.evaluacion === "obligatoria",
          precioCotizable: base?.precioCotizable,
          // La foto de la SUBCATEGORÍA manda: es la que entregó el cliente
          // y es el nivel en el que el negocio las define. Recién si esa
          // subcategoría todavía no tiene foto se cae al servicio
          // enriquecido y, por último, al respaldo de la categoría, que sí
          // es prestado y por eso se marca provisional.
          imagen: foto?.ancha ?? base?.imagen ?? RESPALDO_POR_CATEGORIA[categoria.nombre]?.imagen,
          imagenCuadrada: foto?.cuadrada,
          imagenAlt: foto
            ? `${sub.nombre}, servicio de ${categoria.nombre.toLowerCase()}`
            : (base?.imagenAlt ?? RESPALDO_POR_CATEGORIA[categoria.nombre]?.imagenAlt),
          imagenProvisional:
            foto === null &&
            base?.imagen === undefined &&
            RESPALDO_POR_CATEGORIA[categoria.nombre] !== undefined,
          icono: base?.icono ?? iconoCategoria,
        });
      }
    }
  }
  return servicios;
}

/** Catálogo navegable de la app: los artículos/SKUs de los documentos. */
export const SERVICIOS_MIPRO: ServicioCatalogoUI[] = construirServiciosMipro();

export function buscarServicioCatalogo(id: string): ServicioCatalogoUI | null {
  // Primero la jerarquía real; los fixtures quedan como respaldo para los
  // accesos existentes (destacados del Home, servicios ya creados).
  return (
    SERVICIOS_MIPRO.find((s) => s.id === id) ??
    CATALOGO_SERVICIOS.find((s) => s.id === id) ??
    null
  );
}

// ── Carga de destacados con estados (para revisión y QA) ──
// ESCENARIOS DE DEMO (vía query del hash): #/?destacados=error | cargando | sin

export type EscenarioDestacados = "ok" | "error" | "cargando" | "sin";

export function leerEscenarioDestacados(search: string): EscenarioDestacados {
  const crudo = new URLSearchParams(search).get("destacados");
  return crudo === "error" || crudo === "cargando" || crudo === "sin"
    ? crudo
    : "ok";
}

export function cargarDestacados(
  escenario: EscenarioDestacados,
): Promise<ServicioCatalogoUI[]> {
  return new Promise((resolve, reject) => {
    if (escenario === "cargando") return; // nunca resuelve: para revisar skeletons

    setTimeout(() => {
      if (escenario === "error") reject(new Error("No se pudieron cargar los destacados"));
      else if (escenario === "sin") resolve([]);
      else resolve(serviciosDestacados());
    }, 250);
  });
}

