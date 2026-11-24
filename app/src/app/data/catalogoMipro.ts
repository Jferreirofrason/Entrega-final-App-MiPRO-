// Jerarquía REAL del catálogo: Departamento → Categoría → Subcategoría →
// Artículo/SKU, construida desde los documentos fuente del negocio:
//
// - "MiPRO - Catalogo de servicios v2" (nombres de cara al cliente y SKUs).
// - "SKU PRECIOS_PIM" (precio por SKU y marca "Inspección" = evaluación
//   obligatoria; sus 9 subcategorías agrupan Instalación, con "Otros
//   servicios de instalación" como residual definido por la data).
// - "Información de servicios de MiPRO" hoja Línea Blanca (matriz de
//   preguntas por SKU: los artículos "depende" apuntan a su cuestionario).
//
// Reglas aplicadas (decisiones de la sesión de producto):
// - "MiPRO/Servicios" es el departamento (capa de datos): NO es una pantalla.
// - Muebles RTA queda asociado a la categoría Mobiliario, no a Instalación
//   (las categorías internas de precio Y055 no se muestran como servicios).
// - Sin precio en el PIM → "Precio a cotizar" (no se inventan montos). La
//   única excepción documentada es Lavaseca ($85, PDF de servicios).
// - Pintura vive en su categoría propia (sus SKUs no se repiten en Otros).
// - Jardinería y Mudanza no existen en los documentos: quedan como MOCK
//   configurable (marcado abajo) hasta que el negocio cargue su data.
//
// Este archivo se regenera desde los documentos; la matriz de evaluación
// (Obligatoria/Depende/Nunca) viaja en cada artículo.

export type EvaluacionArticulo = "obligatoria" | "depende" | "nunca";

export interface ArticuloCatalogo {
  nombre: string;
  /** SKU del PIM; ausente en artículos aún sin código asignado. */
  sku?: string;
  /** Precio del PIM en USD; ausente = "Precio a cotizar". */
  precio?: number;
  /** Matriz de inspección: obligatoria (directo a evaluación), depende
   * (preguntas del SKU) o nunca (directo a configuración). */
  evaluacion: EvaluacionArticulo;
  /** Cuestionario de "Revisar el lugar" cuando la evaluación depende. */
  cuestionarioId?: string;
  /** Servicio enriquecido existente (foto y "qué incluye" confirmados). */
  servicioId?: string;
  /** Unidad de cobro cuando el PIM la explicita (hoy, "m²"). */
  unidad?: string;
}

export interface SubcategoriaCatalogo {
  id: string;
  nombre: string;
  articulos: ArticuloCatalogo[];
}

export interface CategoriaCatalogo {
  nombre: string;
  subcategorias: SubcategoriaCatalogo[];
}

export interface DepartamentoCatalogo {
  nombre: string;
  categorias: CategoriaCatalogo[];
}

