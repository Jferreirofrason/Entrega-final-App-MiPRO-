// Paso "Revisar el lugar": configuración DE DISEÑO del cuestionario.
//
// Derivada del documento "Información de servicios de MiPRO" (hoja Línea
// Blanca): esta versión cubre el caso de aire acondicionado split, cuya fila
// del PDF define el recorrido completo (casa o edificio, planta baja, equipo
// existente, conexión de 220 V y distancia entre unidades). El lenguaje se
// adaptó a términos cotidianos conservando el significado operativo de cada
// pregunta; el texto original del PDF queda como referencia en `fuentePdf`.
//
// NO es el motor definitivo: la relación por SKU de instalación, el resto de
// las familias de línea blanca y las validaciones estructurales completas
// llegan con la implementación técnica. Los servicios sin cuestionario
// continúan directo al siguiente paso, sin pantalla vacía.

import { DEPARTAMENTO_MIPRO } from "./catalogoMipro.ts";
import { idDeArticulo } from "../logic/catalogoMipro.ts";

export type ResultadoLugar = "estandar" | "inspeccion";

export interface OpcionLugar {
  /** Descripción breve bajo el título, solo cuando elimina dudas. */
  descripcion?: string;
  id: string;
  etiqueta: string;
  /** Id de la siguiente pregunta; ausente si la opción cierra el recorrido. */
  siguiente?: string;
  /** Resultado que produce la opción cuando cierra el recorrido. */
  resultado?: ResultadoLugar;
  /** true cuando la opción implica un equipo existente: se ofrece desinstalar. */
  marcaDesinstalacion?: boolean;
  /** true para "No estoy seguro": muestra el mensaje tranquilizador. */
  esNoEstoySeguro?: boolean;
}

export interface AyudaLugar {
  titulo: string;
  descripcion: string;
  /** Diagrama propio (clave del componente de ilustración). */
  diagrama?: "voltaje" | "unidades";
}

export interface PreguntaLugar {
  id: string;
  texto: string;
  ayudaBreve?: string;
  comoIdentifico?: AyudaLugar;
  opciones: OpcionLugar[];
  /** Pregunta original del PDF (trazabilidad; nunca se muestra). */
  fuentePdf: string;
}

export interface CuestionarioLugar {
  servicioId: string;
  /** Cantidad máxima de preguntas del recorrido (para el avance visual). */
  maximoPreguntas: number;
  inicial: string;
  preguntas: PreguntaLugar[];
  /** Precio confirmado de la desinstalación para este servicio, si existe. */
  precioDesinstalacion?: number;
}

