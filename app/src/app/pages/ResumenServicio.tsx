import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Info } from "lucide-react";
import { STR } from "../i18n/strings";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DesgloseCosto } from "../components/servicios/DesgloseCosto";
import { buscarServicioCatalogo } from "../data/catalogo";
import {
  leerBorradorServicio,
  limpiarBorradorServicio,
} from "../data/borradorServicio";
import { buscarDireccion } from "../data/direcciones";
import { crearSolicitud } from "../data/solicitudes";
import {
  etiquetaBloque,
  listaParaConfirmar,
  totalConAdicionales,
} from "../logic/solicitudServicio";
import { hayImporteFinal } from "../logic/pago";
import { formatearFecha } from "../logic/fechas";
import { EncabezadoFlujo } from "../components/agendar/EncabezadoFlujo";

function fechaISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Etapa 4 del agendamiento: revisión explícita antes de confirmar.
//
// Cada bloque tiene su acción de edición y volver no pierde los demás
// datos (el borrador persiste). La visita todavía debe coordinarse, así que
// nunca decimos "Agendar cita".
//
// Desde acá salen DOS caminos, y los decide `hayImporteFinal`:
// - Con importe final, el CTA lleva al pago de la reserva y la solicitud se
//   crea allá, después de pagar.
// - Sin importe final (servicio que se cotiza, o visita de evaluación), el
//   flujo es el de siempre: se envía la solicitud y un agente coordina el
//   pago. Ese es el aviso que va antes del CTA.
export function ResumenServicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const servicio = id ? buscarServicioCatalogo(id) : null;
  const borrador = id ? leerBorradorServicio(id) : null;
  const [error, setError] = useState<string | null>(null);
  const procesando = useRef(false);

  const meta = { fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif" } as const;

  if (!servicio || !borrador) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)" }}>
          {STR.agendar.noEncontrado}
        </p>
      </div>
    );
  }

  const direccion = borrador.direccionId ? buscarDireccion(borrador.direccionId) : null;
  const total = totalConAdicionales(
    servicio.precioDesde,
    borrador.cantidad,
    borrador.incluyeDesinstalacion ? borrador.precioDesinstalacion : undefined,
  );
  const hoy = fechaISO(new Date());

  const conPago = hayImporteFinal(servicio, borrador);

  const confirmar = () => {
    if (procesando.current) return;
    if (!listaParaConfirmar(borrador, hoy)) {
      setError("Revisa que la dirección y la fecha estén completas antes de confirmar.");
      return;
    }
    // Con importe final la solicitud no se crea acá: se crea después de
    // pagar, para que no quede una reserva sin su cobro.
    if (conPago) {
      navigate(`/catalogo/${servicio.id}/pago`);
      return;
    }
    procesando.current = true;
    const solicitud = crearSolicitud(servicio.nombre, {
      condiciones: borrador.condiciones,
      incluyeDesinstalacion: borrador.incluyeDesinstalacion,
      cantidad: borrador.cantidad,
      totalEstimado: total ?? undefined,
      direccionEtiqueta: direccion?.etiqueta,
      direccionTexto: direccion?.direccion,
      fechaPreferida: borrador.fechaPreferida,
      bloque: borrador.bloque,
      contactoNombre: borrador.contacto?.nombre,
      contactoTelefono: borrador.contacto?.telefono,
      notas: borrador.notas,
      cantidadFotos: borrador.fotos.length,
    });
    limpiarBorradorServicio(servicio.id);
    navigate(`/solicitud-enviada?id=${solicitud.id}`, { replace: true });
  };

  const bloqueResumen = (
    titulo: string,
    destinoEdicion: string,
    contenido: React.ReactNode,
  ) => (
    <div
      className="border"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--gray-8)",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      <div className="flex items-center justify-between">
        <p style={{ ...meta, fontSize: "11px", color: "var(--gray-60)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
          {titulo}
        </p>
        <button
          onClick={() => navigate(destinoEdicion, { state: { desdeRevision: true } })}
          aria-label={`${STR.agendar.editar} ${titulo}`}
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
          {STR.agendar.editar}
        </button>
      </div>
      <div style={{ marginTop: "4px" }}>{contenido}</div>
    </div>
  );

  const linea = (texto: string, fuerte = false) => (
    <p
      style={{
        ...meta,
        fontSize: fuerte ? "14px" : "13px",
        lineHeight: "20px",
        fontWeight: fuerte ? "var(--font-weight-medium)" : "var(--font-weight-normal)",
        color: fuerte ? "var(--primary-black)" : "var(--gray-80)",
        margin: 0,
      }}
    >
      {texto}
    </p>
  );

  const adicionales: string[] = [];
  if (borrador.condiciones === "inspeccion") adicionales.push(STR.lugar.condInspeccion);
  if (borrador.condiciones === "estandar") adicionales.push(STR.lugar.condEstandar);
  if (borrador.incluyeDesinstalacion) adicionales.push(STR.lugar.condDesinstalacion);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--primary-white)" }}>
      <EncabezadoFlujo titulo={servicio.nombre} etapa={4} onVolver={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <h2 style={{ ...meta, fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: 0 }}>
          {STR.agendar.resumenTitulo}
        </h2>

        <div className="flex flex-col gap-3 mt-4">
          {bloqueResumen(
            STR.agendar.bloqueServicio,
            `/catalogo/${servicio.id}/configurar`,
            <>
              <div className="flex items-center gap-3" style={{ marginBottom: "6px" }}>
                <div
                  className="flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ width: "44px", height: "44px", borderRadius: "8px", backgroundColor: "var(--gray-8)" }}
                >
                  {servicio.imagen ? (
                    <ImageWithFallback src={servicio.imagen} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <servicio.icono size={20} strokeWidth={2} color="var(--gray-60)" aria-hidden="true" />
                  )}
                </div>
                <p
                  style={{
                    fontFamily: "'Bebas Neue', Arial, sans-serif",
                    fontSize: "17px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "var(--primary-black)",
                    lineHeight: "1.15",
                    margin: 0,
                  }}
                >
                  {servicio.nombre}
                </p>
              </div>
              {linea(`${STR.agendar.cantidad}: ${borrador.cantidad}`)}
              {/* El producto que originó la solicitud, cuando se entró desde
                  Mis productos: la revisión final muestra sobre qué equipo
                  es el servicio. Sin compra, esta línea no existe. */}
              {borrador.compra &&
                linea(
                  borrador.compra.sku
                    ? `${STR.compras.contextoServicio}: ${borrador.compra.nombre} (${STR.compras.sku(borrador.compra.sku)})`
                    : `${STR.compras.contextoServicio}: ${borrador.compra.nombre}`,
                )}
              {adicionales.length > 0 && (
                <p style={{ ...meta, fontSize: "13px", lineHeight: "20px", color: "var(--gray-80)", margin: 0 }}>
                  {STR.agendar.adicionales}: {adicionales.join(". ")}
                </p>
              )}
              <div style={{ marginTop: "6px" }}>
                <DesgloseCosto
                  servicio={servicio}
                  cantidad={borrador.cantidad}
                  condiciones={borrador.condiciones}
                  incluyeDesinstalacion={borrador.incluyeDesinstalacion}
                  precioDesinstalacion={borrador.precioDesinstalacion}
                />
              </div>
            </>,
          )}

          {bloqueResumen(
            STR.agendar.bloqueDireccion,
            `/catalogo/${servicio.id}/direccion`,
            <>
              {direccion ? (
                <>
                  {linea(direccion.etiqueta, true)}
                  {linea(direccion.direccion)}
                </>
              ) : (
                linea("Falta elegir la dirección.")
              )}
              {borrador.contacto?.nombre &&
                linea(`${STR.agendar.recibe}: ${borrador.contacto.nombre}, ${borrador.contacto.telefono}`)}
            </>,
          )}

          {bloqueResumen(
            STR.agendar.bloqueFecha,
            `/catalogo/${servicio.id}/fecha`,
            <>
              {borrador.fechaPreferida
                ? linea(
                    `${formatearFecha(`${borrador.fechaPreferida}T12:00:00`)}${
                      etiquetaBloque(borrador.bloque)
                        ? `, ${etiquetaBloque(borrador.bloque)!.toLowerCase()}`
                        : ""
                    }`,
                    true,
                  )
                : linea("Falta elegir la fecha.")}
              {linea(STR.agendar.fechaAclaracion)}
            </>,
          )}

          {bloqueResumen(
            STR.agendar.bloqueNotas,
            `/catalogo/${servicio.id}/configurar`,
            <>
              {linea(borrador.notas || STR.agendar.sinNotas)}
              {borrador.fotos.length > 0 &&
                linea(STR.agendar.fotosResumen(borrador.fotos.length))}
            </>,
          )}
        </div>

        {/* Con importe final se paga en el paso siguiente; sin importe
            final, el pago lo coordina un agente fuera de la app */}
        <div
          className="flex items-start gap-1.5 mt-6 p-3"
          style={{ backgroundColor: "var(--gray-3)", borderRadius: "10px" }}
        >
          <Info size={14} color="var(--gray-60)" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
          <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
            {conPago ? STR.pago.avisoEnResumen : STR.agendar.pagoAviso}
          </p>
        </div>

        {error && (
          <p role="alert" style={{ ...meta, fontSize: "12px", color: "var(--error-red)", margin: "10px 0 0" }}>
            {error}
          </p>
        )}
      </div>

      <div className="px-6 py-4 bg-white flex-shrink-0" style={{ borderTop: "1px solid var(--gray-8)" }}>
        <button
          onClick={confirmar}
          className="w-full transition-transform hover:scale-[1.01] active:scale-[0.99] border-none"
          style={{
            height: "56px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "16px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            cursor: "pointer",
          }}
        >
          {conPago ? STR.pago.continuarAlPago : STR.agendar.confirmar}
        </button>
      </div>
    </div>
  );
}
