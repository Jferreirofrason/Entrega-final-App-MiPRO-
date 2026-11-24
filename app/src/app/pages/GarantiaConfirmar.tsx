import { ReactNode, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { STR } from "../i18n/strings";
import { leerBorrador, limpiarBorrador } from "../data/borradorGarantia";
import { guardarReclamoDeSesion } from "../data/reclamos";
import { categoriaPorId, generarNumeroSolicitud } from "../logic/solicitudGarantia";
import { ProgresoPasos } from "../components/garantia/ProgresoPasos";

// Paso 4, pantalla independiente: revisión final antes del envío. Cada
// sección (compra, producto, problema reportado, contacto y dirección)
// tiene su propio "Editar" que navega al paso correspondiente marcado con
// `desdeRevision`; ese paso, al guardar, vuelve directo acá (navigate(-1))
// sin perder el resto de los datos. El envío definitivo ocurre SOLO desde
// este botón (antes ocurría en el paso de contacto y dirección). QA:
// ?envio=falla simula el error de envío conservando todos los datos.
export function GarantiaConfirmar() {
  const navigate = useNavigate();
  const location = useLocation();
  const borrador = leerBorrador();

  const [enviando, setEnviando] = useState(false);
  const [falloEnvio, setFalloEnvio] = useState(false);
  const yaEnviado = useRef(false);
  const forzarFallo = useRef(new URLSearchParams(location.search).get("envio") === "falla");

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  const producto = borrador.producto;
  const categoria = borrador.problema ? categoriaPorId(borrador.problema.categoria) : null;
  const adjuntosListos = borrador.problema?.adjuntos.filter((a) => a.estado === "listo") ?? [];
  const fechaCompra = producto?.fechaCompra
    ? new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(`${producto.fechaCompra}T12:00:00`),
      )
    : null;

  const editar = (destino: string) => navigate(destino, { state: { desdeRevision: true } });

  const enviar = () => {
    if (yaEnviado.current || enviando) return;
    setEnviando(true);
    setFalloEnvio(false);

    setTimeout(() => {
      if (forzarFallo.current) {
        // El error conserva todo: el borrador sigue guardado.
        forzarFallo.current = false;
        setEnviando(false);
        setFalloEnvio(true);
        return;
      }
      yaEnviado.current = true;
      const ahora = new Date();
      const numero = generarNumeroSolicitud(ahora, Date.now());
      const idReclamo = `sesion-${Date.now()}`;
      guardarReclamoDeSesion({
        id: idReclamo,
        numero,
        producto: producto?.nombre ?? producto?.alias ?? "",
        marca: producto?.marca,
        subcategoriaProducto: producto?.tipo,
        codigoProducto: producto?.codigoProducto,
        numeroFactura: producto?.numeroFactura,
        fechaCompra: producto?.fechaCompra,
        serie: producto?.serie,
        motivoProblema: categoria?.etiqueta,
        descripcionProblema: borrador.problema?.descripcion,
        iniciadoEl: ahora.toISOString(),
        citas: [],
      });
      limpiarBorrador();
      navigate(
        `/garantia/enviada?num=${encodeURIComponent(numero)}&id=${idReclamo}&producto=${encodeURIComponent(producto?.nombre ?? "")}`,
        { replace: true },
      );
    }, 900);
  };

  const seccion = (titulo: string, destinoEdicion: string, contenido: ReactNode) => (
    <div
      className="border"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--gray-8)", borderRadius: "12px", padding: "16px" }}
    >
      <div className="flex items-center justify-between">
        <p style={{ ...meta, fontSize: "11px", color: "var(--gray-60)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
          {titulo}
        </p>
        <button
          onClick={() => editar(destinoEdicion)}
          aria-label={`${STR.garantiaFlujo.p3Editar} ${titulo}`}
          className="px-2 -mr-2"
          style={{
            minHeight: "32px",
            background: "none",
            border: "none",
            cursor: "pointer",
            ...meta,
            fontSize: "13px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--info-blue)",
          }}
        >
          {STR.garantiaFlujo.p3Editar}
        </button>
      </div>
      <div className="flex flex-col gap-1" style={{ marginTop: "6px" }}>{contenido}</div>
    </div>
  );

  const fila = (etiqueta: string, valor: string | null | undefined, fuerte = false) => {
    if (!valor) return null;
    return (
      <p style={{ ...meta, fontSize: fuerte ? "14px" : "13px", lineHeight: "19px", fontWeight: fuerte ? "var(--font-weight-medium)" : "var(--font-weight-normal)", color: fuerte ? "var(--primary-black)" : "var(--gray-80)", margin: 0 }}>
        {fuerte || !etiqueta ? valor : `${etiqueta}: ${valor}`}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <header className="px-6 pt-[20px] pb-2 bg-white sticky top-0 z-20" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
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
        <ProgresoPasos paso={4} />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <h2 style={{ ...meta, fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: "0 0 12px" }}>
          {STR.garantiaFlujo.p3Revisa}
        </h2>

        <div className="flex flex-col gap-3">
          {seccion(
            STR.garantiaFlujo.p4Compra,
            "/garantia/producto",
            <>
              {fila(STR.garantiaFlujo.p4Factura, producto?.numeroFactura)}
              {fila(STR.garantiaFlujo.p4FechaCompra, fechaCompra)}
              {fila(STR.garantiaFlujo.p4Comercio, producto?.comercio)}
            </>,
          )}

          {seccion(
            STR.garantiaFlujo.p3Producto,
            "/garantia/producto",
            <>
              {fila("", producto?.nombre, true)}
              {fila(STR.garantiaFlujo.p4Tipo, producto?.tipo)}
              {fila(STR.garantiaFlujo.p4Marca, producto?.marca)}
              {fila(STR.garantiaFlujo.p4Modelo, producto?.modelo)}
              {fila(STR.garantiaFlujo.p4Codigo, producto?.codigoProducto)}
              {fila(STR.garantiaFlujo.p4Serie, producto?.serie)}
            </>,
          )}

          {seccion(
            STR.garantiaFlujo.p4ProblemaReportado,
            "/garantia/problema",
            <>
              {fila("", categoria?.etiqueta, true)}
              {fila("", borrador.problema?.descripcion)}
              {adjuntosListos.length > 0 && fila("", STR.garantiaFlujo.p3ArchivosCantidad(adjuntosListos.length))}
            </>,
          )}

          {seccion(
            STR.garantiaFlujo.p4ContactoDireccion,
            "/garantia/revisar",
            <>
              {fila("", borrador.contacto ? `${borrador.contacto.nombre} · ${borrador.contacto.telefono}` : null, true)}
              {borrador.contactoAlternativo &&
                fila("", `${STR.garantiaFlujo.p3AlternativoResumen} ${borrador.contactoAlternativo.nombre} · ${borrador.contactoAlternativo.telefono}`)}
              {borrador.direccion && fila("", borrador.direccion.etiqueta, true)}
              {borrador.direccion && fila("", borrador.direccion.direccion)}
            </>,
          )}
        </div>

        {falloEnvio && (
          <div role="alert" className="border mt-4 p-4 text-center" style={{ borderColor: "var(--gray-8)", borderRadius: "12px" }}>
            <p style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
              {STR.garantiaFlujo.p3ErrorEnvio}
            </p>
            <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "4px 0 0" }}>
              {STR.garantiaFlujo.p3ErrorEnvioDetalle}
            </p>
          </div>
        )}

        <p className="flex items-start gap-1.5" style={{ ...meta, fontSize: "12px", lineHeight: "18px", color: "var(--gray-60)", margin: "16px 0 0" }}>
          {STR.garantiaFlujo.p3Expectativa}
        </p>
      </div>

      <div className="px-6 py-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
        <button
          onClick={enviar}
          disabled={enviando}
          aria-busy={enviando}
          className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none flex items-center justify-center gap-2"
          style={{
            height: "44px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: enviando ? "default" : "pointer",
            opacity: enviando ? 0.7 : 1,
          }}
        >
          {enviando && <Loader2 size={18} strokeWidth={2.5} className="animate-spin" aria-hidden="true" />}
          {enviando
            ? STR.garantiaFlujo.p3Enviando
            : falloEnvio
              ? STR.garantiaFlujo.p3Reintentar
              : STR.garantiaFlujo.p3Enviar}
        </button>
      </div>
    </div>
  );
}