const CUESTIONARIO_AIRE: CuestionarioLugar = {
  servicioId: "instalacion-aire",
  maximoPreguntas: 5,
  inicial: "donde",
  precioDesinstalacion: 25, // PDF: "Desinstalación de aire acondicionado $25"
  preguntas: [
    {
      id: "donde",
      texto: "¿Dónde se instalará el aire acondicionado?",
      fuentePdf: "¿La instalación del aire es en casa o edificio?",
      opciones: [
        { id: "casa", etiqueta: "Casa", siguiente: "planta" },
        { id: "edificio", etiqueta: "Apartamento o edificio", resultado: "inspeccion" },
      ],
    },
    {
      id: "planta",
      texto: "¿El equipo se instalará en la planta baja?",
      ayudaBreve: "En pisos altos necesitamos revisar el lugar para confirmar que la instalación sea segura.",
      fuentePdf: "¿La instalación en la casa es en planta baja?",
      opciones: [
        { id: "si", etiqueta: "Sí, en planta baja", siguiente: "existente" },
        { id: "no", etiqueta: "No, está en otro piso", resultado: "inspeccion" },
        { id: "ns", etiqueta: "No estoy seguro", resultado: "inspeccion", esNoEstoySeguro: true },
      ],
    },
    {
      id: "existente",
      texto: "¿Ya hay un aire acondicionado instalado en ese lugar?",
      fuentePdf: "¿Dónde se va a instalar el aire ya tiene otro instalado?",
      opciones: [
        { id: "si", etiqueta: "Sí, ya hay un equipo", siguiente: "electrica", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No, es una instalación nueva", siguiente: "electrica" },
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay una conexión eléctrica de 220 V en el lugar de la instalación?",
      ayudaBreve: "Si no sabes cuál es, elige \"No estoy seguro\".",
      comoIdentifico: {
        titulo: "¿Cómo identifico una conexión de 220 V?",
        descripcion:
          "El tomacorriente de 220 V es distinto al común: suele ser más grande y con ranuras en otra posición. Se usa para equipos como secadoras, estufas eléctricas y aires acondicionados.",
        diagrama: "voltaje",
      },
      fuentePdf: "¿Cuenta con tomacorriente de 220V en el lugar de la instalación?",
      opciones: [
        { id: "si", etiqueta: "Sí, hay conexión de 220 V", siguiente: "distancia" },
        { id: "no", etiqueta: "No hay", resultado: "inspeccion" },
        { id: "ns", etiqueta: "No estoy seguro", resultado: "inspeccion", esNoEstoySeguro: true },
      ],
    },
    {
      id: "distancia",
      texto: "¿La unidad interior y la unidad exterior estarán a menos de 3 metros?",
      ayudaBreve: "La unidad interior va dentro de la vivienda y la exterior se instala fuera.",
      comoIdentifico: {
        titulo: "¿Cuáles son las unidades interior y exterior?",
        descripcion:
          "La unidad interior es la que se ve dentro de la habitación y da el aire. La exterior es el equipo que queda fuera de la vivienda. Tres metros equivalen, más o menos, al ancho de una habitación pequeña.",
        diagrama: "unidades",
      },
      fuentePdf: "¿El split tiene una distancia menor a 3 metros del compresor?",
      opciones: [
        { id: "si", etiqueta: "Sí, a menos de 3 metros", resultado: "estandar" },
        { id: "no", etiqueta: "No, están más lejos", resultado: "inspeccion" },
        { id: "ns", etiqueta: "No estoy seguro", resultado: "inspeccion", esNoEstoySeguro: true },
      ],
    },
  ],
};


// ── Cuestionarios de línea blanca (fuente: PDF, hoja Línea Blanca) ──
//
// Opciones y ayudas repetidas. Nota de interpretación documentada: en varias
// filas del PDF cada "SI" dice "aplica instalación básica" aunque haya más
// preguntas después; se interpreta que TODAS las condiciones son necesarias
// (los "SI" intermedios encadenan a la siguiente pregunta), igual que el
// propio documento lo hace explícito en calentadores y aires.

const NS_INSPECCION: OpcionLugar = {
  id: "ns",
  etiqueta: "No estoy seguro",
  resultado: "inspeccion",
  esNoEstoySeguro: true,
};
const NO_INSPECCION: OpcionLugar = { id: "no", etiqueta: "No", resultado: "inspeccion" };
const SI_ESTANDAR: OpcionLugar = { id: "si", etiqueta: "Sí", resultado: "estandar" };

const AYUDA_110: AyudaLugar = {
  titulo: "¿Cómo identifico un tomacorriente de 110 V?",
  descripcion:
    "Es el enchufe común de la casa, donde conectas la mayoría de los aparatos. El de 220 V es más grande y con ranuras en otra posición.",
  diagrama: "voltaje",
};
const AYUDA_220: AyudaLugar = {
  titulo: "¿Cómo identifico una conexión de 220 V?",
  descripcion:
    "El tomacorriente de 220 V es distinto al común: suele ser más grande y con ranuras en otra posición. Se usa para equipos como secadoras, estufas eléctricas y calentadores.",
  diagrama: "voltaje",
};

const CUESTIONARIO_SECADORA_GAS: CuestionarioLugar = {
  servicioId: "instalacion-secadora-gas",
  maximoPreguntas: 2,
  inicial: "existente",
  precioDesinstalacion: 20, // PDF: costo extra de $20.00
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay una secadora instalada en el lugar?",
      ayudaBreve: "Esto nos permite saber si el espacio ya cuenta con las conexiones necesarias.",
      fuentePdf: "¿Ya mantiene una secadora de gas en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", resultado: "estandar", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "gas" },
      ],
    },
    {
      id: "gas",
      texto: "¿Hay una salida de gas para la secadora?",
      ayudaBreve: "Es la conexión con llave o válvula de donde sale el gas.",
      fuentePdf: "¿Cuenta con salida de gas para esta secadora?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_SECADORA_ELECTRICA: CuestionarioLugar = {
  servicioId: "instalacion-secadora-electrica",
  maximoPreguntas: 2,
  inicial: "existente",
  precioDesinstalacion: 20, // PDF: costo extra de $20.00
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay una secadora instalada en el lugar?",
      ayudaBreve: "Esto nos permite saber si el espacio ya cuenta con las conexiones necesarias.",
      fuentePdf: "¿Ya mantiene una secadora electríca en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", resultado: "estandar", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "electrica" },
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay una conexión eléctrica de 220 V cerca de donde irá la secadora?",
      ayudaBreve: 'Si no estás seguro del voltaje, elige "No estoy seguro".',
      comoIdentifico: AYUDA_220,
      fuentePdf: "¿Cuenta con tomacorriente de 220V para esta secadora?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_LAVADORA: CuestionarioLugar = {
  servicioId: "instalacion-lavadora",
  maximoPreguntas: 2,
  inicial: "electrica",
  preguntas: [
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) en el lugar?",
      comoIdentifico: AYUDA_110,
      fuentePdf: "¿Cuenta con tomacorriente de 110V en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "agua",
      texto: "¿Hay llaves de agua y desagüe para conectar la lavadora?",
      ayudaBreve: "Son las llaves de agua y el tubo donde descarga la lavadora.",
      fuentePdf: "¿Cuenta con acceso al agua para concetar la la lavadora y el desague?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_ESTUFA_GAS: CuestionarioLugar = {
  servicioId: "instalacion-estufa-gas",
  maximoPreguntas: 3,
  inicial: "existente",
  // El PDF no confirma un monto propio para este SKU; se usa el mismo
  // referencial que las demás estufas ($20) para no dejar la desinstalación
  // sin precio. Ajustar cuando negocio confirme el monto real.
  precioDesinstalacion: 20,
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay una estufa instalada en el lugar?",
      fuentePdf: "¿Ya mantiene una estufa de gas en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", resultado: "estandar", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "gas" },
      ],
    },
    {
      id: "gas",
      texto: "¿Hay una salida de gas para la estufa?",
      ayudaBreve: "Es la conexión con llave o válvula de donde sale el gas.",
      fuentePdf: "¿Cuenta con salida de gas para esta estufa?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "electrica" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) cerca de la estufa?",
      comoIdentifico: AYUDA_110,
      fuentePdf: "¿Cuenta con tomacorriente de 110V detrás o cerca de la estufa?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_ESTUFA_ELECTRICA: CuestionarioLugar = {
  servicioId: "instalacion-estufa-electrica",
  maximoPreguntas: 2,
  inicial: "existente",
  // Sin monto propio del PDF: mismo referencial que sus hermanas ($20).
  precioDesinstalacion: 20,
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay una estufa instalada en el lugar?",
      fuentePdf: "¿Ya mantiene una estufa electríca en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", resultado: "estandar", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "electrica" },
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay una conexión eléctrica de 220 V para la estufa?",
      ayudaBreve: 'Si no estás seguro del voltaje, elige "No estoy seguro".',
      comoIdentifico: AYUDA_220,
      fuentePdf: "¿Cuenta con tomacorriente de 220V para esta estufa?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_ESTUFA_EMPOTRABLE_GAS: CuestionarioLugar = {
  servicioId: "instalacion-estufa-empotrable-gas",
  maximoPreguntas: 2,
  inicial: "existente",
  // Sin monto propio del PDF: mismo referencial que sus hermanas ($20).
  precioDesinstalacion: 20,
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay una estufa empotrable en el lugar?",
      ayudaBreve: "Es la que va encajada en el tope o mueble de la cocina.",
      // PDF: sin estufa empotrable previa, siempre se inspecciona.
      fuentePdf: "¿Cuenta con una estufa empotrable ya en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "hueco", marcaDesinstalacion: true },
        NO_INSPECCION,
      ],
    },
    {
      id: "hueco",
      texto: "¿El espacio donde va la estufa tiene la misma medida que la actual?",
      ayudaBreve: "Si la medida del hueco no coincide, un técnico debe ajustarla.",
      fuentePdf: "¿La medida del hueco de la estufa actual es igual al de la nueva?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_HORNO_EMPOTRABLE: CuestionarioLugar = {
  servicioId: "instalacion-horno-empotrable",
  maximoPreguntas: 2,
  inicial: "existente",
  precioDesinstalacion: 20, // PDF: costo adicional de $20.00
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay un horno empotrable en el lugar?",
      ayudaBreve: "Es el que va encajado en el mueble de la cocina.",
      fuentePdf: "¿Cuenta con un horno empotrable a gas ya en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "hueco", marcaDesinstalacion: true },
        NO_INSPECCION,
      ],
    },
    {
      id: "hueco",
      texto: "¿El espacio donde va el horno tiene la misma medida que el actual?",
      ayudaBreve: "Si la medida del hueco no coincide, un técnico debe ajustarla.",
      fuentePdf: "¿La medida del hueco del horno actual es igual al del nuevo?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_LAVAVAJILLAS: CuestionarioLugar = {
  servicioId: "instalacion-lavavajillas",
  maximoPreguntas: 1,
  inicial: "electrica",
  preguntas: [
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) debajo del fregador?",
      comoIdentifico: AYUDA_110,
      fuentePdf: "¿Cuenta con tomacorriente de 110V debajo del fregador?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_REFRIGERADORA_FRENCH: CuestionarioLugar = {
  servicioId: "instalacion-refrigeradora-french",
  maximoPreguntas: 2,
  inicial: "agua",
  preguntas: [
    {
      id: "agua",
      texto: "¿Hay una salida de agua a menos de 1 metro de donde irá la refrigeradora?",
      ayudaBreve: "La refrigeradora necesita agua para el dispensador y el hielo.",
      fuentePdf: "¿Cuenta con la salida de agua detrás o cerca (menos de 1 metro) de la nevera?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "electrica" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) a menos de 1 metro?",
      comoIdentifico: AYUDA_110,
      fuentePdf: "¿Cuenta con tomacorriente de 110V detrás o cerca (menos de 1 metro) de la nevera?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_VINERA: CuestionarioLugar = {
  servicioId: "instalacion-vinera",
  maximoPreguntas: 1,
  inicial: "electrica",
  preguntas: [
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) cerca de donde irá la vinera?",
      comoIdentifico: AYUDA_110,
      fuentePdf: "¿Cuenta con tomacorriente de 110V detrás o cerca de la vinera?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_CALENTADOR_ELECTRICO: CuestionarioLugar = {
  servicioId: "instalacion-calentador-electrico",
  maximoPreguntas: 3,
  inicial: "existente",
  // Sin monto propio del PDF: mismo referencial que sus hermanas ($20).
  precioDesinstalacion: 20,
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay un calentador de agua en el lugar?",
      fuentePdf: "¿Cuenta con calentador de agua eléctrico en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", resultado: "estandar", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "electrica" },
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay una conexión eléctrica de 220 V donde se instalará el calentador?",
      ayudaBreve: 'Si no estás seguro del voltaje, elige "No estoy seguro".',
      comoIdentifico: AYUDA_220,
      fuentePdf: "¿Cuenta con tomacorriente de 220V donde se va a instalar el calentador?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "agua",
      texto: "¿Hay llaves de agua fría y caliente donde irá el calentador?",
      fuentePdf: "¿Cuenta con salida de agua fría y caliente?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_CALENTADOR_GAS: CuestionarioLugar = {
  servicioId: "instalacion-calentador-gas",
  maximoPreguntas: 3,
  inicial: "existente",
  // Sin monto propio del PDF: mismo referencial que sus hermanas ($20) para
  // no dejar la desinstalación sin precio. Ajustar cuando negocio confirme.
  precioDesinstalacion: 20,
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay un calentador de agua en el lugar?",
      fuentePdf: "¿Cuenta con calentador de agua a gas en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", resultado: "estandar", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "gas" },
      ],
    },
    {
      id: "gas",
      texto: "¿Hay una salida de gas donde se instalará el calentador?",
      ayudaBreve: "Es la conexión con llave o válvula de donde sale el gas.",
      fuentePdf: "¿Cuenta con salida de gas donde se va a instalar el calentador?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "agua",
      texto: "¿Hay llaves de agua fría y caliente donde irá el calentador?",
      fuentePdf: "¿Cuenta con salida de agua fría y caliente?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

// ── Cuestionarios agregados al conectar el catálogo por SKU (mismo PDF,
// hoja Línea Blanca): cubren el resto de la matriz "Depende". Cada SKU del
// catálogo apunta a su cuestionario vía `cuestionarioId` (data/catalogoMipro).

const CUESTIONARIO_AIRE_VENTANA: CuestionarioLugar = {
  servicioId: "instalacion-aire-ventana",
  maximoPreguntas: 4,
  inicial: "donde",
  precioDesinstalacion: 25, // PDF: "Desinstalación de aire acondicionado $25"
  preguntas: [
    {
      id: "donde",
      texto: "¿Dónde se instalará el aire acondicionado?",
      fuentePdf: "¿La instalación del aire es en casa o edificio?",
      opciones: [
        { id: "casa", etiqueta: "Casa", siguiente: "planta" },
        { id: "edificio", etiqueta: "Apartamento o edificio", resultado: "inspeccion" },
      ],
    },
    {
      id: "planta",
      texto: "¿El equipo se instalará en la planta baja?",
      ayudaBreve: "En pisos altos necesitamos revisar el lugar para confirmar que la instalación sea segura.",
      fuentePdf: "¿La instalación en la casa es en planta baja?",
      opciones: [
        { id: "si", etiqueta: "Sí, en planta baja", siguiente: "existente" },
        { id: "no", etiqueta: "No, está en otro piso", resultado: "inspeccion" },
        NS_INSPECCION,
      ],
    },
    {
      id: "existente",
      texto: "¿Ya hay un aire acondicionado instalado en ese lugar?",
      fuentePdf: "¿Dónde se va a instalar el aire ya tiene otro instalado?",
      opciones: [
        { id: "si", etiqueta: "Sí, ya hay un equipo", siguiente: "electrica", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No, es una instalación nueva", siguiente: "electrica" },
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente para el equipo en el lugar de la instalación?",
      ayudaBreve: "Según el modelo puede ser de 110 V o de 220 V; si tienes dudas, elige \"No estoy seguro\".",
      comoIdentifico: AYUDA_220,
      fuentePdf: "¿Cuenta con tomacorriente de 220V o 110V (según aplique para el producto) en el lugar de la instalación?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const PREGUNTA_AGUA_LAVADORA: PreguntaLugar = {
  id: "agua",
  texto: "¿Hay llaves de agua y desagüe para conectar la lavadora?",
  ayudaBreve: "Son las llaves de agua y el tubo donde descarga la lavadora.",
  fuentePdf: "¿Cuenta con acceso al agua para concetar la la lavadora y el desague?",
  opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
};

const CUESTIONARIO_APILADAS: CuestionarioLugar = {
  servicioId: "instalacion-lavadora-secadora-apiladas",
  maximoPreguntas: 4,
  inicial: "tipo",
  precioDesinstalacion: 20, // PDF: costo extra de $20.00
  preguntas: [
    {
      id: "tipo",
      texto: "¿La secadora es a gas o eléctrica?",
      fuentePdf: "¿La secadora es a Gas o Electrica?",
      opciones: [
        { id: "gas", etiqueta: "A gas", siguiente: "g-existente" },
        { id: "electrica", etiqueta: "Eléctrica", siguiente: "e-existente" },
      ],
    },
    {
      id: "g-existente",
      texto: "¿Ya hay una secadora instalada en el lugar?",
      fuentePdf: "¿Ya mantiene una secadora de gas en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "g-gas" },
      ],
    },
    {
      id: "g-gas",
      texto: "¿Hay una salida de gas para la secadora?",
      ayudaBreve: "Es la conexión con llave o válvula de donde sale el gas.",
      fuentePdf: "¿Cuenta con salida de gas para esta secadora?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "e-existente",
      texto: "¿Ya hay una secadora instalada en el lugar?",
      fuentePdf: "¿Ya mantiene una secadora electríca en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "e-electrica" },
      ],
    },
    {
      id: "e-electrica",
      texto: "¿Hay una conexión eléctrica de 220 V para la secadora?",
      ayudaBreve: 'Si no estás seguro del voltaje, elige "No estoy seguro".',
      comoIdentifico: AYUDA_220,
      fuentePdf: "¿Cuenta con la salida electrica de 220V para esta secadora?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    PREGUNTA_AGUA_LAVADORA,
  ],
};

const CUESTIONARIO_CENTRO_LAVADO_GAS: CuestionarioLugar = {
  servicioId: "instalacion-centro-lavado-gas",
  maximoPreguntas: 3,
  inicial: "existente",
  precioDesinstalacion: 20, // PDF: costo extra de $20.00
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay un centro de lavado o una secadora a gas en el lugar?",
      fuentePdf: "¿Ya mantiene una secadora de gas en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "gas" },
      ],
    },
    {
      id: "gas",
      texto: "¿Hay una salida de gas para el equipo?",
      ayudaBreve: "Es la conexión con llave o válvula de donde sale el gas.",
      fuentePdf: "¿Cuenta con salida de gas para esta secadora?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    PREGUNTA_AGUA_LAVADORA,
  ],
};

const CUESTIONARIO_CENTRO_LAVADO_ELECTRICO: CuestionarioLugar = {
  servicioId: "instalacion-centro-lavado-electrico",
  maximoPreguntas: 3,
  inicial: "existente",
  precioDesinstalacion: 20, // PDF: costo extra de $20.00
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay un centro de lavado o una secadora eléctrica en el lugar?",
      fuentePdf: "¿Ya mantiene una secadora electríca en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "electrica" },
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay una conexión eléctrica de 220 V para el equipo?",
      ayudaBreve: 'Si no estás seguro del voltaje, elige "No estoy seguro".',
      comoIdentifico: AYUDA_220,
      fuentePdf: "¿Cuenta con la salida electrica de 220V para esta secadora?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "agua" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    PREGUNTA_AGUA_LAVADORA,
  ],
};

const CUESTIONARIO_ICE_MAKER: CuestionarioLugar = {
  servicioId: "instalacion-ice-maker",
  maximoPreguntas: 2,
  inicial: "agua",
  preguntas: [
    {
      id: "agua",
      texto: "¿Hay una salida de agua a menos de 1 metro de donde irá la nevera?",
      ayudaBreve: "El ice maker necesita una toma de agua cercana.",
      fuentePdf: "¿Cuenta con la salida de agua detrás o cerca (menos de 1 metro) de la nevera?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "electrica" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) a menos de 1 metro?",
      comoIdentifico: AYUDA_110,
      fuentePdf: "¿Cuenta con tomacorriente de 110V detrás o cerca (menos de 1 metro) de la nevera?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_CONGELADOR: CuestionarioLugar = {
  servicioId: "instalacion-congelador",
  maximoPreguntas: 1,
  inicial: "electrica",
  preguntas: [
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) cerca de donde irá el congelador?",
      comoIdentifico: AYUDA_110,
      fuentePdf: "¿Cuenta con tomacorriente de 110V detrás o cerca de la vinera?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_REFRIGERADORA: CuestionarioLugar = {
  // Refrigeradoras de 18/19 pies. El PDF agrega: si la nevera trae ice
  // maker, aplican además las preguntas de Ice Maker (pendiente de motor).
  servicioId: "instalacion-refrigeradora",
  maximoPreguntas: 1,
  inicial: "electrica",
  preguntas: [
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) cerca de donde irá la refrigeradora?",
      comoIdentifico: AYUDA_110,
      fuentePdf: "¿Cuenta con tomacorriente de 110V detrás o cerca de la vinera?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_FABRICADOR_HIELO: CuestionarioLugar = {
  servicioId: "instalacion-fabricador-hielo",
  maximoPreguntas: 1,
  inicial: "agua",
  preguntas: [
    {
      id: "agua",
      texto: "¿Hay salida de agua y un drenaje en el piso donde irá la hielera?",
      ayudaBreve: "El equipo se conecta al agua y descarga en un drenaje del piso.",
      fuentePdf: "¿Cuenta con la salida de agua y drenaje en el piso en el area donde va a instalar la hielera?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_ESTUFA_INDUSTRIAL: CuestionarioLugar = {
  servicioId: "instalacion-estufa-industrial",
  maximoPreguntas: 3,
  inicial: "existente",
  // Sin monto propio del PDF: mismo referencial que sus hermanas ($20).
  precioDesinstalacion: 20,
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay una estufa instalada en el lugar?",
      fuentePdf: "¿Ya mantiene una estufa de gas en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", resultado: "estandar", marcaDesinstalacion: true },
        { id: "no", etiqueta: "No", siguiente: "gas" },
      ],
    },
    {
      id: "gas",
      texto: "¿Hay una salida de gas para la estufa?",
      ayudaBreve: "Es la conexión con llave o válvula de donde sale el gas.",
      fuentePdf: "¿Cuenta con salida de gas para esta estufa?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "electrica" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay una conexión eléctrica de 220 V cerca de la estufa?",
      ayudaBreve: 'Si no estás seguro del voltaje, elige "No estoy seguro".',
      comoIdentifico: AYUDA_220,
      fuentePdf: "¿Cuenta con tomacorriente de 220V detrás o cerca de la estufa?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_ESTUFA_EMPOTRABLE_ELECTRICA: CuestionarioLugar = {
  servicioId: "instalacion-estufa-empotrable-electrica",
  maximoPreguntas: 3,
  inicial: "existente",
  // Sin monto propio del PDF: mismo referencial que sus hermanas ($20).
  precioDesinstalacion: 20,
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay una estufa empotrable en el lugar?",
      ayudaBreve: "Es la que va encajada en el tope o mueble de la cocina.",
      fuentePdf: "¿Cuenta con una estufa empotrable ya en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "hueco", marcaDesinstalacion: true },
        NO_INSPECCION,
      ],
    },
    {
      id: "hueco",
      texto: "¿El espacio donde va la estufa tiene la misma medida que la actual?",
      ayudaBreve: "Si la medida del hueco no coincide, un técnico debe ajustarla.",
      fuentePdf: "¿La medida del hueco de la estufa actual es igual al de la nueva?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "electrica" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay una conexión eléctrica de 220 V para la estufa?",
      ayudaBreve: 'Si no estás seguro del voltaje, elige "No estoy seguro".',
      comoIdentifico: AYUDA_220,
      fuentePdf: "¿Cuenta con tomacorriente de 220V para esta estufa?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_HORNO_ELECTRICO: CuestionarioLugar = {
  servicioId: "instalacion-horno-empotrable-electrico",
  maximoPreguntas: 3,
  inicial: "existente",
  precioDesinstalacion: 20, // PDF: costo adicional de $20.00
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay un horno empotrable en el lugar?",
      ayudaBreve: "Es el que va encajado en el mueble de la cocina.",
      fuentePdf: "¿Cuenta con una estufa empotrable ya en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "hueco", marcaDesinstalacion: true },
        NO_INSPECCION,
      ],
    },
    {
      id: "hueco",
      texto: "¿El espacio donde va el horno tiene la misma medida que el actual?",
      ayudaBreve: "Si la medida del hueco no coincide, un técnico debe ajustarla.",
      fuentePdf: "¿La medida del hueco de la estufa actual es igual al de la nueva?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "electrica" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay una conexión eléctrica de 220 V detrás del horno?",
      ayudaBreve: 'Si no estás seguro del voltaje, elige "No estoy seguro".',
      comoIdentifico: AYUDA_220,
      fuentePdf: "¿Cuenta con tomacorriente de 220V para esta estufa?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const AYUDA_110_ALTO: AyudaLugar = {
  titulo: "¿Dónde debe estar el tomacorriente?",
  descripcion:
    "Arriba de donde irá el equipo, entre 1.70 m y 1.90 m sobre el piso. Es el enchufe común de la casa (110 V).",
  diagrama: "voltaje",
};

const CUESTIONARIO_MICROONDAS_EXTRACTOR: CuestionarioLugar = {
  servicioId: "instalacion-microondas-extractor",
  maximoPreguntas: 3,
  inicial: "existente",
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay un extractor instalado en ese lugar?",
      fuentePdf: "¿Cuenta con un extractor existente en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí, ya hay un extractor", resultado: "estandar" },
        { id: "no", etiqueta: "No", siguiente: "mueble" },
      ],
    },
    {
      id: "mueble",
      texto: "¿Hay un mueble aéreo donde irá el extractor?",
      ayudaBreve: "Es el gabinete alto de la cocina donde se fija el equipo.",
      fuentePdf: "¿Cuenta con un mueble aereo para el extractor?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "electrica" },
        { id: "no", etiqueta: "No", resultado: "inspeccion" },
        NS_INSPECCION,
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) arriba de donde irá el equipo?",
      comoIdentifico: AYUDA_110_ALTO,
      fuentePdf: "¿Cuenta con tomacorriente de 110V arriba donde se instalará el equipo (entre un 1.70m y 1.90m sobre el piso?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_CAMPANA_PARED: CuestionarioLugar = {
  servicioId: "instalacion-campana-pared",
  maximoPreguntas: 2,
  inicial: "existente",
  preguntas: [
    {
      id: "existente",
      texto: "¿Ya hay un extractor instalado en ese lugar?",
      fuentePdf: "¿Cuenta con un extractor existente en el lugar?",
      opciones: [
        { id: "si", etiqueta: "Sí, ya hay un extractor", resultado: "estandar" },
        { id: "no", etiqueta: "No", siguiente: "electrica" },
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) arriba de donde irá el equipo?",
      comoIdentifico: AYUDA_110_ALTO,
      fuentePdf: "¿Cuenta con tomacorriente de 110V arriba donde se instalará el equipo (entre un 1.70m y 1.90m sobre el piso?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIO_EXTRACTOR_ISLA: CuestionarioLugar = {
  servicioId: "instalacion-extractor-isla",
  maximoPreguntas: 3,
  inicial: "refuerzo",
  preguntas: [
    {
      id: "refuerzo",
      texto: "¿El techo tiene refuerzo para colgar el extractor?",
      ayudaBreve: "El extractor de isla se cuelga del techo: necesita losa o un refuerzo si es gypsum.",
      fuentePdf: "¿Cuenta con refuerzo en el techo para la instalación del extractor?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "electrica" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "electrica",
      texto: "¿Hay un tomacorriente común (110 V) arriba de donde irá el equipo?",
      comoIdentifico: AYUDA_110_ALTO,
      fuentePdf: "¿Cuenta con tomacorriente de 110V arriba donde se sin instalará el equipo?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "ducto" },
        NO_INSPECCION,
        NS_INSPECCION,
      ],
    },
    {
      id: "ducto",
      texto: "¿El techo ya tiene el ducto de desfogue instalado?",
      ayudaBreve: "Es el tubo por donde el extractor saca el aire hacia afuera.",
      fuentePdf: "¿Cuenta con ducto de desfogue ya instalado en el techo para el extractor?",
      opciones: [SI_ESTANDAR, NO_INSPECCION, NS_INSPECCION],
    },
  ],
};

