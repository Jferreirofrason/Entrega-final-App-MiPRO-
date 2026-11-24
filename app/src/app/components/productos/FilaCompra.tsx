import { useState } from "react";
import { ChevronRight, Package } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { HojaAcciones } from "../pago/HojaAcciones";
import { STR } from "../../i18n/strings";
import { buscarServicioCatalogo } from "../../data/catalogo";
import {
  esManual,
  formatearFechaDeCompra,
  puedeSolicitarGarantia,
  puedeSolicitarServicio,
  servicioCompatibleUnico,
  type ProductoPropio,
} from "../../logic/compras";

const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

// Una ficha de Mis productos.
//
// Estructura: arriba miniatura + texto, abajo las acciones en una sola
// línea. Las acciones ocupan el ANCHO COMPLETO de la ficha y no la columna
// del texto: a 390 px esa diferencia (72 px de miniatura más el gap) es
// justo lo que decide si los dos botones entran al lado o se apilan.
//
// La miniatura se alinea arriba con el título y nunca se estira al alto de
// la ficha: una foto deformada se lee como un error de carga.
//
// La ficha entera NO es un enlace: lleva botones adentro y un bloque
// clickeable con botones deja el toque en una zona ambigua.
export function FilaCompra({
  producto,
  onGarantia,
  onServicio,
  onAbrir,
}: {
  producto: ProductoPropio;
  onGarantia: (p: ProductoPropio) => void;
  /** El servicio ya elegido: con uno solo compatible, es ese. */
  onServicio: (p: ProductoPropio, servicioId: string) => void;
  /** Abrir el detalle: la zona de datos de la ficha. */
  onAbrir: (p: ProductoPropio) => void;
}) {
  const [eligiendo, setEligiendo] = useState(false);

  const fecha = formatearFechaDeCompra(producto.purchaseDate);
  const conServicio = puedeSolicitarServicio(producto);
  const conGarantia = puedeSolicitarGarantia(producto);
  const unico = servicioCompatibleUnico(producto);
  const compatibles = (producto.eligibleServiceIds ?? [])
    .map((id) => ({ id, servicio: buscarServicioCatalogo(id) }))
    .filter((c) => c.servicio !== null);

  // La segunda línea dice lo que se sabe del producto, y nada más: de una
  // compra, dónde y cuándo; de uno cargado a mano, que lo cargó la persona.
  const procedencia = esManual(producto)
    ? STR.compras.agregadoAMano
    : producto.store && fecha
      ? STR.compras.tiendaYFecha(producto.store, fecha)
      : (producto.store ?? null);

  const pedirServicio = () => {
    // Con un solo servicio compatible no hay nada que elegir: el flujo
    // arranca. Con varios, la persona decide cuál antes de entrar.
    if (unico) onServicio(producto, unico);
    else setEligiendo(true);
  };

  const estiloBoton = {
    ...meta,
    flex: "1 1 0",
    minWidth: "0",
    minHeight: "44px",
    padding: "0 12px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--primary-black)",
    cursor: "pointer",
  } as const;

  return (
    <div
      className="flex flex-col"
      style={{
        gap: "12px",
        padding: "12px",
        borderRadius: "14px",
        border: "1px solid var(--gray-8)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* La zona de datos abre el detalle; los botones de abajo hacen lo
          suyo. Son DOS controles distintos y separados, no una ficha que
          dispara dos cosas según dónde caiga el dedo. El chevron es la
          única señal que se agrega: alcanza, y un "Ver detalle" sería un
          tercer botón compitiendo con los dos que importan. */}
      <button
        type="button"
        onClick={() => onAbrir(producto)}
        aria-label={STR.compras.verDetalle(producto.name)}
        className="flex items-start text-left border-none bg-transparent w-full transition-opacity active:opacity-70"
        style={{ gap: "12px", padding: 0, cursor: "pointer" }}
      >
        {/* Miniatura 1:1 de medida fija, recortada con cover: todas las
            fichas alinean igual venga la foto con la proporción que venga.
            Nunca se estira ni se deforma.

            Sin foto se dibuja un respaldo explícito y no un <img> vacío: un
            recuadro gris con el ícono de producto se lee como "todavía no
            hay foto", mientras que una imagen rota se lee como un error. */}
        {producto.image ? (
          <ImageWithFallback
            src={producto.image}
            alt=""
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "10px",
              objectFit: "cover",
              backgroundColor: "var(--gray-3)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex items-center justify-center shrink-0"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "10px",
              backgroundColor: "var(--gray-3)",
            }}
          >
            <Package size={24} strokeWidth={1.5} color="var(--gray-40)" />
          </div>
        )}

        <div className="flex flex-col min-w-0" style={{ gap: "2px" }}>
          <p
            className="line-clamp-2"
            style={{
              ...meta,
              fontSize: "15px",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--primary-black)",
              lineHeight: "20px",
              margin: 0,
            }}
          >
            {producto.name}
          </p>
          {producto.sku && (
            <p
              className="truncate"
              style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)", margin: 0 }}
            >
              {STR.compras.sku(producto.sku)}
            </p>
          )}
          {procedencia && (
            <p style={{ ...meta, fontSize: "13px", lineHeight: "18px", color: "var(--gray-60)", margin: 0 }}>
              {procedencia}
            </p>
          )}
        </div>

        {/* 16 y pegado: cada píxel que se lleva el chevron es un píxel
            menos de nombre, y los nombres de producto son largos. */}
        <ChevronRight
          size={16}
          strokeWidth={2}
          color="var(--gray-40)"
          className="shrink-0"
          style={{ marginTop: "3px", marginLeft: "-4px" }}
          aria-hidden="true"
        />
      </button>

      {/* Las dos acciones reparten el ancho en partes iguales. Solo se
          apilan si el texto no entra, y en ese caso cada una ocupa su
          línea completa: nunca se comprime el texto ni el área táctil. */}
      {(conGarantia || conServicio) && (
        <div className="flex flex-wrap" style={{ gap: "8px" }}>
          {conGarantia && (
            <button
              type="button"
              onClick={() => onGarantia(producto)}
              className="border transition-transform active:scale-[0.99]"
              style={{
                ...estiloBoton,
                borderColor: "var(--gray-20)",
                backgroundColor: "var(--primary-white)",
              }}
            >
              {STR.compras.solicitarGarantia}
            </button>
          )}
          {conServicio && (
            <button
              type="button"
              onClick={pedirServicio}
              className="border-none transition-transform active:scale-[0.99]"
              style={{ ...estiloBoton, backgroundColor: "var(--primary-yellow)" }}
            >
              {STR.compras.solicitarServicio}
            </button>
          )}
        </div>
      )}

      {/* Elegir entre los servicios compatibles. Es una hoja de acciones de
          la app, no una pantalla nueva: se elige y se entra al flujo. */}
      <HojaAcciones
        abierto={eligiendo}
        onCerrar={() => setEligiendo(false)}
        titulo={STR.compras.elegirServicio}
      >
        {/* El contenido de la hoja trae su propio margen lateral (el
            componente solo lo pone en la cabecera) y reserva abajo la safe
            area: la última fila no puede quedar debajo del indicador del
            teléfono. La hoja ya scrollea y va por encima de la barra. */}
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
        {/* Filas táctiles, no tarjetas: lo que se elige es un nombre. */}
        <div className="flex flex-col">
          {compatibles.map(({ id, servicio }, i) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setEligiendo(false);
                onServicio(producto, id);
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
              {/* La categoría adelante: en el catálogo real hay servicios
                  que se llaman solo "Lavadora", y solos no dicen si son una
                  instalación o una reparación. */}
              {servicio
                ? servicio.categoria
                  ? `${servicio.categoria} · ${servicio.nombre}`
                  : servicio.nombre
                : id}
            </button>
          ))}
        </div>
        </div>
      </HojaAcciones>
    </div>
  );
}
