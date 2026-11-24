import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Info } from "lucide-react";
import { STR } from "../i18n/strings";
import { leerBorrador, guardarBorrador } from "../data/borradorGarantia";
import {
  ProductoSolicitud,
  validarPaso1,
} from "../logic/solicitudGarantia";
import { ProgresoPasos } from "../components/garantia/ProgresoPasos";
import { Campo, estiloInput } from "../components/garantia/Campo";
import { SelectorBuscable } from "../components/garantia/SelectorBuscable";
import { AyudaSheet } from "../components/garantia/AyudaSheet";
import { DiagramaRecibo } from "../components/garantia/ReciboAyuda";

// Paso 1 de la garantía: el formulario del producto, DIRECTO.
//
// "Solicitar ayuda por garantía" aterriza acá sin pantallas intermedias
// (decisión de diseño sobre la referencia visual aprobada). El orden de los
// campos sigue esa referencia: factura, fecha de compra, comercio, marca,
// tipo, código, modelo, serie y nombre del producto. TODOS son
// obligatorios menos el número de serie, el único opcional: es el dato más
// difícil de encontrar y exigirlo dejaría a alguien sin poder pedir su
// garantía. Sin factura no se puede
// crear el reclamo desde la app (no existe la opción de continuar sin
// comprobante). Si se llega desde la revisión final (editar), "Siguiente"
// vuelve directo a ella en lugar de seguir el flujo lineal.
const TIPOS_PRODUCTO = [
  "Aire acondicionado", "Lavadora", "Secadora", "Refrigeradora", "Estufa",
  "Calentador", "Lavavajillas", "Microondas", "Abanico", "Otro",
];
const MARCAS = [
  "Panasonic", "Samsung", "LG", "Whirlpool", "Mabe",
  "Frigidaire", "Carrier", "Rheem", "Otra",
];
const COMERCIOS = ["Novey", "Cochez", "Otro comercio"];

function fechaISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function GarantiaProducto() {
  const navigate = useNavigate();
  const location = useLocation();
  const desdeRevision = Boolean(
    (location.state as { desdeRevision?: boolean } | null)?.desdeRevision,
  );
  // Entrada desde Mis productos: el formulario llega completo con los datos
  // de la compra y la persona solo revisa. Es el ÚNICO agregado del flujo de
  // garantía: ni un campo, ni una pregunta, ni un estado cambian.
  const estadoCompra = location.state as
    | { desdeCompra?: boolean; manual?: boolean; compraCompleta?: boolean }
    | null;
  const desdeCompra = Boolean(estadoCompra?.desdeCompra);
  // Un producto cargado a mano no tiene compra registrada: el aviso no dice
  // que "no encontramos" datos que nunca existieron, pide los que faltan.
  const desdeManual = desdeCompra && Boolean(estadoCompra?.manual);
  const compraIncompleta =
    desdeCompra && !desdeManual && estadoCompra?.compraCompleta === false;
  const inicial = leerBorrador().producto;

  const [factura, setFactura] = useState(inicial?.numeroFactura ?? "");
  const [fechaCompra, setFechaCompra] = useState(inicial?.fechaCompra ?? "");
  const [comercio, setComercio] = useState(inicial?.comercio ?? "");
  const [tipo, setTipo] = useState(inicial?.tipo ?? "");
  const [marca, setMarca] = useState(inicial?.marca ?? "");
  const [codigo, setCodigo] = useState(inicial?.codigoProducto ?? "");
  const [modelo, setModelo] = useState(inicial?.modelo ?? "");
  const [serie, setSerie] = useState(inicial?.serie ?? "");
  const [alias, setAlias] = useState(inicial?.alias ?? "");
  const [ayudaVisible, setAyudaVisible] = useState<"modelo" | "serie" | null>(null);
  const [ayudaFactura, setAyudaFactura] = useState(false);
  const [ayudaCodigo, setAyudaCodigo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const campoFactura = useRef<HTMLInputElement>(null);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;
  const hoy = fechaISO(new Date());

  const continuar = () => {
    const producto: ProductoSolicitud = {
      // Lo que vino de la compra se conserva: el id del producto y los datos
      // de origen viajan en el payload aunque la persona corrija un campo.
      registradoId: inicial?.registradoId,
      compraOriginal: inicial?.compraOriginal,
      nombre: alias.trim() || (tipo ? `${tipo}${marca ? ` ${marca}` : ""}` : ""),
      numeroFactura: factura.trim() || undefined,
      fechaCompra: fechaCompra || undefined,
      comercio: comercio || undefined,
      tipo: tipo || undefined,
      marca: marca || undefined,
      codigoProducto: codigo.trim() || undefined,
      modelo: modelo.trim() || undefined,
      serie: serie.trim() || undefined,
      alias: alias.trim() || undefined,
    };

    const errores = validarPaso1({ producto });
    if (errores.length > 0) {
      setError(errores[0]);
      campoFactura.current?.focus();
      return;
    }
    guardarBorrador({ producto });
    if (desdeRevision) {
      navigate(-1);
      return;
    }
    navigate("/garantia/problema");
  };

  const ayudaBoton = (clave: "modelo" | "serie", texto: string) => (
    <button
      type="button"
      onClick={() => setAyudaVisible(ayudaVisible === clave ? null : clave)}
      className="px-0"
      style={{
        ...meta,
        fontSize: "12px",
        fontWeight: "var(--font-weight-medium)",
        color: "var(--info-blue)",
        background: "none",
        border: "none",
        cursor: "pointer",
        minHeight: "24px",
      }}
    >
      {texto}
    </button>
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="px-6 pt-[20px] pb-2 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label={STR.garantiaFlujo.volver}
            className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
            style={{ backgroundColor: "var(--primary-white)", borderColor: "var(--gray-20)", cursor: "pointer" }}
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
            {STR.garantiaFlujo.titulo}
          </h1>
        </div>
        <ProgresoPasos paso={1} />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <div className="flex flex-col gap-4">
          {/* Precarga desde una compra. Si la compra no traía todo, el aviso
              lo dice con las palabras del pedido y la persona completa SOLO
              lo que falta: nada se inventa para que el formulario pase. */}
          {desdeCompra && (
            <div
              className="flex"
              style={{
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid var(--gray-8)",
                backgroundColor: "var(--gray-3)",
              }}
            >
              <Info
                size={16}
                strokeWidth={2}
                color="var(--gray-60)"
                style={{ flexShrink: 0, marginTop: "1px" }}
                aria-hidden="true"
              />
              <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
                {desdeManual
                  ? STR.compras.precargaManual
                  : compraIncompleta
                    ? STR.compras.precargaIncompleta
                    : STR.compras.precargaGarantia}
              </p>
            </div>
          )}
          {/* 1. Factura, siempre obligatoria: sin ella no se crea el reclamo */}
          <Campo
            id="factura"
            etiqueta={STR.garantiaFlujo.p1Factura}
            obligatorio
            error={error}
            ayuda={
              <div>
                <button
                  type="button"
                  onClick={() => setAyudaFactura(true)}
                  className="px-0"
                  style={{
                    ...meta,
                    fontSize: "12px",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--info-blue)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    minHeight: "24px",
                  }}
                >
                  {STR.garantiaFlujo.p1FacturaAyuda}
                </button>
                <AyudaSheet
                  abierto={ayudaFactura}
                  onCerrar={() => setAyudaFactura(false)}
                  titulo={STR.garantiaFlujo.p1FacturaAyuda}
                  imagen={<DiagramaRecibo resaltar="factura" />}
                >
                  <p>{STR.garantiaFlujo.p1FacturaAyudaTexto}</p>
                </AyudaSheet>
              </div>
            }
          >
            <input
              id="factura"
              ref={campoFactura}
              type="text"
              placeholder={STR.garantiaFlujo.p1FacturaPlaceholder}
              value={factura}
              onChange={(e) => {
                setFactura(e.target.value);
                setError(null);
              }}
              style={estiloInput(Boolean(error))}
            />
          </Campo>

          {/* 2. Fecha de compra, obligatoria */}
          <Campo
            id="fecha-compra"
            etiqueta={STR.garantiaFlujo.p1FechaCompra}
            obligatorio
            ayuda={
              <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: 0 }}>
                {STR.garantiaFlujo.p1FechaCompraAyuda}
              </p>
            }
          >
            <input
              id="fecha-compra"
              type="date"
              max={hoy}
              value={fechaCompra}
              onChange={(e) => setFechaCompra(e.target.value)}
              style={estiloInput()}
            />
          </Campo>

          {/* 3. Comprado en */}
          <Campo id="comercio" etiqueta={STR.garantiaFlujo.p1Comercio} obligatorio>
            {/* La opción vacía lleva texto: sin él el campo se veía en blanco,
                como si estuviera roto, al lado de los que dicen "Selecciona...". */}
            <select
              id="comercio"
              value={comercio}
              onChange={(e) => setComercio(e.target.value)}
              style={{
                ...estiloInput(),
                appearance: "auto",
                color: comercio ? "var(--foreground)" : "var(--gray-60)",
              }}
            >
              <option value="">{STR.garantiaFlujo.p1ComercioPlaceholder}</option>
              {COMERCIOS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Campo>

          {/* 4. Marca: selector predictivo, se escribe y filtra en vivo. Va
              antes del tipo: se elige de qué marca es y recién después qué
              equipo, que es el orden en que la persona mira la etiqueta. */}
          <Campo id="marca" etiqueta={STR.garantiaFlujo.p1Marca} obligatorio>
            <SelectorBuscable
              id="marca"
              value={marca}
              onChange={setMarca}
              opciones={MARCAS}
              placeholder={STR.garantiaFlujo.p1MarcaPlaceholder}
              buscarPlaceholder={STR.garantiaFlujo.p1MarcaBuscar}
              sinResultados={STR.garantiaFlujo.p1MarcaSinResultados}
            />
          </Campo>

          {/* 5. Tipo de producto: selector con búsqueda interna, escala sin
              volverse un desplegable larguísimo a medida que crece la lista. */}
          <Campo id="tipo" etiqueta={STR.garantiaFlujo.p1Tipo} obligatorio>
            <SelectorBuscable
              id="tipo"
              value={tipo}
              onChange={(valor) => {
                setTipo(valor);
                setError(null);
              }}
              opciones={TIPOS_PRODUCTO}
              placeholder={STR.garantiaFlujo.p1TipoPlaceholder}
              buscarPlaceholder={STR.garantiaFlujo.p1TipoBuscar}
              sinResultados={STR.garantiaFlujo.p1TipoSinResultados}
            />
          </Campo>

          {/* 6. Código de producto (SKU) */}
          <Campo
            id="codigo"
            etiqueta={STR.garantiaFlujo.p1Codigo}
            obligatorio
            ayuda={
              <div>
                <button
                  type="button"
                  onClick={() => setAyudaCodigo(true)}
                  className="px-0"
                  style={{
                    ...meta,
                    fontSize: "12px",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--info-blue)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    minHeight: "24px",
                  }}
                >
                  {STR.garantiaFlujo.p1CodigoAyuda}
                </button>
                <AyudaSheet
                  abierto={ayudaCodigo}
                  onCerrar={() => setAyudaCodigo(false)}
                  titulo={STR.garantiaFlujo.p1CodigoAyuda}
                  imagen={<DiagramaRecibo resaltar="codigo" />}
                >
                  <p>{STR.garantiaFlujo.p1CodigoAyudaTexto}</p>
                </AyudaSheet>
              </div>
            }
          >
            <input
              id="codigo"
              type="text"
              placeholder={STR.garantiaFlujo.p1CodigoPlaceholder}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              style={estiloInput()}
            />
          </Campo>

          {/* 7. Modelo */}
          <Campo
            id="modelo"
            etiqueta={STR.garantiaFlujo.p1Modelo}
            obligatorio
            ayuda={
              <div>
                {ayudaBoton("modelo", STR.garantiaFlujo.p1ModeloAyuda)}
                {ayudaVisible === "modelo" && (
                  <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-80)", margin: "2px 0 0" }}>
                    {STR.garantiaFlujo.p1ModeloAyudaTexto}
                  </p>
                )}
              </div>
            }
          >
            <input
              id="modelo"
              type="text"
              placeholder={STR.garantiaFlujo.p1ModeloPlaceholder}
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              style={estiloInput()}
            />
          </Campo>

          {/* 8. Número de serie, opcional */}
          <Campo
            id="serie"
            etiqueta={STR.garantiaFlujo.p1Serie}
            ayuda={
              <div>
                {ayudaBoton("serie", STR.garantiaFlujo.p1SerieAyuda)}
                {ayudaVisible === "serie" && (
                  <p style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-80)", margin: "2px 0 0" }}>
                    {STR.garantiaFlujo.p1SerieAyudaTexto}
                  </p>
                )}
              </div>
            }
          >
            <input
              id="serie"
              type="text"
              placeholder={STR.garantiaFlujo.p1SeriePlaceholder}
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
              style={estiloInput()}
            />
          </Campo>

          {/* 9. Nombre del producto */}
          <Campo id="alias" etiqueta={STR.garantiaFlujo.p1Alias} obligatorio>
            <input
              id="alias"
              type="text"
              placeholder={STR.garantiaFlujo.p1AliasPlaceholder}
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              style={estiloInput()}
            />
          </Campo>
        </div>
      </div>

      <div className="px-6 py-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
        <button
          onClick={continuar}
          className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
          style={{
            height: "44px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: "pointer",
          }}
        >
          {STR.garantiaFlujo.siguiente}
        </button>
      </div>
    </div>
  );
}
