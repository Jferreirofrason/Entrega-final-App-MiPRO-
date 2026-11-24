import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Package, Pencil } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { HojaAcciones } from "../components/pago/HojaAcciones";
import { STR } from "../i18n/strings";
import { buscarProductoPorId } from "../data/compras";
import { buscarServicioCatalogo } from "../data/catalogo";
import { guardarBorrador } from "../data/borradorGarantia";
import {
  guardarBorradorServicio,
  leerBorradorServicio,
} from "../data/borradorServicio";
import {
  compraCompleta,
  contextoDeCompra,
  esManual,
  formatearFechaDeCompra,
  productoSolicitudDesdeCompra,
  puedeEditarse,
  puedeSolicitarGarantia,
  puedeSolicitarServicio,
  servicioCompatibleUnico,
  type ProductoPropio,
} from "../logic/compras";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

// El detalle de un producto. UNO SOLO para los dos orígenes.
//
// No hay una pantalla para las compras y otra para lo cargado a mano: hay
// una, y lo que cambia es QUÉ SE SABE del producto y qué se puede hacer con
// eso. De una compra, los datos vienen del comercio y se muestran sin
// tocar; de un producto cargado a mano, los cargó la persona y los puede
// corregir.
//
// Las acciones son las mismas de la lista y hacen lo mismo: precargan los
// flujos que ya existen. Acá no se inventa un flujo de detalle.
export function MiProducto() {
  const navigate = useNavigate();
  const { id } = useParams();
  // Al volver de editar, esta pantalla se vuelve a montar y lee de nuevo:
  // por eso la corrección ya se ve, sin recargar nada.
  const producto = useMemo(() => (id ? buscarProductoPorId(id) : null), [id]);
  const [eligiendo, setEligiendo] = useState(false);

  const volverALista = () => navigate("/mis-productos");

  if (!producto) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
        {cabecera(volverALista, STR.compras.detalleTitulo)}
        <div className="px-6 pt-8 flex flex-col items-start" style={{ gap: "16px" }}>
          <p style={{ ...meta, fontSize: "15px", lineHeight: "21px", color: "var(--gray-60)", margin: 0 }}>
            {STR.compras.detalleNoEncontrado}
          </p>
          <button
            type="button"
            onClick={volverALista}
            className="border transition-transform active:scale-[0.99]"
            style={{
              ...meta,
              minHeight: "44px",
              padding: "0 16px",
              borderRadius: "10px",
              borderColor: "var(--gray-20)",
              backgroundColor: "var(--primary-white)",
              fontSize: "14px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              cursor: "pointer",
            }}
          >
            {STR.compras.detalleVolverALista}
          </button>
        </div>
      </div>
    );
  }

  const manual = esManual(producto);
  const fecha = formatearFechaDeCompra(producto.purchaseDate);
  const conServicio = puedeSolicitarServicio(producto);
  const conGarantia = puedeSolicitarGarantia(producto);
  const unico = servicioCompatibleUnico(producto);
  const compatibles = (producto.eligibleServiceIds ?? [])
    .map((sid) => ({ id: sid, servicio: buscarServicioCatalogo(sid) }))
    .filter((c) => c.servicio !== null);

  const pedirGarantia = () => {
    guardarBorrador({ producto: productoSolicitudDesdeCompra(producto) });
    navigate("/garantia/producto", {
      state: { desdeCompra: true, manual, compraCompleta: compraCompleta(producto) },
    });
  };

  const entrarAlServicio = (servicioId: string) => {
    const borrador = leerBorradorServicio(servicioId);
    guardarBorradorServicio({ ...borrador, compra: contextoDeCompra(producto) });
    navigate(`/catalogo/${servicioId}`);
  };

  const pedirServicio = () => {
    if (unico) entrarAlServicio(unico);
    else setEligiendo(true);
  };

  /**
   * Una fila de dato. Un dato que no está se MUESTRA vacío y no se esconde:
   * en un producto cargado a mano, ver qué falta es la mitad del motivo
   * para entrar acá.
   */
  const dato = (etiqueta: string, valor: string | undefined, mostrarVacio = true) => {
    if (!valor && !mostrarVacio) return null;
    return (
      <div
        key={etiqueta}
        className="flex items-baseline justify-between"
        style={{ gap: "16px", padding: "11px 0", borderTop: "1px solid var(--gray-8)" }}
      >
        <span style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)", flexShrink: 0 }}>
          {etiqueta}
        </span>
        <span
          className="text-right min-w-0"
          style={{
            ...meta,
            fontSize: "14px",
            lineHeight: "19px",
            fontWeight: valor ? "var(--font-weight-medium)" : "var(--font-weight-normal)",
            color: valor ? "var(--primary-black)" : "var(--gray-40)",
          }}
        >
          {valor || STR.compras.detalleSinDato}
        </span>
      </div>
    );
  };

  const bloque = (titulo: string, hijos: React.ReactNode, pie?: string) => (
    <section className="flex flex-col">
      <h3
        style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: "16px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--primary-black)",
          margin: "0 0 4px",
        }}
      >
        {titulo}
      </h3>
      {hijos}
      {pie && (
        <p style={{ ...meta, fontSize: "12px", lineHeight: "17px", color: "var(--gray-60)", margin: "10px 0 0" }}>
          {pie}
        </p>
      )}
    </section>
  );

  const botonSecundario = (texto: string, onClick: () => void, icono?: React.ReactNode) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center border transition-transform active:scale-[0.99]"
      style={{
        ...meta,
        gap: "8px",
        width: "100%",
        minHeight: "44px",
        padding: "0 14px",
        borderRadius: "12px",
        borderColor: "var(--gray-20)",
        backgroundColor: "var(--primary-white)",
        fontSize: "14px",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--primary-black)",
        cursor: "pointer",
      }}
    >
      {icono}
      {texto}
    </button>
  );

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--primary-white)" }}>
      {cabecera(() => navigate(-1), STR.compras.detalleTitulo)}

      <div className="flex flex-col px-6 pt-5 pb-8" style={{ gap: "24px" }}>
        {/* Identidad: foto grande, nombre y, si lo cargó la persona, la
            etiqueta que lo dice. La foto es cuadrada y recortada igual que
            en la lista; sin foto, el mismo respaldo. */}
        <div className="flex flex-col" style={{ gap: "14px" }}>
          {producto.image ? (
            <ImageWithFallback
              src={producto.image}
              alt=""
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                maxHeight: "220px",
                objectFit: "cover",
                borderRadius: "14px",
                backgroundColor: "var(--gray-3)",
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex items-center justify-center"
              style={{
                width: "100%",
                height: "140px",
                borderRadius: "14px",
                backgroundColor: "var(--gray-3)",
              }}
            >
              <Package size={32} strokeWidth={1.5} color="var(--gray-40)" />
            </div>
          )}

          <div className="flex flex-col" style={{ gap: "6px" }}>
            {/* El nombre va en caja normal y en la tipografía de texto: un
                nombre de producto no es un título del sistema. Hay que
                decirlo explícito porque el tema pone TODOS los encabezados
                en Bebas mayúsculas (theme.css), y "Aire acondicionado
                Panasonic 12,000 BTU Inverter" en mayúsculas con tracking es
                ilegible. Es h2 porque el h1 de la pantalla es el título. */}
            <h2
              style={{
                ...meta,
                fontSize: "20px",
                lineHeight: "26px",
                fontWeight: "var(--font-weight-medium)",
                letterSpacing: "normal",
                textTransform: "none",
                color: "var(--primary-black)",
                margin: 0,
              }}
            >
              {producto.name}
            </h2>
            {manual && (
              <span
                className="self-start"
                style={{
                  ...meta,
                  fontSize: "12px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--gray-60)",
                  backgroundColor: "var(--gray-3)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                }}
              >
                {STR.compras.agregadoAMano}
              </span>
            )}
          </div>
        </div>

        {/* Lo que se sabe del producto. En una compra el SKU vive acá
            porque identifica al producto, no a la compra. */}
        {bloque(
          STR.compras.detalleDatos,
          <div className="flex flex-col">
            {!manual && dato(STR.compras.detalleSku, producto.sku, false)}
            {dato(STR.compras.detalleMarca, producto.brand, manual)}
            {dato(STR.compras.detalleCategoria, producto.category, manual)}
            {manual && dato(STR.compras.detalleModelo, producto.modelo)}
            {dato(STR.compras.detalleSerie, producto.serialNumber, manual)}
          </div>,
        )}

        {/* Los datos de la compra: solo existen si hubo una compra, y se
            muestran sin tocar. Que no se editen no es una restricción de
            permisos, es que corregirlos acá no corregiría la factura. */}
        {!manual &&
          bloque(
            STR.compras.detalleCompra,
            <div className="flex flex-col">
              {dato(STR.compras.detalleTienda, producto.store, false)}
              {dato(STR.compras.detalleFecha, fecha ?? undefined, false)}
              {dato(STR.compras.detalleFactura, producto.invoiceNumber, false)}
              {dato(STR.compras.detalleTicket, producto.ticketNumber, false)}
            </div>,
            STR.compras.detalleCompraFija,
          )}

        {/* Acciones. Las mismas de la lista, y hacen lo mismo. */}
        <div className="flex flex-col" style={{ gap: "8px" }}>
          {conServicio && (
            <button
              type="button"
              onClick={pedirServicio}
              className="border-none transition-transform active:scale-[0.99]"
              style={{
                ...meta,
                width: "100%",
                minHeight: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--primary-yellow)",
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                cursor: "pointer",
              }}
            >
              {STR.compras.solicitarServicio}
            </button>
          )}
          {conGarantia && botonSecundario(STR.compras.solicitarGarantia, pedirGarantia)}
          {puedeEditarse(producto) &&
            botonSecundario(
              STR.compras.editar,
              () => navigate(`/mis-productos/${producto.id}/editar`),
              <Pencil size={16} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />,
            )}
        </div>
      </div>

      <HojaAcciones
        abierto={eligiendo}
        onCerrar={() => setEligiendo(false)}
        titulo={STR.compras.elegirServicio}
      >
        <div style={{ padding: "0 24px", paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}>
          <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--primary-black)", margin: 0 }}>
            {STR.compras.elegirServicioTexto}
          </p>
          <p
            className="line-clamp-2"
            style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)", margin: "4px 0 12px" }}
          >
            {producto.name}
          </p>
          <div className="flex flex-col">
            {compatibles.map(({ id: sid, servicio }, i) => (
              <button
                key={sid}
                type="button"
                onClick={() => {
                  setEligiendo(false);
                  entrarAlServicio(sid);
                }}
                className="text-left border-none bg-transparent w-full"
                style={{
                  ...meta,
                  minHeight: "52px",
                  padding: "14px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--gray-8)",
                  fontSize: "15px",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--primary-black)",
                  cursor: "pointer",
                }}
              >
                {servicio
                  ? servicio.categoria
                    ? `${servicio.categoria} · ${servicio.nombre}`
                    : servicio.nombre
                  : sid}
              </button>
            ))}
          </div>
        </div>
      </HojaAcciones>
    </div>
  );
}

/** La cabecera del detalle, igual que la del resto de las pantallas hijas. */
function cabecera(onVolver: () => void, titulo: string) {
  return (
    <header
      className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
    >
      <button
        type="button"
        onClick={onVolver}
        aria-label={STR.compras.detalleVolver}
        className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
        style={{
          backgroundColor: "var(--primary-white)",
          borderColor: "var(--gray-20)",
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
      </button>
      <h1
        className="truncate flex-1"
        style={{
          fontFamily: "'Bebas Neue', Arial, sans-serif",
          fontSize: "20px",
          fontWeight: "var(--font-weight-normal)",
          letterSpacing: "1px",
          color: "var(--primary-black)",
          margin: 0,
          textTransform: "uppercase",
        }}
      >
        {titulo}
      </h1>
    </header>
  );
}