const CUESTIONARIOS: Record<string, CuestionarioLugar> = {
  "instalacion-aire-ventana": CUESTIONARIO_AIRE_VENTANA,
  "instalacion-lavadora-secadora-apiladas": CUESTIONARIO_APILADAS,
  "instalacion-centro-lavado-gas": CUESTIONARIO_CENTRO_LAVADO_GAS,
  "instalacion-centro-lavado-electrico": CUESTIONARIO_CENTRO_LAVADO_ELECTRICO,
  "instalacion-ice-maker": CUESTIONARIO_ICE_MAKER,
  "instalacion-congelador": CUESTIONARIO_CONGELADOR,
  "instalacion-refrigeradora": CUESTIONARIO_REFRIGERADORA,
  "instalacion-fabricador-hielo": CUESTIONARIO_FABRICADOR_HIELO,
  "instalacion-estufa-industrial": CUESTIONARIO_ESTUFA_INDUSTRIAL,
  "instalacion-estufa-empotrable-electrica": CUESTIONARIO_ESTUFA_EMPOTRABLE_ELECTRICA,
  "instalacion-horno-empotrable-electrico": CUESTIONARIO_HORNO_ELECTRICO,
  "instalacion-microondas-extractor": CUESTIONARIO_MICROONDAS_EXTRACTOR,
  "instalacion-campana-pared": CUESTIONARIO_CAMPANA_PARED,
  "instalacion-extractor-isla": CUESTIONARIO_EXTRACTOR_ISLA,
  "instalacion-aire": CUESTIONARIO_AIRE,
  "instalacion-secadora-gas": CUESTIONARIO_SECADORA_GAS,
  "instalacion-secadora-electrica": CUESTIONARIO_SECADORA_ELECTRICA,
  "instalacion-lavadora": CUESTIONARIO_LAVADORA,
  "instalacion-estufa-gas": CUESTIONARIO_ESTUFA_GAS,
  "instalacion-estufa-electrica": CUESTIONARIO_ESTUFA_ELECTRICA,
  "instalacion-estufa-empotrable-gas": CUESTIONARIO_ESTUFA_EMPOTRABLE_GAS,
  "instalacion-horno-empotrable": CUESTIONARIO_HORNO_EMPOTRABLE,
  "instalacion-lavavajillas": CUESTIONARIO_LAVAVAJILLAS,
  "instalacion-refrigeradora-french": CUESTIONARIO_REFRIGERADORA_FRENCH,
  "instalacion-vinera": CUESTIONARIO_VINERA,
  "instalacion-calentador-electrico": CUESTIONARIO_CALENTADOR_ELECTRICO,
  "instalacion-calentador-gas": CUESTIONARIO_CALENTADOR_GAS,
};

