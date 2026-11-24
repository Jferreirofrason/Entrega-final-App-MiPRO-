import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarDays, CheckCircle2 } from "lucide-react";
import { STR } from "../i18n/strings";
import { buscarReclamoPorId } from "../data/reclamos";
import { ContactarMiPRO } from "../components/servicios/ContactarMiPRO";
import { LineaDeTiempo, TituloSeguimiento } from "../components/servicios/LineaDeTiempo";
import { seguimientoDeLaGarantia, sePuedeReagendar } from "../logic/seguimiento";
import { HistorialCitas } from "../components/reclamos/HistorialCitas";
import {
  citaRelevante,
  citasEnOrden,
  estadoGeneralReclamo,
  reclamoRequiereAccion,
  ultimaActualizacion,
} from "../logic/reclamos";
import { presentarEstadoCasoReclamo } from "../i18n/estados";
import { formatearFecha } from "../logic/fechas";
import { getStatusConfig } from "../utils/statusConfig";
import { CURRENT_USER } from "../data/user";
import { linkWhatsAppCancelacion } from "../logic/contacto";

// Detalle de un reclamo de garantía. Orden de lectura: la MODALIDAD de
// atención de la cita relevante (instrucción prioritaria, cuando existe),
// el estado del CASO (siempre el mismo derivado que usan las cards), la
// acción pendiente del cliente si el caso la requiere, la resolución (solo
// si el caso terminó), los datos del producto según la matriz de garantía y
// el historial de citas en orden cronológico.
export function DetalleReclamo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reclamo = id ? buscarReclamoPorId(id) : null;
  const [cancelarAbierto, setCancelarAbierto] = useState(false);

  // Pasar de un reclamo a otro usa la misma pantalla (cambia el :id, no la
  // ruta), así que el popup de contacto no se desmontaba y quedaba abierto
  // sobre el reclamo nuevo.
  useEffect(() => {
    setCancelarAbierto(false);
  }, [id]);

  const meta = {
    fontFamily: "'Helvetica Neue LT Std', Arial, sans-serif",
  } as const;

  if (!reclamo) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-20">
        <p style={{ ...meta, fontSize: "14px", color: "var(--gray-60)" }}>
          {STR.garantia.noEncontrado}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 transition-opacity hover:opacity-80"
          style={{
            height: "44px",
            backgroundColor: "var(--primary-yellow)",
            borderRadius: "12px",
            ...meta,
            fontSize: "14px",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--primary-black)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {STR.garantia.volver}
        </button>
      </div>
    );
  }

  const estadoCaso = estadoGeneralReclamo(reclamo);
  const presentacion = presentarEstadoCasoReclamo(estadoCaso);
  const config = getStatusConfig(presentacion.claveVisual);
  const requiereAccion = reclamoRequiereAccion(reclamo);
  const iniciado = formatearFecha(reclamo.iniciadoEl);
  const actualizado = formatearFecha(ultimaActualizacion(reclamo) ?? undefined);
  // Historial cronológico de citas: de la más antigua a la más reciente.
  const citas = citasEnOrden(reclamo);
  const citaConModalidad = citaRelevante(reclamo);
  const modalidad = citaConModalidad?.modalidad;
  const tituloModalidad =
    modalidad?.tipo === "taller-visita"
      ? STR.garantia.modalidadTallerVisita
      : modalidad?.tipo === "cliente-lleva"
        ? STR.garantia.modalidadClienteLleva
        : modalidad?.tipo === "deja-en-tienda"
          ? STR.garantia.modalidadDejaTienda
          : null;

  const etiquetaDato = {
    ...meta,
    fontSize: "11px",
    color: "var(--gray-60)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: 0,
  };

  return (
    <div className="flex flex-col" style={{ backgroundColor: "var(--primary-white)" }}>
      <header
        className="flex items-center gap-3 px-6 pt-[20px] pb-4 bg-white sticky top-0 z-20"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label={STR.garantia.volver}
          className="w-11 h-11 rounded-[10px] flex items-center justify-center transition-opacity hover:opacity-80 border flex-shrink-0"
          style={{
            backgroundColor: "var(--primary-white)",
            borderColor: "var(--gray-20)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} color="var(--primary-black)" aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0">
          <h1
            className="truncate"
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
            {STR.garantia.detalleTitulo}
          </h1>
        </div>
      </header>

      <section className="px-6 pt-6 pb-8">
        {/* Modalidad de atención: instrucción PRIORITARIA, definida por
            operación (nunca por el cliente). Solo los datos que existen. */}
        {modalidad && tituloModalidad && (
          <div
            className="border mb-4"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--gray-20)",
              borderLeft: "4px solid var(--primary-yellow)",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <p
              style={{
                ...meta,
                fontSize: "12px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--gray-60)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: 0,
              }}
            >
              {STR.garantia.modalidadEtiqueta}
            </p>
            <p style={{ ...meta, fontSize: "15px", lineHeight: "21px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)", margin: "6px 0 0" }}>
              {tituloModalidad}
            </p>
            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--gray-8)" }}>
              {[
                [STR.garantia.modalidadTaller, modalidad.taller],
                [STR.garantia.modalidadTienda, modalidad.tienda],
                [STR.garantia.modalidadFecha, formatearFecha(citaConModalidad?.fecha)],
                [STR.garantia.modalidadHorario, citaConModalidad?.horario],
                [STR.garantia.modalidadDireccion, modalidad.direccion],
                [STR.garantia.modalidadIndicaciones, modalidad.instrucciones],
              ]
                .filter(([, valor]) => Boolean(valor))
                .map(([etiqueta, valor]) => (
                  <div key={etiqueta as string} className="flex items-baseline gap-2" style={{ marginTop: "4px" }}>
                    <span
                      className="flex-shrink-0"
                      style={{ ...meta, fontSize: "12px", color: "var(--gray-60)", minWidth: "72px" }}
                    >
                      {etiqueta}
                    </span>
                    <span style={{ ...meta, fontSize: "14px", lineHeight: "20px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}>
                      {valor}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Estado */}
        <span
          className="inline-flex items-center gap-1.5"
        >
          <span
            aria-hidden="true"
            className="inline-block"
            style={{ width: "7px", height: "7px", borderRadius: "2px", backgroundColor: config.color }}
          />
          <span
            style={{
              ...meta,
              fontSize: "11px",
              fontWeight: "var(--font-weight-medium)",
              color: config.color,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {presentacion.etiqueta}
          </span>
        </span>

        {/* Producto y referencia */}
        <h2
          style={{
            fontFamily: "'Bebas Neue', Arial, sans-serif",
            fontSize: "22px",
            fontWeight: "var(--font-weight-normal)",
            color: "var(--foreground)",
            letterSpacing: "1px",
            textTransform: "uppercase",
            lineHeight: "1.2",
            margin: "12px 0 0",
          }}
        >
          {reclamo.producto}
        </h2>
        <p style={{ ...meta, fontSize: "12px", color: "var(--gray-60)", margin: "2px 0 0" }}>
          {STR.garantia.reclamo} {reclamo.numero}
        </p>

        {/* Mensaje de tranquilidad del estado del caso (centralizado, el
            mismo texto exacto que muestran las cards). */}
        <div
          style={{
            backgroundColor: config.bg,
            borderRadius: "10px",
            padding: "12px",
            margin: "14px 0 0",
          }}
        >
          <div className="flex items-center gap-2">
            <config.icon size={16} strokeWidth={2.5} color={config.color} style={{ flexShrink: 0 }} aria-hidden="true" />
            <span style={{ ...meta, fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--primary-black)" }}>
              {presentacion.mensaje}
            </span>
          </div>
          {requiereAccion && reclamo.requiereAccionCliente && (
            <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: "4px 0 0", paddingLeft: "24px" }}>
              {reclamo.requiereAccionCliente}
            </p>
          )}
        </div>

        {/* Resolución: solo cuando existe Y el caso ya está Completada. No
            se inventa si todavía no fue cargada desde backoffice. */}
        {reclamo.resolucion && estadoCaso === "Completada" && (
          <div style={{ margin: "14px 0 0" }}>
            <p style={etiquetaDato}>{STR.garantia.resolucion}</p>
            <div className="flex items-start gap-1.5" style={{ marginTop: "6px" }}>
              <CheckCircle2 size={16} strokeWidth={2.5} color="var(--success-green)" style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
              <p style={{ ...meta, fontSize: "13px", lineHeight: "19px", color: "var(--gray-80)", margin: 0 }}>
                {reclamo.resolucion}
              </p>
            </div>
          </div>
        )}

        {/* Fechas del caso: creación y última actualización (esta responde
            al último evento del historial) */}
        <div className="flex flex-col gap-1.5" style={{ margin: "14px 0 0" }}>
          {iniciado && (
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
              <span style={{ ...meta, fontSize: "13px", color: "var(--gray-80)" }}>
                {STR.garantia.iniciadoEl(iniciado)}
              </span>
            </div>
          )}
          {actualizado && (
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} color="var(--gray-60)" style={{ flexShrink: 0 }} aria-hidden="true" />
              <span style={{ ...meta, fontSize: "13px", color: "var(--gray-80)" }}>
                {STR.garantia.actualizadoEl(actualizado)}
              </span>
            </div>
          )}
        </div>

        {/* Datos del producto según la matriz de garantía; solo lo que
            existe (el SKU nunca se muestra como "SKU") */}
        {(reclamo.marca || reclamo.categoriaProducto || reclamo.codigoProducto || reclamo.vigencia) && (
          <>
            <h3
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "18px",
                fontWeight: "var(--font-weight-normal)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--primary-black)",
                margin: "20px 0 10px",
              }}
            >
              {STR.garantia.datosProducto}
            </h3>
            <div
              className="border"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--gray-8)",
                borderRadius: "12px",
                padding: "12px 16px",
              }}
            >
              {[
                [STR.garantia.marca, reclamo.marca],
                [
                  STR.garantia.categoriaProducto,
                  reclamo.subcategoriaProducto || reclamo.categoriaProducto,
                ],
                [STR.garantia.codigoProducto, reclamo.codigoProducto],
                [STR.garantia.vigencia, reclamo.vigencia],
              ]
                .filter(([, valor]) => Boolean(valor))
                .map(([etiqueta, valor], i) => (
                  <div key={etiqueta as string} style={{ marginTop: i > 0 ? "8px" : 0 }}>
                    <p style={etiquetaDato}>{etiqueta}</p>
                    <p style={{ ...meta, fontSize: "14px", lineHeight: "20px", color: "var(--primary-black)", margin: "2px 0 0" }}>
                      {valor}
                    </p>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* Seguimiento: SOLO las etapas alcanzadas del CASO
            (logic/seguimiento.ts). Es otra cosa que el historial de abajo,
            que cuenta los cambios de estado de cada cita. */}
        <div style={{ marginTop: "24px" }}>
          <TituloSeguimiento />
          <LineaDeTiempo etapas={seguimientoDeLaGarantia(reclamo)} />
        </div>

        {/* Historial de citas (cronológico, más antigua → más reciente).
            Cada item es una cita hija: su propio estado (vocabulario
            EXCLUSIVO de cita, distinto del estado del caso de arriba),
            fecha solo si no es "Por coordinar", técnico solo desde "Cita
            confirmada" en adelante. */}
        {citas.length > 0 && (
          <>
            <h3
              style={{
                fontFamily: "'Bebas Neue', Arial, sans-serif",
                fontSize: "18px",
                fontWeight: "var(--font-weight-normal)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--primary-black)",
                margin: "20px 0 12px",
              }}
            >
              {STR.garantia.historial}
            </h3>
            <HistorialCitas citas={citas} />
          </>
        )}

        {/* Acciones del caso activo. Reagendar NO reprograma: abre el mismo
            contacto con MiPRO, que es como se cambia una fecha hoy. Solo
            aparece si hay una cita con fecha; sin cita no hay nada que
            mover. Contactar está siempre que el caso siga abierto. */}
        {estadoCaso !== "Completada" && estadoCaso !== "Cancelada" && (
          <div className="flex flex-col" style={{ gap: "8px", marginTop: "24px" }}>
            {sePuedeReagendar({
              activa: true,
              tieneCitaConFecha: Boolean(citaRelevante(reclamo)?.fecha),
            }) && (
              <button
                onClick={() => setCancelarAbierto(true)}
                className="w-full border-none transition-all active:scale-[0.99]"
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
                {STR.seguimiento.reagendar}
              </button>
            )}
            <button
              onClick={() => setCancelarAbierto(true)}
              className="w-full border transition-all active:scale-[0.99]"
              style={{
                height: "44px",
                backgroundColor: "var(--primary-white)",
                borderColor: "var(--gray-20)",
                borderRadius: "12px",
                ...meta,
                fontSize: "14px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--primary-black)",
                cursor: "pointer",
              }}
            >
              {STR.seguimiento.contactar}
            </button>
          </div>
        )}

        {/* Cancelación: acción secundaria y discreta, solo mientras el caso
            sigue activo. Abre un popup de contacto (nunca WhatsApp directo);
            la cancelación real la gestiona backoffice manualmente. */}
        {estadoCaso !== "Completada" && estadoCaso !== "Cancelada" && (
          <button
            onClick={() => setCancelarAbierto(true)}
            className="block w-full text-center border-none bg-transparent"
            style={{
              ...meta,
              fontSize: "12px",
              color: "var(--gray-60)",
              textDecoration: "underline",
              margin: "20px 0 0",
              cursor: "pointer",
            }}
          >
            {STR.garantia.cancelarPregunta}
          </button>
        )}
      </section>

      <ContactarMiPRO
        abierto={cancelarAbierto}
        onCambio={setCancelarAbierto}
        descripcion={STR.garantia.cancelarContactoDetalle}
        linkWhatsApp={linkWhatsAppCancelacion(
          [CURRENT_USER.firstName, CURRENT_USER.lastName].filter(Boolean).join(" "),
          reclamo.numero,
        )}
        textoCerrar={STR.garantia.volver}
      />
    </div>
  );
}
