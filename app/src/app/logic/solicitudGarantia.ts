// Dominio del flujo "Solicitar ayuda por garantía".
//
// Módulo puro (node --test): tipos del borrador, validaciones en lenguaje
// claro, categorías de problema y generación del número de solicitud.
//
// Decisiones de producto documentadas:
// - El flujo manual comienza por el número de factura (orden confirmado en
//   la sesión de producto). Sin factura no se puede crear el reclamo desde
//   la app: no existe la opción de continuar sin comprobante. Cuando exista
//   la integración con facturas, este dato va a recuperar los productos y
//   autocompletar el resto (NO se simula hoy).
// - "SKU" nunca se muestra: el campo visible es "Código de producto".
// - Factura y fecha de compra son obligatorias; el número de serie es el
//   único dato opcional del producto (con su escape "No encuentro este dato").
// - Las categorías de problema son una PROPUESTA pendiente de validación con
//   operaciones; el aviso de seguridad es un mecanismo listo, asignado como
//   demostración a una sola categoría hasta que el negocio defina el mapa.

export interface ProductoSolicitud {
  /** Id del producto registrado, si se eligió de la lista. */
  registradoId?: string;
  nombre: string;
  /** Número de factura de compra; primero en el formulario manual. */
  numeroFactura?: string;
  /** Se muestra como "Código de producto" (nunca "SKU"). */
  codigoProducto?: string;
  tipo?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  /** Rango aproximado (legado de la primera versión del formulario). */
  compraAproximada?: string;
  /** Fecha de compra (ISO, solo día), del comprobante. */
  fechaCompra?: string;
  /** Comercio donde se compró, cuando el cliente lo recuerda. */
  comercio?: string;
  /** Nombre con el que el cliente identifica el producto. */
  alias?: string;
  /** Nombre del archivo de la foto de etiqueta, como evidencia. */
  fotoEtiqueta?: string;
  /**
   * Lo que trajo la compra cuando el caso se abrió desde Mis productos.
   *
   * Se conserva aparte de los campos editables: si la persona corrige la
   * factura o la marca en el formulario, el dato de origen sigue viajando
   * en el payload y quien atienda el caso ve la diferencia. La app NUNCA lo
   * reescribe con lo tipeado.
   */
  compraOriginal?: {
    productoId: string;
    sku: string;
    tienda: string;
    fechaCompra: string;
    numeroFactura: string;
    numeroTicket?: string;
    marca?: string;
  };
}

export type EstadoAdjunto = "cargando" | "listo" | "fallo";

export interface AdjuntoSolicitud {
  id: string;
  nombre: string;
  estado: EstadoAdjunto;
}

export interface ProblemaSolicitud {
  categoria: string;
  descripcion?: string;
  adjuntos: AdjuntoSolicitud[];
}

export interface ContactoSolicitud {
  nombre: string;
  telefono: string;
}

export interface DireccionSolicitud {
  id: string;
  etiqueta: string;
  direccion: string;
  referencia?: string;
}

export interface BorradorGarantia {
  producto?: ProductoSolicitud;
  problema?: ProblemaSolicitud;
  contacto?: ContactoSolicitud;
  /** Opcional: a quién contactamos si el titular no puede atender. */
  contactoAlternativo?: ContactoSolicitud;
  direccion?: DireccionSolicitud;
}

export interface CategoriaProblema {
  id: string;
  etiqueta: string;
  /** Instrucción preventiva aprobada; solo para categorías con riesgo. */
  avisoSeguridad?: string;
}

// PROPUESTA pendiente de validación con operaciones (no es taxonomía
// productiva). El aviso de "Pierde agua" demuestra el mecanismo de seguridad.
export const CATEGORIAS_PROBLEMA: CategoriaProblema[] = [
  { id: "no-enciende", etiqueta: "No enciende" },
  { id: "no-funciona-bien", etiqueta: "No funciona correctamente" },
  { id: "ruido-extrano", etiqueta: "Hace un ruido extraño" },
  {
    id: "pierde-agua",
    etiqueta: "Pierde agua",
    avisoSeguridad:
      "Por seguridad, desconecta el producto y no intentes repararlo por tu cuenta.",
  },
  { id: "muestra-error", etiqueta: "Muestra un error" },
  { id: "esta-danado", etiqueta: "Está dañado" },
  { id: "otro", etiqueta: "Otro problema" },
];

export function categoriaPorId(id: string): CategoriaProblema | null {
  return CATEGORIAS_PROBLEMA.find((c) => c.id === id) ?? null;
}

export const RANGOS_COMPRA = [
  "Menos de 1 año",
  "Entre 1 y 2 años",
  "Más de 2 años",
  "No lo sé",
];

// ── Validaciones (mensajes en lenguaje claro, nunca "campo inválido") ──