// ── Resolución por artículo del catálogo ──
// Los artículos con evaluación "depende" declaran su `cuestionarioId` en la
// jerarquía (data/catalogoMipro): varios SKUs comparten un mismo cuestionario
// (todos los aires split usan el de aire acondicionado). El id del servicio
// en la app se calcula igual que en el catálogo (idDeArticulo).

const CUESTIONARIO_POR_SERVICIO: Record<string, string> = (() => {
  const mapa: Record<string, string> = {};
  for (const categoria of DEPARTAMENTO_MIPRO.categorias) {
    for (const sub of categoria.subcategorias) {
      for (const articulo of sub.articulos) {
        if (articulo.cuestionarioId) {
          mapa[idDeArticulo(articulo)] = articulo.cuestionarioId;
        }
      }
    }
  }
  return mapa;
})();

export function cuestionarioDe(servicioId: string): CuestionarioLugar | null {
  const directo = CUESTIONARIOS[servicioId];
  if (directo) return directo;
  const porArticulo = CUESTIONARIO_POR_SERVICIO[servicioId];
  return porArticulo ? CUESTIONARIOS[porArticulo] ?? null : null;
}

export function tieneCuestionario(servicioId: string): boolean {
  return cuestionarioDe(servicioId) !== null;
}

/**
 * Validación ligera de la configuración (la estructural completa llega con
 * el motor): ids únicos, referencias existentes y toda opción con destino.
 */