const CATEGORIAS_DOCUMENTADAS: CategoriaCatalogo[] = [
  {
    nombre: "Instalación",
    subcategorias: [
      {
        id: "instalacion-de-linea-blanca",
        nombre: "Instalación de línea blanca",
        articulos: [
          { nombre: "Aire acondicionado de 18,000 - 24,000 BTU", sku: "Y051-000044", precio: 140, evaluacion: "depende", cuestionarioId: "instalacion-aire" },
          { nombre: "Aire acondicionado de 36,000 BTU", sku: "Y051-000042", precio: 350, evaluacion: "depende", cuestionarioId: "instalacion-aire" },
          { nombre: "Aire acondicionado de 9,000 - 12,000 BTU", sku: "Y051-000036", precio: 120, evaluacion: "depende", cuestionarioId: "instalacion-aire", servicioId: "instalacion-aire" },
          { nombre: "Aire acondicionado de ventana", sku: "Y051-000019", precio: 100, evaluacion: "depende", cuestionarioId: "instalacion-aire-ventana" },
          { nombre: "Aire acondicionado en edificio", sku: "Y051-000008", evaluacion: "obligatoria" },
          { nombre: "Aire acondicionado Panasonic de 18,000 - 24,000 BTU", sku: "Y051-000032", precio: 200, evaluacion: "depende", cuestionarioId: "instalacion-aire" },
          { nombre: "Aire acondicionado Panasonic de 36,000 BTU", sku: "Y051-000024", precio: 440, evaluacion: "depende", cuestionarioId: "instalacion-aire" },
          { nombre: "Aire acondicionado Panasonic de 9,000 - 12,000 BTU", sku: "Y051-000007", precio: 180, evaluacion: "depende", cuestionarioId: "instalacion-aire" },
          { nombre: "Calentadores a gas de paso", sku: "Y051-000040", precio: 156, evaluacion: "depende", cuestionarioId: "instalacion-calentador-gas", servicioId: "instalacion-calentador-gas" },
          { nombre: "Calentadores a gas tipo tanque", sku: "Y051-000002", precio: 250, evaluacion: "depende", cuestionarioId: "instalacion-calentador-gas" },
          { nombre: "Calentadores eléctricos de paso", sku: "Y051-000003", precio: 156, evaluacion: "depende", cuestionarioId: "instalacion-calentador-electrico", servicioId: "instalacion-calentador-electrico" },
          { nombre: "Calentadores eléctricos tipo tanque", sku: "Y051-000029", precio: 250, evaluacion: "depende", cuestionarioId: "instalacion-calentador-electrico" },
          { nombre: "Centro de lavado a gas de paso", sku: "Y051-000034", precio: 112.5, evaluacion: "depende", cuestionarioId: "instalacion-centro-lavado-gas" },
          { nombre: "Centro de lavado eléctrico", sku: "Y051-000010", precio: 145, evaluacion: "depende", cuestionarioId: "instalacion-centro-lavado-electrico" },
          { nombre: "Conectar Ice Maker", sku: "Y051-000026", precio: 90, evaluacion: "depende", cuestionarioId: "instalacion-ice-maker" },
          { nombre: "Conectar Ice Maker con filtro externo", sku: "Y051-000009", precio: 105, evaluacion: "depende", cuestionarioId: "instalacion-ice-maker" },
          { nombre: "Congelador vertical", sku: "Y051-000033", precio: 45, evaluacion: "depende", cuestionarioId: "instalacion-congelador" },
          { nombre: "Desinstalación de aire acondicionado", sku: "Y051-000022", precio: 25, evaluacion: "nunca" },
          { nombre: "Desinstalar puertas (por nevera)", sku: "Y051-000027", precio: 85, evaluacion: "nunca" },
          { nombre: "Estufa a gas Airfryer", sku: "Y051-000028", precio: 160, evaluacion: "depende", cuestionarioId: "instalacion-estufa-gas" },
          { nombre: "Estufa de piso de gas", sku: "Y051-000005", precio: 90, evaluacion: "depende", cuestionarioId: "instalacion-estufa-gas", servicioId: "instalacion-estufa-gas" },
          { nombre: "Estufa de piso eléctrica", sku: "Y051-000018", precio: 95, evaluacion: "depende", cuestionarioId: "instalacion-estufa-electrica", servicioId: "instalacion-estufa-electrica" },
          { nombre: "Estufa empotrable a gas", sku: "Y051-000011", precio: 95, evaluacion: "depende", cuestionarioId: "instalacion-estufa-empotrable-gas", servicioId: "instalacion-estufa-empotrable-gas" },
          { nombre: "Estufa empotrable eléctrica", sku: "Y051-000016", precio: 95, evaluacion: "depende", cuestionarioId: "instalacion-estufa-empotrable-electrica" },
          { nombre: "Estufa industrial", sku: "Y051-000038", precio: 95, evaluacion: "depende", cuestionarioId: "instalacion-estufa-industrial" },
          { nombre: "Extractor de campana de pared", sku: "Y051-000043", precio: 95, evaluacion: "depende", cuestionarioId: "instalacion-campana-pared" },
          { nombre: "Extractor de gabinete o campana", sku: "Y051-000017", precio: 50, evaluacion: "depende", cuestionarioId: "instalacion-microondas-extractor" },
          { nombre: "Extractor de isla", sku: "Y051-000037", precio: 165, evaluacion: "depende", cuestionarioId: "instalacion-extractor-isla" },
          { nombre: "Fabricador hielo de 50KG acero inoxidable", sku: "Y051-000006", precio: 150, evaluacion: "depende", cuestionarioId: "instalacion-fabricador-hielo" },
          { nombre: "Horno doble empotrable eléctrico", sku: "Y051-000035", precio: 190, evaluacion: "depende", cuestionarioId: "instalacion-horno-empotrable-electrico" },
          { nombre: "Horno empotrable a gas", sku: "Y051-000015", precio: 95, evaluacion: "depende", cuestionarioId: "instalacion-horno-empotrable", servicioId: "instalacion-horno-empotrable" },
          { nombre: "Horno empotrable eléctrico", sku: "Y051-000039", precio: 95, evaluacion: "depende", cuestionarioId: "instalacion-horno-empotrable-electrico" },
          { nombre: "Lavadora", sku: "Y051-000030", precio: 45, evaluacion: "depende", cuestionarioId: "instalacion-lavadora", servicioId: "instalacion-lavadora" },
          { nombre: "Lavadora y secadora apiladas", sku: "Y051-000041", precio: 200, evaluacion: "depende", cuestionarioId: "instalacion-lavadora-secadora-apiladas" },
          { nombre: "Lavaseca", precio: 85, evaluacion: "nunca" },
          { nombre: "Lavavajillas", sku: "Y051-000014", precio: 140, evaluacion: "depende", cuestionarioId: "instalacion-lavavajillas", servicioId: "instalacion-lavavajillas" },
          { nombre: "Microondas extractor", sku: "Y051-000031", precio: 85, evaluacion: "depende", cuestionarioId: "instalacion-microondas-extractor" },
          { nombre: "Refrigerador French Door de 29 pies", sku: "Y051-000023", precio: 200, evaluacion: "depende", cuestionarioId: "instalacion-refrigeradora-french", servicioId: "instalacion-refrigeradora-french" },
          { nombre: "Refrigeradoras de 18 pies o menos", sku: "Y051-000013", precio: 45, evaluacion: "depende", cuestionarioId: "instalacion-refrigeradora" },
          { nombre: "Refrigeradoras de 19 pies o más", sku: "Y051-000012", precio: 90, evaluacion: "depende", cuestionarioId: "instalacion-refrigeradora" },
          { nombre: "Secadora a gas de paso", sku: "Y051-000001", precio: 110, evaluacion: "depende", cuestionarioId: "instalacion-secadora-gas", servicioId: "instalacion-secadora-gas" },
          { nombre: "Secadora eléctrica", sku: "Y051-000025", precio: 140, evaluacion: "depende", cuestionarioId: "instalacion-secadora-electrica", servicioId: "instalacion-secadora-electrica" },
          { nombre: "Trim Kit microondas", sku: "Y051-000004", precio: 60, evaluacion: "nunca" },
          { nombre: "Trim Kit profesional de 79\" para refrigeradoras gemelas", sku: "Y051-000020", precio: 200, evaluacion: "nunca" },
          { nombre: "Vineras", sku: "Y051-000021", precio: 25, evaluacion: "depende", cuestionarioId: "instalacion-vinera", servicioId: "instalacion-vinera" },
        ],
      },
      {
        id: "instalacion-electrica",
        nombre: "Instalación eléctrica",
        articulos: [
          { nombre: "Abanicos de pared", sku: "Y050-000012", precio: 35, evaluacion: "nunca" },
          { nombre: "Abanicos de techo", sku: "Y050-000006", precio: 45, evaluacion: "nunca" },
          { nombre: "Abanicos industriales de pared", sku: "Y050-000008", precio: 95, evaluacion: "nunca" },
          { nombre: "Abanicos industriales de techo", sku: "Y050-000013", evaluacion: "obligatoria" },
          { nombre: "Breakers", sku: "Y050-000010", evaluacion: "obligatoria" },
          { nombre: "Cableado eléctrico", sku: "Y050-000015", evaluacion: "obligatoria" },
          { nombre: "Dimmer", sku: "Y050-000004", precio: 35, evaluacion: "nunca" },
          { nombre: "Interruptor", sku: "Y050-000003", precio: 20, evaluacion: "nunca" },
          { nombre: "Lámparas categoría A (Spots)", sku: "Y050-000002", precio: 15, evaluacion: "nunca" },
          { nombre: "Lámparas categoría B (de $0 a $24.99)", sku: "Y050-000009", precio: 25, evaluacion: "nunca" },
          { nombre: "Lámparas categoría C (de $25 a $99.99)", sku: "Y050-000007", precio: 35, evaluacion: "nunca" },
          { nombre: "Lámparas categoría D (de $100 o más)", sku: "Y050-000016", precio: 60, evaluacion: "nunca" },
          { nombre: "Panel eléctrico", sku: "Y050-000017", evaluacion: "obligatoria" },
          { nombre: "Rieles", sku: "Y050-000011", precio: 50, evaluacion: "nunca" },
          { nombre: "Roseta", sku: "Y050-000005", precio: 25, evaluacion: "nunca" },
          { nombre: "Tomacorrientes", sku: "Y050-000014", precio: 20, evaluacion: "nunca" },
        ],
      },
      {
        id: "instalacion-de-plomeria",
        nombre: "Instalación de plomería",
        articulos: [
          { nombre: "Asiento de inodoro", sku: "Y053-000036", precio: 25, evaluacion: "nunca" },
          { nombre: "Bomba de agua", sku: "Y053-000022", evaluacion: "obligatoria" },
          { nombre: "Brazo de ducha", sku: "Y053-000011", precio: 25, evaluacion: "nunca" },
          { nombre: "Cabeza de ducha", sku: "Y053-000032", precio: 20, evaluacion: "nunca" },
          { nombre: "Cambio de fluxómetro", sku: "Y053-000006", evaluacion: "obligatoria" },
          { nombre: "Ducha eléctrica", sku: "Y053-000001", precio: 35, evaluacion: "nunca" },
          { nombre: "Ducha sanitaria", sku: "Y053-000003", precio: 57, evaluacion: "nunca" },
          { nombre: "Ducha tipo teléfono", sku: "Y053-000015", precio: 25, evaluacion: "nunca" },
          { nombre: "Fregador categoría A (de $0 a $100.99)", sku: "Y053-000029", precio: 90, evaluacion: "nunca" },
          { nombre: "Fregador categoría B (de $101 a $200.99)", sku: "Y053-000010", precio: 90, evaluacion: "nunca" },
          { nombre: "Fregador categoría C (de $201 o más)", sku: "Y053-000034", precio: 120, evaluacion: "nunca" },
          { nombre: "Grifería de fregador categoría A (de $0 a $50.99)", sku: "Y053-000008", precio: 50, evaluacion: "nunca" },
          { nombre: "Grifería de fregador categoría B (de $51 a $200.99)", sku: "Y053-000026", precio: 50, evaluacion: "nunca" },
          { nombre: "Grifería de fregador categoría C (de $201 a $500.99)", sku: "Y053-000021", precio: 90, evaluacion: "nunca" },
          { nombre: "Grifería de fregador categoría D (de $501 o más)", sku: "Y053-000013", precio: 120, evaluacion: "nunca" },
          { nombre: "Grifería de lavamanos categoría A (de $0 a $100.99)", sku: "Y053-000031", precio: 50, evaluacion: "nunca" },
          { nombre: "Grifería de lavamanos categoría B (de $101 a $200.99)", sku: "Y053-000017", precio: 50, evaluacion: "nunca" },
          { nombre: "Grifería de lavamanos categoría C (de $201 a $500.99)", sku: "Y053-000014", precio: 90, evaluacion: "nunca" },
          { nombre: "Grifería de lavamanos categoría D (de $501 o más)", sku: "Y053-000019", precio: 120, evaluacion: "nunca" },
          { nombre: "Inodoro categoría A (de $0 a $350.99)", sku: "Y053-000004", precio: 90, evaluacion: "nunca" },
          { nombre: "Inodoro categoría B (de $351 a $1,000.99)", sku: "Y053-000007", precio: 160, evaluacion: "nunca" },
          { nombre: "Inodoro categoría C (de $1,001 o más)", sku: "Y053-000016", precio: 200, evaluacion: "nunca" },
          { nombre: "Juego de ducha", sku: "Y053-000020", precio: 110, evaluacion: "nunca" },
          { nombre: "Lavamano con pedestal", sku: "Y053-000033", precio: 50, evaluacion: "nunca" },
          { nombre: "Lavamano empotrado", sku: "Y053-000018", precio: 85, evaluacion: "nunca" },
          { nombre: "Lavamano sencillo categoría A (de $0 a $100.99)", sku: "Y053-000023", precio: 45, evaluacion: "nunca" },
          { nombre: "Lavamano sencillo categoría B (de $101 a $200.99)", sku: "Y053-000035", precio: 57, evaluacion: "nunca" },
          { nombre: "Lavamano sencillo categoría C (de $201 a $500.99)", sku: "Y053-000030", precio: 85, evaluacion: "nunca" },
          { nombre: "Lavamano sencillo categoría D (de $501 a $1,000.99)", sku: "Y053-000027", precio: 150, evaluacion: "nunca" },
          { nombre: "Lavamano sencillo categoría E (de $1,001 o más)", sku: "Y053-000012", precio: 200, evaluacion: "nunca" },
          { nombre: "Manguera de ducha", sku: "Y053-000000", precio: 25, evaluacion: "nunca" },
          { nombre: "Resistencia", sku: "Y053-000009", precio: 45, evaluacion: "nunca" },
          { nombre: "Tanque de agua", sku: "Y053-000025", evaluacion: "obligatoria" },
          { nombre: "Taza con fluxómetro", sku: "Y053-000005", precio: 180, evaluacion: "nunca" },
          { nombre: "Tina de lavar", sku: "Y053-000028", evaluacion: "obligatoria" },
          { nombre: "Triturador de alimentos", sku: "Y053-000024", precio: 100, evaluacion: "nunca" },
          { nombre: "Urinal", sku: "Y053-000002", precio: 107, evaluacion: "nunca" },
        ],
      },
      {
        id: "instalacion-de-pisos-y-paredes",
        nombre: "Instalación de pisos y paredes",
        articulos: [
          { nombre: "Acabado de adoquín", sku: "Y056-000010", precio: 37.5, evaluacion: "nunca" },
          { nombre: "Acabado de arcilla grande", sku: "Y056-000004", precio: 15, evaluacion: "nunca" },
          { nombre: "Acabado de arcilla mediano", sku: "Y056-000002", precio: 15, evaluacion: "nunca" },
          { nombre: "Acabado de arcilla pequeño", sku: "Y056-000014", precio: 15, evaluacion: "nunca" },
          { nombre: "Acabado de cerámica grande", sku: "Y056-000011", precio: 20, evaluacion: "nunca" },
          { nombre: "Acabado de cerámica mediano", sku: "Y056-000012", precio: 12.5, evaluacion: "nunca" },
          { nombre: "Acabado de cerámica pequeño", sku: "Y056-000000", precio: 13, evaluacion: "nunca" },
          { nombre: "Acabado de piedra natural", sku: "Y056-000009", precio: 25, evaluacion: "nunca" },
          { nombre: "Acabado de porcelanato grande", sku: "Y056-000007", precio: 25, evaluacion: "nunca" },
          { nombre: "Acabado de porcelanato mediano", sku: "Y056-000003", precio: 15, evaluacion: "nunca" },
          { nombre: "Acabado de porcelanato pequeño", sku: "Y056-000006", precio: 13, evaluacion: "nunca" },
          { nombre: "Acabado de PVC", sku: "Y056-000005", precio: 10.5, evaluacion: "nunca" },
          { nombre: "Acabado de vidrio", sku: "Y056-000008", precio: 18.75, evaluacion: "nunca" },
          { nombre: "Acabado de vinil", sku: "Y056-000013", precio: 10.5, evaluacion: "nunca" },
          { nombre: "Acabado laminado", sku: "Y056-000001", precio: 10.5, evaluacion: "nunca" },
        ],
      },
      {
        id: "instalacion-de-puertas-y-ventanas",
        nombre: "Instalación de puertas y ventanas",
        articulos: [
          { nombre: "Corte de puerta", sku: "Y057-000026", evaluacion: "nunca" },
          { nombre: "Puertas acorazadas", sku: "Y057-000016", precio: 250, evaluacion: "nunca" },
          { nombre: "Puertas cortafuego categoría A", sku: "Y057-000018", precio: 100, evaluacion: "nunca" },
          { nombre: "Puertas cortafuego categoría B", sku: "Y057-000015", precio: 130, evaluacion: "nunca" },
          { nombre: "Puertas de acordeón", sku: "Y057-000024", precio: 45, evaluacion: "nunca" },
          { nombre: "Puertas de metal", sku: "Y057-000025", precio: 100, evaluacion: "nunca" },
          { nombre: "Puertas de PVC", sku: "Y057-000021", precio: 150, evaluacion: "nunca" },
          { nombre: "Puertas de seguridad", sku: "Y057-000023", precio: 200, evaluacion: "nunca" },
          { nombre: "Puertas entamboradas", sku: "Y057-000014", precio: 65, evaluacion: "nunca" },
          { nombre: "Puertas laminadas categoría A", sku: "Y057-000020", precio: 100, evaluacion: "nunca" },
          { nombre: "Puertas laminadas categoría B (Marca San Rafael)", sku: "Y057-000022", precio: 150, evaluacion: "nunca" },
          { nombre: "Puertas semisólidas", sku: "Y057-000019", precio: 150, evaluacion: "nunca" },
          { nombre: "Puertas sólidas", sku: "Y057-000017", precio: 75, evaluacion: "nunca" },
        ],
      },
      {
        id: "instalacion-de-sistema-de-construccion-liviano",
        nombre: "Instalación de sistema de construcción liviano",
        articulos: [
          { nombre: "Cielo raso de escayola", sku: "Y052-000002", precio: 12.5, evaluacion: "nunca", unidad: "m²" },
          { nombre: "Cielo raso de fibra mineral", sku: "Y052-000011", precio: 12.5, evaluacion: "nunca", unidad: "m²" },
          { nombre: "Cielo raso de foam", sku: "Y052-000003", precio: 12.5, evaluacion: "nunca", unidad: "m²" },
          { nombre: "Cielo raso de gypsum liso", sku: "Y052-000009", precio: 25, evaluacion: "nunca", unidad: "m²" },
          { nombre: "Cielo raso de PVC liso", sku: "Y052-000008", precio: 12.5, evaluacion: "nunca", unidad: "m²" },
          { nombre: "Cielo raso de yeso", sku: "Y052-000001", precio: 12.5, evaluacion: "nunca", unidad: "m²" },
          { nombre: "Pared de gypsum", sku: "Y052-000006", precio: 31.5, evaluacion: "nunca", unidad: "m²" },
        ],
      },
      {
        id: "instalacion-de-hogar",
        nombre: "Instalación de hogar",
        articulos: [
          { nombre: "Botiquín", sku: "Y054-000003", precio: 37.5, evaluacion: "nunca" },
          { nombre: "Cuadros decorativos", sku: "Y054-000002", precio: 25, evaluacion: "nunca" },
          { nombre: "Espejos de baño", sku: "Y054-000001", precio: 37.5, evaluacion: "nunca" },
          { nombre: "Espejos decorativos", sku: "Y054-000005", precio: 25, evaluacion: "nunca" },
          { nombre: "Papel tapiz", sku: "Y054-000000", precio: 45, evaluacion: "nunca" },
          { nombre: "Persianas roller", sku: "Y054-000004", precio: 45, evaluacion: "nunca" },
        ],
      },
      {
        id: "otros-servicios-de-instalacion",
        nombre: "Otros servicios de instalación",
        articulos: [
          { nombre: "Aislante (tipo Prodex)", sku: "Y059-000078", evaluacion: "obligatoria" },
          { nombre: "Aislante térmico (fibra)", sku: "Y059-000075", evaluacion: "obligatoria" },
          { nombre: "Alucobond", sku: "Y059-000068", precio: 35, evaluacion: "nunca" },
          { nombre: "Caballete", sku: "Y059-000067", evaluacion: "obligatoria" },
          { nombre: "Canales hierro galvanizado / calibre 16", sku: "Y059-000061", evaluacion: "obligatoria" },
          { nombre: "Canales hierro galvanizado / calibre 18", sku: "Y059-000072", evaluacion: "obligatoria" },
          { nombre: "Canales hierro galvanizado / calibre 20", sku: "Y059-000069", evaluacion: "obligatoria" },
          { nombre: "Canales hierro galvanizado / calibre 22", sku: "Y059-000079", evaluacion: "obligatoria" },
          { nombre: "Canales hierro galvanizado / calibre 24", sku: "Y059-000064", evaluacion: "obligatoria" },
          { nombre: "Cámaras de seguridad", sku: "Y059-000066", precio: 150, evaluacion: "nunca" },
          { nombre: "Césped artificial", sku: "Y059-000057", precio: 12, evaluacion: "nunca" },
          { nombre: "Extractores de baño", sku: "Y059-000070", precio: 45, evaluacion: "nunca" },
          { nombre: "Flashing", sku: "Y059-000080", evaluacion: "obligatoria" },
          { nombre: "Neolith", sku: "Y059-000096", evaluacion: "nunca" },
          { nombre: "Piedra sinterizada", sku: "Y059-000095", evaluacion: "nunca" },
          { nombre: "Plancha de sobre de granito de 0.60CM de ancho", sku: "Y059-000059", precio: 125, evaluacion: "nunca" },
          { nombre: "Plancha de sobre de granito de 0.70CM de ancho", sku: "Y059-000077", precio: 190, evaluacion: "nunca" },
          { nombre: "Puertas de baño de apertura grande", sku: "Y059-000076", precio: 145, evaluacion: "nunca" },
          { nombre: "Puertas de baño de apertura mediana", sku: "Y059-000058", precio: 145, evaluacion: "nunca" },
          { nombre: "Tablero de distribución", sku: "Y059-000074", precio: 125, evaluacion: "nunca" },
          { nombre: "Techo Panalit", sku: "Y059-000073", evaluacion: "obligatoria" },
          { nombre: "Techo Standing Seam", sku: "Y059-000082", evaluacion: "obligatoria" },
          { nombre: "Techo zinc (ondulado o esmaltado)", sku: "Y059-000065", evaluacion: "obligatoria" },
          { nombre: "Teja", sku: "Y059-000063", evaluacion: "obligatoria" },
          { nombre: "Timbres", sku: "Y059-000062", precio: 55, evaluacion: "nunca" },
          { nombre: "Ventana", sku: "Y059-000060", precio: 50, evaluacion: "nunca" },
        ],
      },
    ],
  },
  {
    nombre: "Mantenimiento",
    subcategorias: [
      {
        id: "mantenimiento-de-aire-acondicionado",
        nombre: "Mantenimiento de aire acondicionado",
        articulos: [
          { nombre: "Mantenimiento de Aire Acondicionado", sku: "Y051-000000", evaluacion: "nunca", servicioId: "mantenimiento-aire" },
        ],
      },
      {
        id: "mantenimiento-de-electrodomesticos",
        nombre: "Mantenimiento de electrodomésticos",
        articulos: [
          { nombre: "Mantenimiento de Centro de Lavado", evaluacion: "nunca" },
          { nombre: "Mantenimiento de Secadora", evaluacion: "nunca" },
        ],
      },
      {
        id: "mantenimiento-de-techos",
        nombre: "Mantenimiento de techos",
        articulos: [
          { nombre: "Mantenimiento techo", evaluacion: "nunca" },
        ],
      },
    ],
  },
  {
    nombre: "Reparación",
    subcategorias: [
      {
        id: "reparacion-de-plomeria-y-filtraciones",
        nombre: "Reparación de plomería y filtraciones",
        articulos: [
          { nombre: "Reparación de daños de tuberías / filtraciones", evaluacion: "nunca" },
        ],
      },
      {
        id: "reparacion-de-techos",
        nombre: "Reparación de techos",
        articulos: [
          { nombre: "Reparación de techo", evaluacion: "nunca" },
        ],
      },
    ],
  },
  {
    nombre: "Fumigación",
    subcategorias: [
      {
        id: "combos-de-fumigacion-y-nebulizacion",
        nombre: "Combos de fumigación y nebulización",
        articulos: [
          { nombre: "Combo de fumigación básica + nebulización interna (hasta 200 m²)", evaluacion: "nunca" },
          { nombre: "Combo de fumigación básica + nebulización interna (hasta 399 m²)", evaluacion: "nunca" },
          { nombre: "Combo de fumigación básica + nebulización interna (más de 400 m²)", evaluacion: "nunca" },
        ],
      },
      {
        id: "fumigacion-residencial",
        nombre: "Fumigación residencial",
        articulos: [
          { nombre: "Fumigación básica en residencias de 201 m² a 399 m²", sku: "Y059-000087", evaluacion: "nunca" },
          { nombre: "Fumigación básica en residencias hasta 200 m²", sku: "Y059-000084", evaluacion: "nunca" },
          { nombre: "Fumigación básica en residencias igual y mayor a 400 m²", sku: "Y059-000090", evaluacion: "nunca" },
        ],
      },
      {
        id: "fumigacion-vehicular",
        nombre: "Fumigación vehicular",
        articulos: [
          { nombre: "Fumigación de carro a domicilio", sku: "Y059-000088", evaluacion: "nunca" },
        ],
      },
      {
        id: "nebulizacion",
        nombre: "Nebulización",
        articulos: [
          { nombre: "Nebulización externa", evaluacion: "nunca" },
          { nombre: "Nebulización interna", evaluacion: "nunca" },
        ],
      },
      {
        id: "tratamiento-de-infestaciones",
        nombre: "Tratamiento de infestaciones",
        articulos: [
          { nombre: "Infestación de hormigas y/o cucarachas", evaluacion: "nunca" },
        ],
      },
    ],
  },
  {
    nombre: "Limpieza",
    subcategorias: [
      {
        id: "limpieza-de-alfombra",
        nombre: "Limpieza de alfombra",
        articulos: [
          { nombre: "Limpieza de alfombra", evaluacion: "nunca" },
        ],
      },
      {
        id: "limpieza-de-colchon",
        nombre: "Limpieza de colchón",
        articulos: [
          { nombre: "Limpieza de colchón Full", sku: "Y059-000107", evaluacion: "nunca" },
          { nombre: "Limpieza de colchón King", sku: "Y059-000114", evaluacion: "nunca" },
          { nombre: "Limpieza de colchón Queen", sku: "Y059-000101", evaluacion: "nunca" },
          { nombre: "Limpieza de colchón Twin", sku: "Y059-000117", evaluacion: "nunca" },
        ],
      },
      {
        id: "limpieza-de-respaldar-de-cama",
        nombre: "Limpieza de respaldar de cama",
        articulos: [
          { nombre: "Limpieza de respaldar de cama Full", sku: "Y059-000100", evaluacion: "nunca" },
          { nombre: "Limpieza de respaldar de cama King", sku: "Y059-000103", evaluacion: "nunca" },
          { nombre: "Limpieza de respaldar de cama Queen", sku: "Y059-000118", evaluacion: "nunca" },
          { nombre: "Limpieza de respaldar de cama Twin", sku: "Y059-000111", evaluacion: "nunca" },
        ],
      },
      {
        id: "limpieza-de-sillas",
        nombre: "Limpieza de sillas",
        articulos: [
          { nombre: "Limpieza de silla de comedor de cuero", sku: "Y059-000110", evaluacion: "nunca" },
          { nombre: "Limpieza de silla de comedor tapizada", sku: "Y059-000119", evaluacion: "nunca" },
          { nombre: "Limpieza de silla de sala", sku: "Y059-000112", evaluacion: "nunca" },
          { nombre: "Limpieza de silla de sala de cuero", sku: "Y059-000115", evaluacion: "nunca" },
        ],
      },
      {
        id: "limpieza-de-sofa",
        nombre: "Limpieza de sofá",
        articulos: [
          { nombre: "Limpieza de sofá de cuero de 1 puesto", sku: "Y059-000105", evaluacion: "nunca" },
          { nombre: "Limpieza de sofá de cuero de 2 puestos", sku: "Y059-000116", evaluacion: "nunca" },
          { nombre: "Limpieza de sofá de cuero de 3 puestos", sku: "Y059-000120", evaluacion: "nunca" },
          { nombre: "Limpieza de sofá de cuero de 4 puestos", sku: "Y059-000108", evaluacion: "nunca" },
          { nombre: "Limpieza de sofá de cuero XL", sku: "Y059-000102", evaluacion: "nunca" },
          { nombre: "Limpieza de sofá de tela de 1 puesto", sku: "Y059-000106", evaluacion: "nunca" },
          { nombre: "Limpieza de sofá de tela de 2 puestos", sku: "Y059-000113", evaluacion: "nunca" },
          { nombre: "Limpieza de sofá de tela de 3 puestos", sku: "Y059-000109", evaluacion: "nunca" },
          { nombre: "Limpieza de sofá de tela de 4 puestos", sku: "Y059-000121", evaluacion: "nunca" },
          { nombre: "Limpieza de sofá de tela XL", sku: "Y059-000104", evaluacion: "nunca" },
        ],
      },
      {
        id: "tratamientos-especiales",
        nombre: "Tratamientos especiales",
        articulos: [
          { nombre: "Tratamiento enzimático", evaluacion: "nunca" },
        ],
      },
    ],
  },
  {
    nombre: "Pintura",
    subcategorias: [
      {
        id: "pintura-de-paredes-residenciales",
        nombre: "Pintura de paredes residenciales",
        articulos: [
          { nombre: "Mano de obra de pintura de paredes residenciales externas", sku: "Y059-000081", precio: 6, evaluacion: "nunca" },
          { nombre: "Mano de obra de pintura de paredes residenciales internas", sku: "Y059-000071", precio: 5, evaluacion: "nunca" },
        ],
      },
    ],
  },
  {
    nombre: "Mobiliario",
    subcategorias: [
      {
        id: "armado-de-bares-y-muebles-de-comedor",
        nombre: "Armado de bares y muebles de comedor",
        articulos: [
          { nombre: "Bar alto Oslo milan + plomo", evaluacion: "nunca" },
          { nombre: "Bar Aranjuez fresno + capri", evaluacion: "nunca" },
          { nombre: "Bar bajo Funes color weng/toq", evaluacion: "nunca" },
          { nombre: "Bar Berkley plomo fresno", evaluacion: "nunca" },
          { nombre: "Barra comedor Sicilia blan/fre", evaluacion: "nunca" },
          { nombre: "Bife Aranjuez fresno + capri", evaluacion: "nunca" },
          { nombre: "Carrito de bar wengue", evaluacion: "nunca" },
          { nombre: "Mueble para bar Vihti conac", evaluacion: "nunca" },
        ],
      },
      {
        id: "armado-de-cajoneras-y-gaveteros",
        nombre: "Armado de cajoneras y gaveteros",
        articulos: [
          { nombre: "Cajonera Houck 4 cajones plomo", evaluacion: "nunca" },
          { nombre: "Cajonera Sevilla 4 cajon nogal", evaluacion: "nunca" },
          { nombre: "Cajonera Vance fresno + capri", evaluacion: "nunca" },
          { nombre: "Gavet Hamilton Macadamia gris", evaluacion: "nunca" },
          { nombre: "Gavetero Azafrán de 2 puertas color duna/blanco", evaluacion: "nunca" },
          { nombre: "Gavetero Turin wengue", evaluacion: "nunca" },
        ],
      },
      {
        id: "armado-de-combos-y-kits",
        nombre: "Armado de combos y kits",
        articulos: [
          { nombre: "Combo de mueble Turin wengue - 3 piezas", evaluacion: "nunca" },
          { nombre: "Kit napoles 2.0 wengue", evaluacion: "nunca" },
        ],
      },
      {
        id: "armado-de-escritorios",
        nombre: "Armado de escritorios",
        articulos: [
          { nombre: "ESCRITORIO DUBLIN HABANO", evaluacion: "nunca" },
          { nombre: "Escritorio Mompox blanco", evaluacion: "nunca" },
          { nombre: "Escritorio Mompox Milan", evaluacion: "nunca" },
          { nombre: "ESCRITORIO OASIS WENGUE", evaluacion: "nunca" },
          { nombre: "ESCRITORIO OVIDEO DUNA", evaluacion: "nunca" },
          { nombre: "ESCRITORIO PALERMO GALES", evaluacion: "nunca" },
          { nombre: "Escritorio Silla Boscozy fresn", evaluacion: "nunca" },
          { nombre: "Escritorio STELLA (1C) blanco", evaluacion: "nunca" },
          { nombre: "Escritorio Stella 1C Bardolino", evaluacion: "nunca" },
          { nombre: "ESCRITORIO VILNA WENGUE", evaluacion: "nunca" },
        ],
      },
      {
        id: "armado-de-mesas-de-noche-y-veladores",
        nombre: "Armado de mesas de noche y veladores",
        articulos: [
          { nombre: "M noch Hamilton Macadami gris", evaluacion: "nunca" },
          { nombre: "M noche flotant Navolat Bellot", evaluacion: "nunca" },
          { nombre: "M noche flotante Boa Macadamia", evaluacion: "nunca" },
          { nombre: "M noche flotante Busan Bellot", evaluacion: "nunca" },
          { nombre: "Mesa de Noche Aberdeen blanca", evaluacion: "nunca" },
          { nombre: "Mesa de Noche Aberdeen wengue", evaluacion: "nunca" },
          { nombre: "Mesa de noche Alpine nogal", evaluacion: "nunca" },
          { nombre: "Mesa de noche Arlet macadamia", evaluacion: "nunca" },
          { nombre: "Mesa de noche Basic Clay", evaluacion: "nunca" },
          { nombre: "Mesa de noche Eco Silpa blanco", evaluacion: "nunca" },
          { nombre: "Mesa de noche Eco Silpa milan", evaluacion: "nunca" },
          { nombre: "MESA DE NOCHE FERRATO", evaluacion: "nunca" },
          { nombre: "Mesa de noche Mimbre", evaluacion: "nunca" },
          { nombre: "Mesa de noche Otom", evaluacion: "nunca" },
          { nombre: "Mesa de noche Vance fresn/capr", evaluacion: "nunca" },
          { nombre: "Nochero Trivor", evaluacion: "nunca" },
          { nombre: "Velador Secret Z-81 Plomo/Wen", evaluacion: "nunca" },
          { nombre: "Velador Secret Z-81 wen/Silo", evaluacion: "nunca" },
        ],
      },
      {
        id: "armado-de-mesas-y-muebles-auxiliares",
        nombre: "Armado de mesas y muebles auxiliares",
        articulos: [
          { nombre: "Consola de acento", evaluacion: "nunca" },
          { nombre: "Mesa abatible Sky macadamia", evaluacion: "nunca" },
          { nombre: "Mesa auxiliar", evaluacion: "nunca" },
          { nombre: "MESA AUXILIAR VASSEL MIEL", evaluacion: "nunca" },
          { nombre: "Mesa de centro modelo Pérgamo color blanco y gales", evaluacion: "nunca" },
          { nombre: "Mesa Super Eco", evaluacion: "nunca" },
          { nombre: "Mueble auxi Pacific bco fresno", evaluacion: "nunca" },
        ],
      },
      {
        id: "armado-de-muebles-de-cocina",
        nombre: "Armado de muebles de cocina",
        articulos: [
          { nombre: "Alacena Oshawa blanco", evaluacion: "nunca" },
          { nombre: "Cocina 1.50 Alani", evaluacion: "nunca" },
          { nombre: "Cocina 1.50 lund blanco roble", evaluacion: "nunca" },
          { nombre: "Cocina 150 Luna izq 3C nogal", evaluacion: "nunca" },
          { nombre: "COCINA BAZAGLI CAJON+MESON", evaluacion: "nunca" },
          { nombre: "Cocina Burton Bardolino blanco", evaluacion: "nunca" },
          { nombre: "Cocina Sicilia 150 blnc/macad", evaluacion: "nunca" },
          { nombre: "Isla cocina cala blanco", evaluacion: "nunca" },
          { nombre: "MUEBLE ALACENA 95", evaluacion: "nunca" },
          { nombre: "Mueble Alacena Attica", evaluacion: "nunca" },
          { nombre: "MUEBLE ALACENA MULTIUSOS", evaluacion: "nunca" },
          { nombre: "Mueble cocina Pantress blanco", evaluacion: "nunca" },
          { nombre: "Mueble Microondas Bombona", evaluacion: "nunca" },
          { nombre: "Mueble microondas Oshawa blnc", evaluacion: "nunca" },
          { nombre: "ORGANIZADOR DE COCINA BLOSSON", evaluacion: "nunca" },
        ],
      },
      {
        id: "armado-de-organizadores-estantes-y-zapateros",
        nombre: "Armado de organizadores, estantes y zapateros",
        articulos: [
          { nombre: "Biblioteca Boscozy capri fresn", evaluacion: "nunca" },
          { nombre: "Close ECO 120 blanco mq senc", evaluacion: "nunca" },
          { nombre: "ESTANTE HOME E2 (1C) BLANCO MQZ 180,6X45X29,9 CM", evaluacion: "nunca" },
          { nombre: "ESTANTE HOME E2 (1C) WENGUE 180,6X45X29,9 CM", evaluacion: "nunca" },
          { nombre: "ESTANTE HOME E3 (1C) BLANCO MQZ 180,6X62,8X29,9 CM", evaluacion: "nunca" },
          { nombre: "ESTANTE HOME E3 (1C) WENGUE 180,6X62,8X29,9 CM", evaluacion: "nunca" },
          { nombre: "ESTANTE HOME E4 2P (1C) BLANCO MQZ 180,6X62,8X29,9 CM", evaluacion: "nunca" },
          { nombre: "ESTANTE HOME E4 2P (1C) WENGUE 180,6X62,8X29,9 CM", evaluacion: "nunca" },
          { nombre: "Organizador Lena 6 cub blanco", evaluacion: "nunca" },
          { nombre: "Organizador Lena 6 cub wengue", evaluacion: "nunca" },
          { nombre: "Organizador Lena 8 cub blanco", evaluacion: "nunca" },
          { nombre: "Organizador Lena 8 cub wengue", evaluacion: "nunca" },
          { nombre: "Repisa Obregon Duna", evaluacion: "nunca" },
          { nombre: "Zapatero Alpine color nogal", evaluacion: "nunca" },
          { nombre: "Zapatero Z-94 18 pares duna/bl", evaluacion: "nunca" },
        ],
      },
      {
        id: "armado-de-racks-y-paneles-de-tv",
        nombre: "Armado de racks y paneles de TV",
        articulos: [
          { nombre: "Centro entretenimient RAV BELL", evaluacion: "nunca" },
          { nombre: "Centro entretenimient YAKARTA", evaluacion: "nunca" },
          { nombre: "Combo Cama DiColor (Cama Dicolor + Mesas de noche colore + Rack tv Lima)", evaluacion: "nunca" },
          { nombre: "MESA DE TV GRECA", evaluacion: "nunca" },
          { nombre: "Mesa de TV Navia 65\"nogal", evaluacion: "nunca" },
          { nombre: "Mesa TV Navia bardolino + blanco", evaluacion: "nunca" },
          { nombre: "Mueble TV Arlet gris/macad", evaluacion: "nunca" },
          { nombre: "Mueble Tv Rockwood blanco", evaluacion: "nunca" },
          { nombre: "Mueble Tv Rockwood wengue", evaluacion: "nunca" },
          { nombre: "Mueble TV Vance fresno/capri", evaluacion: "nunca" },
          { nombre: "Mueble TV Vassel miel/plomo", evaluacion: "nunca" },
          { nombre: "PANEL DE TV VOSTOK", evaluacion: "nunca" },
          { nombre: "PANEL TV BEIJING", evaluacion: "nunca" },
          { nombre: "Panel TV Elton wengue", evaluacion: "nunca" },
          { nombre: "PANEL TV RAVENA", evaluacion: "nunca" },
          { nombre: "Panel Tv Ravena Novo", evaluacion: "nunca" },
          { nombre: "Panel TV Vance fresno/capri", evaluacion: "nunca" },
          { nombre: "Rack 120 Home", evaluacion: "nunca" },
          { nombre: "Rack 120 HOME color nogal", evaluacion: "nunca" },
          { nombre: "Rack de TV Aranjuez fres/capr", evaluacion: "nunca" },
          { nombre: "RACK DE TV CINCINATTI", evaluacion: "nunca" },
          { nombre: "Rack de TV Goodwood 70\" nogal", evaluacion: "nunca" },
          { nombre: "Rack para Tv Lavanda _ Cajon", evaluacion: "nunca" },
          { nombre: "RACK PARA TV MINOTTI", evaluacion: "nunca" },
          { nombre: "RACK PARA TV SALEM MIEL+BLANCO", evaluacion: "nunca" },
          { nombre: "Rack para TV Sherwood nog/toq", evaluacion: "nunca" },
          { nombre: "Rack TV Boise Wengue 1.35mts TV 58\"", evaluacion: "nunca" },
          { nombre: "Rack TV Clare 50\" fresno", evaluacion: "nunca" },
          { nombre: "Rack TV flotante bardolino", evaluacion: "nunca" },
          { nombre: "Rack TV flotante wengue", evaluacion: "nunca" },
          { nombre: "Rack TV Funes Eco 120 wen/len", evaluacion: "nunca" },
          { nombre: "Rack TV Marquis 180 milan", evaluacion: "nunca" },
          { nombre: "Rack tv mascotas pistacho", evaluacion: "nunca" },
          { nombre: "Rack TV Salem Eco 1 cajon", evaluacion: "nunca" },
          { nombre: "Rack TV Suxta 70\" 1C nogal", evaluacion: "nunca" },
        ],
      },
      {
        id: "armado-de-tocadores-y-muebles-de-bano",
        nombre: "Armado de tocadores y muebles de baño",
        articulos: [
          { nombre: "Mueble de aseo Aeris color blanco", evaluacion: "nunca" },
          { nombre: "Mueble tocador Kaia weng/miel", evaluacion: "nunca" },
          { nombre: "Tocador Cecily blanco", evaluacion: "nunca" },
        ],
      },
    ],
  },
];