export function validarPaso1(borrador: BorradorGarantia): string[] {
  const errores: string[] = [];
  const p = borrador.producto;
  if (!p) {
    errores.push("Elige un producto o ingresa sus datos para continuar.");
    return errores;
  }
  // Producto cargado a mano: se piden TODOS los datos menos el número de
  // serie, que es el único opcional del formulario. Es el dato más difícil
  // de encontrar (etiqueta chica, a veces detrás del equipo) y exigirlo
  // dejaría a alguien sin poder pedir su garantía. El resto se pide porque
  // define la cobertura, y después del envío la app no tiene cómo pedirlo.
  //
  // Un producto elegido de los registrados ya trae sus datos: ahí no se
  // vuelve a pedir nada.
  if (p.registradoId) return errores;

  const faltantes: [string, string][] = [
    [(p.numeroFactura ?? "").trim(), "Ingresa el número de factura para continuar."],
    [(p.fechaCompra ?? "").trim(), "Ingresa la fecha de compra para continuar."],
    [(p.comercio ?? "").trim(), "Indica dónde compraste el producto."],
    [(p.marca ?? "").trim(), "Selecciona la marca del producto."],
    [(p.tipo ?? "").trim(), "Selecciona el tipo de producto para continuar."],
    [(p.codigoProducto ?? "").trim(), "Ingresa el código de producto."],
    [(p.modelo ?? "").trim(), "Ingresa el modelo del producto."],
    [(p.alias ?? "").trim(), "Ponle un nombre al producto para reconocerlo."],
  ];
  for (const [valor, mensaje] of faltantes) {
    if (!valor) errores.push(mensaje);
  }
  return errores;
}

export function validarPaso2(borrador: BorradorGarantia): string[] {
  const errores: string[] = [];
  if (!borrador.problema?.categoria) {
    errores.push("Selecciona qué está pasando con el producto para continuar.");
  }
  return errores;
}

const TELEFONO_VALIDO = /[0-9]{4}/;

/**
 * Alta de dirección del flujo de garantía: solo nombre, provincia y
 * distrito son obligatorios (el corregimiento es opcional). Más simple que
 * la dirección de un servicio, que además pide calle y casa.
 */
/**
 * LEGADO. El alta de dirección de garantía usa el mismo formulario que el
 * agendamiento de un servicio (components/agendar/FormularioDireccion) y,
 * con él, la misma validación: validarDireccionNueva(). Esta versión
 * recortada quedó sin uso en la app; se conserva porque documenta qué
 * pedía el flujo cuando tenía formulario propio.
 */
export function validarDireccionGarantia(d: { alias: string; provincia: string; distrito: string }): string[] {
  const errores: string[] = [];
  if (!d.alias.trim()) errores.push("Ponle un nombre a la dirección, por ejemplo, Casa.");
  if (!d.provincia.trim()) errores.push("Indica la provincia.");
  if (!d.distrito.trim()) errores.push("Indica el distrito.");
  return errores;
}

export function validarPaso3(borrador: BorradorGarantia): string[] {
  const errores: string[] = [];
  if (!borrador.contacto?.nombre?.trim()) {
    errores.push("Escribe el nombre de la persona de contacto.");
  }
  if (!borrador.contacto?.telefono || !TELEFONO_VALIDO.test(borrador.contacto.telefono)) {
    errores.push("Escribe un teléfono para poder contactarte.");
  }
  if (!borrador.direccion) {
    errores.push("Elige dónde se encuentra el producto.");
  }
  const alt = borrador.contactoAlternativo;
  if (alt && (alt.nombre.trim() || alt.telefono.trim())) {
    if (alt.nombre.trim() && !alt.telefono.trim()) {
      errores.push("Agrega el teléfono del contacto alternativo.");
    }
    if (!alt.nombre.trim() && alt.telefono.trim()) {
      errores.push("Agrega el nombre del contacto alternativo.");
    }
    if (alt.telefono.trim() && !TELEFONO_VALIDO.test(alt.telefono)) {
      errores.push("Revisa el teléfono del contacto alternativo.");
    }
  }
  return errores;
}

export function listaParaEnviar(borrador: BorradorGarantia): boolean {
  return (
    validarPaso1(borrador).length === 0 &&
    validarPaso2(borrador).length === 0 &&
    validarPaso3(borrador).length === 0
  );
}

// ── Progreso ──

export function progresoDePaso(paso: 1 | 2 | 3 | 4): {
  texto: string;
  titulo: string;
  porcentaje: number;
} {
  const titulos = {
    1: "Elegir producto",
    2: "Contar el problema",
    3: "Contacto y dirección",
    4: "Revisar y enviar",
  } as const;
  const total = 4;
  return {
    texto: `Paso ${paso} de ${total}`,
    titulo: titulos[paso],
    porcentaje: Math.round((paso / total) * 100),
  };
}

// ── Número de solicitud ──

/** GAR-<año>-<secuencia de 4 dígitos>. Puro: recibe la fecha y una semilla. */
export function generarNumeroSolicitud(fecha: Date, semilla: number): string {
  const secuencia = String(Math.abs(semilla) % 10000).padStart(4, "0");
  return `GAR-${fecha.getFullYear()}-${secuencia}`;
}