export function validarCuestionario(c: CuestionarioLugar): string[] {
  const errores: string[] = [];
  const ids = new Set<string>();
  for (const p of c.preguntas) {
    if (ids.has(p.id)) errores.push(`Pregunta repetida: ${p.id}`);
    ids.add(p.id);
  }
  if (!ids.has(c.inicial)) errores.push(`La pregunta inicial "${c.inicial}" no existe.`);
  for (const p of c.preguntas) {
    if (p.opciones.length < 2) errores.push(`"${p.id}" tiene menos de dos opciones.`);
    for (const o of p.opciones) {
      const tieneSiguiente = Boolean(o.siguiente);
      const tieneResultado = Boolean(o.resultado);
      if (tieneSiguiente === tieneResultado) {
        errores.push(`"${p.id}/${o.id}" debe tener siguiente pregunta o resultado, no ambos ni ninguno.`);
      }
      if (o.siguiente && !ids.has(o.siguiente)) {
        errores.push(`"${p.id}/${o.id}" apunta a una pregunta inexistente: ${o.siguiente}`);
      }
    }
  }
  return errores;
}

export function todosLosCuestionarios(): CuestionarioLugar[] {
  return Object.values(CUESTIONARIOS);
}

// ── Carga con estados (revisión y QA) ──
// ESCENARIOS DE DEMO (vía query del hash): ...?lugar=error | cargando

export type EscenarioLugar = "ok" | "error" | "cargando";

export function leerEscenarioLugar(search: string): EscenarioLugar {
  const crudo = new URLSearchParams(search).get("lugar");
  return crudo === "error" || crudo === "cargando" ? crudo : "ok";
}

export function cargarCuestionario(
  servicioId: string,
  escenario: EscenarioLugar,
): Promise<CuestionarioLugar | null> {
  return new Promise((resolve, reject) => {
    if (escenario === "cargando") return; // nunca resuelve: para revisar skeletons
    setTimeout(() => {
      if (escenario === "error") reject(new Error("No se pudo cargar el cuestionario"));
      else resolve(cuestionarioDe(servicioId));
    }, 300);
  });
}