// ── MOCK CONFIGURABLE ──
// Jardinería y Mudanza no están en los documentos del negocio. Se conservan
// como categorías con un artículo de demostración (los valores vienen de los
// fixtures previos del prototipo) para que la navegación muestre la taxonomía
// completa. Reemplazar por la data real cuando exista.
const CATEGORIAS_MOCK: CategoriaCatalogo[] = [
  {
    nombre: "Jardinería",
    subcategorias: [
      {
        id: "mantenimiento-de-jardin",
        nombre: "Mantenimiento de jardín",
        articulos: [
          { nombre: "Mantenimiento de jardín", evaluacion: "nunca", servicioId: "mantenimiento-jardin" },
        ],
      },
    ],
  },
  {
    nombre: "Mudanza",
    subcategorias: [
      {
        id: "mudanza-local",
        nombre: "Mudanza local",
        articulos: [
          { nombre: "Mudanza dentro de la ciudad", evaluacion: "nunca", servicioId: "mudanza-local" },
        ],
      },
    ],
  },
];

export const DEPARTAMENTO_MIPRO: DepartamentoCatalogo = {
  // Capa de datos: el nombre del departamento nunca se navega como pantalla.
  nombre: "MiPRO",
  categorias: [...CATEGORIAS_DOCUMENTADAS, ...CATEGORIAS_MOCK],
};
